/**
 * FCH Noticias - Hook de Infinite Scroll para Jugadores
 * 
 * Combina tRPC + InfiniteScroll + IndexedDB
 * Maneja paginación automática con soporte offline
 * 
 * @module client/src/hooks/useInfinitePlayers
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCachedPlayers } from './useCachedPlayers';
import { trpc } from '@/lib/trpc';
import { toast } from '@/lib/toast';

// ============================================================================
// TIPOS
// ============================================================================

export interface UseInfinitePlayersOptions {
  /** Número inicial de jugadores por página */
  limit?: number;
  /** Filtrar por posición */
  position?: string;
  /** Filtrar por equipo */
  team?: string;
  /** Ordenar por: rating, goals, assists, name */
  orderBy?: 'rating' | 'goals' | 'assists' | 'name';
  /** Query de búsqueda */
  searchQuery?: string;
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
  overallRating: number | string;
  team?: {
    id: number;
    name: string;
    shortName: string | null;
  } | null;
  stats?: {
    goals: number;
    assists: number;
    matches: number;
  };
}

export interface UseInfinitePlayersReturn {
  /** Lista de jugadores cargados */
  data: PlayerItem[];
  /** Si está cargando la página inicial */
  isLoading: boolean;
  /** Si está cargando más páginas */
  isLoadingMore: boolean;
  /** Si hay más páginas disponibles */
  hasMore: boolean;
  /** Error si lo hay */
  error: Error | null;
  /** Si los datos vienen del cache */
  isFromCache: boolean;
  /** Función para cargar más jugadores */
  loadMore: () => Promise<void>;
  /** Función para refrescar todo */
  refetch: () => Promise<void>;
  /** Página actual */
  page: number;
  /** Total estimado de jugadores */
  totalCount: number;
}

// ============================================================================
// HOOK: useInfinitePlayers
// ============================================================================

/**
 * Hook para infinite scroll de jugadores
 * 
 * @example
 * ```tsx
 * const { data, isLoading, hasMore, loadMore } = useInfinitePlayers({ 
 *   limit: 16,
 *   position: 'Delantero',
 *   orderBy: 'goals'
 * });
 * 
 * return (
 *   <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
 *     <div className="grid">
 *       {data.map(player => <PlayerCard key={player.id} player={player} />)}
 *     </div>
 *   </InfiniteScroll>
 * );
 * ```
 */
export function useInfinitePlayers(options: UseInfinitePlayersOptions = {}): UseInfinitePlayersReturn {
  const { limit = 16, position, team, orderBy = 'rating', searchQuery } = options;
  
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allData, setAllData] = useState<PlayerItem[]>([]);

  // Query de cache para offline
  const cachedResult = useCachedPlayers({
    limit: limit * page,
    position,
    team,
    autoRefresh: true,
  });

  // Query del servidor - cargar muchos para paginación local
  const serverResult = trpc.players.list.useQuery(
    { 
      limit: 100, // Cargar todos para ordenar localmente
      position,
      orderBy,
    } as any,
    { 
      enabled: typeof window !== 'undefined' && navigator.onLine,
    }
  );

  // Calcular datos combinados y ordenados
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
        }
      }));
    } else if (cachedResult.data) {
      players = cachedResult.data.map((item: any) => ({
        ...item,
        stats: {
          goals: item.goals || 0,
          assists: item.assists || 0,
          matches: item.matches || 0,
        }
      })) as PlayerItem[];
    }

    // Aplicar ordenamiento
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

    return sorted;
  }, [serverResult.data, cachedResult.data, orderBy]);

  // Aplicar filtro de búsqueda local si existe
  const filteredData = useMemo(() => {
    if (!searchQuery?.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((item) => 
      item.name.toLowerCase().includes(query) ||
      item.position.toLowerCase().includes(query) ||
      item.team?.name.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Actualizar allData cuando cambian los datos
  useEffect(() => {
    const currentSlice = data.slice(0, limit * page);
    if (currentSlice.length > 0) {
      setAllData(currentSlice);
    }
  }, [data, limit, page]);

  // Calcular si hay más páginas
  const hasMore = useMemo(() => {
    const currentData = searchQuery ? filteredData : data;
    const totalPages = Math.ceil(currentData.length / limit);
    return page < totalPages;
  }, [data, filteredData, limit, page, searchQuery]);

  // Función para cargar más
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      setPage(nextPage);
      
      // Si estamos online, refrescar para obtener más datos
      if (navigator.onLine) {
        await serverResult.refetch();
      }
      
      // Notificar al usuario si estamos offline
      if (!navigator.onLine) {
        toast.info('Modo offline: Mostrando datos cacheados', {
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('[useInfinitePlayers] Error loading more:', error);
      toast.error('Error al cargar más jugadores');
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, serverResult]);

  // Función para refrescar
  const refetch = useCallback(async () => {
    setPage(1);
    await cachedResult.refetch();
    if (navigator.onLine) {
      await serverResult.refetch();
    }
  }, [cachedResult, serverResult]);

  // Auto-refetch cuando vuelve la conexión
  useEffect(() => {
    const handleOnline = () => {
      toast.success('¡Conexión restaurada! Sincronizando...', { duration: 2000 });
      serverResult.refetch();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [serverResult]);

  const isLoading = cachedResult.isLoading && page === 1;
  const isFromCache = cachedResult.isFromCache && !serverResult.data;
  const error = (serverResult.error || cachedResult.error) as Error | null;

  return {
    data: searchQuery ? filteredData.slice(0, limit * page) : allData,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    isFromCache,
    loadMore,
    refetch,
    page,
    totalCount: data.length,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useInfinitePlayers;
