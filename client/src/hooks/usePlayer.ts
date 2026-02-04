/**
 * FCH Noticias - Hook unificado para Jugadores
 * 
 * Combina tRPC + IndexedDB con fallback automático offline
 * Proporciona una interfaz simplificada para obtener jugadores
 * 
 * @module client/src/hooks/usePlayer
 */

import { useCallback, useMemo } from 'react';
import { useCachedPlayers, useCachedPlayerById, useCachedPlayerBySlug } from './useCachedPlayers';
import { trpc } from '@/lib/trpc';

// ============================================================================
// TIPOS
// ============================================================================

export interface UsePlayerOptions {
  /** Número de jugadores a obtener */
  limit?: number;
  /** Filtrar por posición */
  position?: string;
  /** Filtrar por equipo */
  team?: string;
  /** Ordenar por: rating, goals, assists, name */
  orderBy?: 'rating' | 'goals' | 'assists' | 'name';
  /** Si habilitar auto-refresh cuando vuelve conexión */
  autoRefresh?: boolean;
}

export interface UsePlayerByIdOptions {
  /** Si habilitar auto-refresh cuando vuelve conexión */
  autoRefresh?: boolean;
}

export interface PlayerItem {
  id: number;
  name: string;
  slug: string;
  imageUrl: string | null;
  position: string;
  jerseyNumber: number | null;
  nationality: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  preferredFoot: string | null;
  overallRating: number | string;
  marketValue: number | null;
  team?: {
    id: number;
    name: string;
    shortName: string | null;
  } | null;
  stats?: {
    goals: number;
    assists: number;
    matches: number;
    minutesPlayed: number;
    yellowCards: number;
    redCards: number;
  };
}

// ============================================================================
// HOOK: usePlayerList (Listado unificado)
// ============================================================================

/**
 * Hook unificado para obtener lista de jugadores
 * Combina datos de tRPC con cache de IndexedDB para soporte offline
 * 
 * @example
 * ```tsx
 * // Obtener todos los jugadores
 * const { data, isLoading } = usePlayerList({ limit: 20 });
 * 
 * // Filtrar por posición
 * const { data } = usePlayerList({ position: 'Delantero', limit: 10 });
 * 
 * // Ordenar por goles
 * const { data } = usePlayerList({ orderBy: 'goals' });
 * ```
 */
export function usePlayerList(options: UsePlayerOptions = {}) {
  const { limit = 20, position, team, orderBy = 'rating', autoRefresh = true } = options;
  
  // Usar el hook de cache
  const cachedResult = useCachedPlayers({
    limit,
    position,
    team,
    autoRefresh,
    enabled: true,
  });

  // También obtener datos frescos del servidor
  const serverResult = trpc.players.list.useQuery(
    { limit: 100, position, orderBy } as any,
    { enabled: typeof window !== 'undefined' && navigator.onLine }
  );

  // Combinar datos
  const data = useMemo(() => {
    let players: PlayerItem[] = [];
    
    const serverItems = (serverResult.data as any)?.items || [];
    if (serverItems.length > 0) {
      players = serverItems.map((item: any) => ({
        ...(item.player || item),
        team: item.team || item.player?.team,
        stats: {
          goals: item.player?.goals || item.goals || 0,
          assists: item.player?.assists || item.assists || 0,
          matches: item.player?.matches || item.matches || 0,
          minutesPlayed: item.player?.minutesPlayed || item.minutesPlayed || 0,
          yellowCards: item.player?.yellowCards || item.yellowCards || 0,
          redCards: item.player?.redCards || item.redCards || 0,
        }
      }));
    } else if (cachedResult.data) {
      players = cachedResult.data as unknown as PlayerItem[];
    }

    // Aplicar ordenamiento si es necesario
    if (orderBy && players.length > 0) {
      const sorted = [...players];
      switch (orderBy) {
        case 'goals':
          sorted.sort((a, b) => (b.stats?.goals || 0) - (a.stats?.goals || 0));
          break;
        case 'assists':
          sorted.sort((a, b) => (b.stats?.assists || 0) - (a.stats?.assists || 0));
          break;
        case 'name':
          sorted.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'rating':
        default:
          sorted.sort((a, b) => Number(b.overallRating) - Number(a.overallRating));
          break;
      }
      return sorted.slice(0, limit);
    }

    return players.slice(0, limit);
  }, [serverResult.data, cachedResult.data, orderBy, limit]);

  const isLoading = serverResult.isLoading && cachedResult.isLoading;
  const isRefreshing = serverResult.isLoading && !cachedResult.isLoading;
  const error = serverResult.error || cachedResult.error;

  const refetch = useCallback(async () => {
    await cachedResult.refetch();
    if (navigator.onLine) {
      await serverResult.refetch();
    }
  }, [cachedResult, serverResult]);

  return {
    data,
    isLoading,
    isRefreshing,
    isFromCache: cachedResult.isFromCache && !serverResult.data,
    lastUpdated: cachedResult.lastUpdated,
    error,
    refetch,
    invalidate: cachedResult.invalidate,
  };
}

// ============================================================================
// HOOK: usePlayerById
// ============================================================================

/**
 * Hook para obtener un jugador por ID
 * 
 * @example
 * ```tsx
 * const { item, isLoading } = usePlayerById(playerId);
 * ```
 */
export function usePlayerById(playerId: string | undefined, options: UsePlayerByIdOptions = {}) {
  const { autoRefresh = true } = options;
  
  const cachedResult = useCachedPlayerById(playerId, { autoRefresh });
  
  const serverResult = trpc.players.getById.useQuery(
    { id: playerId ? parseInt(playerId) : 0 } as any,
    { enabled: !!playerId && navigator.onLine }
  );

  const item = useMemo(() => {
    if (serverResult.data) {
      const data = serverResult.data as any;
      return {
        ...data.player,
        team: data.team,
      } as PlayerItem;
    }
    if (cachedResult.item) {
      return {
        ...cachedResult.item,
        team: cachedResult.item.team,
      } as unknown as PlayerItem;
    }
    return null;
  }, [serverResult.data, cachedResult.item]);

  return {
    item,
    isLoading: cachedResult.isLoading,
    isRefreshing: cachedResult.isRefreshing,
    isFromCache: cachedResult.isFromCache,
    lastUpdated: cachedResult.lastUpdated,
    error: cachedResult.error || serverResult.error,
    refetch: cachedResult.refetch,
    invalidate: cachedResult.invalidate,
  };
}

// ============================================================================
// HOOK: usePlayerBySlug
// ============================================================================

/**
 * Hook para obtener un jugador por slug
 * 
 * @example
 * ```tsx
 * const { item, isLoading } = usePlayerBySlug('nombre-del-jugador');
 * ```
 */
export function usePlayerBySlug(slug: string | undefined, options: UsePlayerByIdOptions = {}) {
  const { autoRefresh = true } = options;
  
  const cachedResult = useCachedPlayerBySlug(slug, { autoRefresh });
  
  const serverResult = trpc.players.getBySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug && navigator.onLine }
  );

  const item = useMemo(() => {
    if (serverResult.data) {
      const data = serverResult.data as any;
      return {
        ...data.player,
        team: data.team,
      } as PlayerItem;
    }
    if (cachedResult.item) {
      return {
        ...cachedResult.item,
        team: cachedResult.item.team,
      } as unknown as PlayerItem;
    }
    return null;
  }, [serverResult.data, cachedResult.item]);

  return {
    item,
    isLoading: cachedResult.isLoading,
    isRefreshing: cachedResult.isRefreshing,
    isFromCache: cachedResult.isFromCache,
    lastUpdated: cachedResult.lastUpdated,
    error: cachedResult.error || serverResult.error,
    refetch: cachedResult.refetch,
    invalidate: cachedResult.invalidate,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default usePlayerList;
