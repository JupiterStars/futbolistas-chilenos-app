/**
 * FCH Noticias - Hook de Jugadores Cacheados
 * 
 * Hook para obtener jugadores con soporte offline. Similar a useCachedNews
 * pero optimizado para la entidad Player.
 * 
 * @module client/src/hooks/useCachedPlayers
 */

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '../lib/trpc';
import {
  getCachedPlayers,
  getCachedPlayerById,
  getCachedPlayerBySlug,
  getCachedPlayersByTeam,
  cachePlayer,
  type CachedPlayer,
} from '../lib/db';

// ============================================================================
// TIPOS
// ============================================================================

export interface UseCachedPlayersOptions {
  /** Si se debe habilitar el caché offline */
  enabled?: boolean;
  /** Número de jugadores a obtener */
  limit?: number;
  /** Filtrar por posición */
  position?: string;
  /** Filtrar por equipo */
  team?: string;
  /** Si debe refrescar automáticamente cuando vuelve la conexión */
  autoRefresh?: boolean;
}

export interface UseCachedPlayersState {
  /** Lista de jugadores */
  data: CachedPlayer[];
  /** Jugador individual (si se busca por ID/slug) */
  item: CachedPlayer | null;
  /** Si está cargando datos */
  isLoading: boolean;
  /** Si se está refrescando (hay datos pero se actualizan) */
  isRefreshing: boolean;
  /** Error si lo hay */
  error: Error | unknown | null;
  /** Si los datos vienen del caché local */
  isFromCache: boolean;
  /** Timestamp del último fetch exitoso */
  lastUpdated: Date | null;
}

export interface UseCachedPlayersActions {
  /** Refrescar datos manualmente */
  refetch: () => Promise<void>;
  /** Invalidar el caché y recargar */
  invalidate: () => Promise<void>;
}

// ============================================================================
// HOOK: useCachedPlayers (Listado)
// ============================================================================

export function useCachedPlayers(
  options: UseCachedPlayersOptions = {}
): UseCachedPlayersState & UseCachedPlayersActions {
  const {
    enabled = true,
    limit = 20,
    position,
    team,
    autoRefresh = true,
  } = options;
  
  // Estado
  const [state, setState] = useState<UseCachedPlayersState>({
    data: [],
    item: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    isFromCache: false,
    lastUpdated: null,
  });
  
  // Query de tRPC
  const trpcQuery = trpc.players.list.useQuery(
    {
      limit,
      position,
    },
    {
      enabled: enabled && navigator.onLine,
      retry: 2,
    }
  );
  
  // ============================================================================
  // CARGA INICIAL
  // ============================================================================
  
  useEffect(() => {
    if (!enabled) return;
    
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Si estamos offline, cargar directamente del caché
        if (!navigator.onLine) {
          console.log('[useCachedPlayers] Offline mode: loading from cache');
          let cachedData: CachedPlayer[] = [];
          
          if (team) {
            cachedData = await getCachedPlayersByTeam(team);
          } else {
            cachedData = await getCachedPlayers(limit);
          }
          
          // Filtrar por posición si es necesario
          if (position) {
            cachedData = cachedData.filter(p => 
              p.position?.toLowerCase().includes(position.toLowerCase())
            );
          }
          
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isFromCache: true,
            lastUpdated: cachedData.length > 0 
              ? new Date(Math.max(...cachedData.map(p => p.cachedAt)))
              : null,
          }));
          return;
        }
        
        // Si estamos online, mostrar caché mientras tanto
        const cachedData = await getCachedPlayers(limit);
        
        if (cachedData.length > 0) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isFromCache: true,
            lastUpdated: new Date(Math.max(...cachedData.map(p => p.cachedAt))),
          }));
        }
      } catch (error) {
        console.error('[useCachedPlayers] Failed to load cached data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to load data'),
        }));
      }
    };
    
    loadData();
  }, [enabled, limit, position, team]);
  
  // ============================================================================
  // SINCRONIZACIÓN CON tRPC
  // ============================================================================
  
  useEffect(() => {
    if (!enabled || !trpcQuery.data) return;
    
    const syncData = async () => {
      try {
        const serverData = Array.isArray(trpcQuery.data) 
          ? trpcQuery.data 
          : []
        
        if (serverData.length === 0) return;
        
        // Cachear los datos del servidor
        await cachePlayer(serverData as unknown as import('../../../server/db/schema').Player[]);
        
        // Actualizar estado con datos frescos
        setState(prev => ({
          ...prev,
          data: serverData as unknown as CachedPlayer[],
          isLoading: false,
          isRefreshing: false,
          isFromCache: false,
          lastUpdated: new Date(),
          error: null,
        }));
        
        console.log('[useCachedPlayers] Data synced from server:', serverData.length, 'items');
      } catch (error) {
        console.error('[useCachedPlayers] Failed to sync with server:', error);
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          error: error instanceof Error ? error : new Error('Sync failed'),
        }));
      }
    };
    
    syncData();
  }, [enabled, trpcQuery.data]);
  
  // ============================================================================
  // MANEJO DE ERRORES
  // ============================================================================
  
  useEffect(() => {
    if (trpcQuery.error) {
      console.error('[useCachedPlayers] tRPC error:', trpcQuery.error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: trpcQuery.error || new Error('Failed to fetch from server') as unknown as Error,
      }));
    }
  }, [trpcQuery.error]);
  
  // ============================================================================
  // AUTO-REFRESH
  // ============================================================================
  
  useEffect(() => {
    if (!enabled || !autoRefresh) return;
    
    const handleOnline = () => {
      console.log('[useCachedPlayers] Connection restored, refreshing...');
      setState(prev => ({ ...prev, isRefreshing: true }));
      trpcQuery.refetch();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [enabled, autoRefresh, trpcQuery]);
  
  // ============================================================================
  // ACCIONES
  // ============================================================================
  
  const refetch = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    if (navigator.onLine) {
      await trpcQuery.refetch();
    } else {
      const cachedData = await getCachedPlayers(limit);
      setState(prev => ({
        ...prev,
        data: cachedData,
        isRefreshing: false,
        isFromCache: true,
      }));
    }
  }, [trpcQuery, limit]);
  
  const invalidate = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await trpcQuery.refetch();
  }, [trpcQuery]);
  
  return {
    ...state,
    refetch,
    invalidate,
  };
}

// ============================================================================
// HOOK: useCachedPlayerById
// ============================================================================

export function useCachedPlayerById(
  playerId: string | undefined,
  options: Omit<UseCachedPlayersOptions, 'limit' | 'position' | 'team'> = {}
): Omit<UseCachedPlayersState, 'data'> & UseCachedPlayersActions {
  const { enabled = true, autoRefresh = true } = options;
  
  const [state, setState] = useState<Omit<UseCachedPlayersState, 'data'>>({
    item: null,
    isLoading: !!playerId,
    isRefreshing: false,
    error: null,
    isFromCache: false,
    lastUpdated: null,
  });
  
  // Query de tRPC
  const trpcQuery = trpc.players.getById.useQuery(
    { id: playerId ? parseInt(playerId) : 0 },
    {
      enabled: enabled && !!playerId && navigator.onLine,
      retry: 2,
    }
  );
  
  // Carga inicial
  useEffect(() => {
    if (!enabled || !playerId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Intentar cargar del caché primero
        const cachedItem = await getCachedPlayerById(playerId);
        
        if (cachedItem) {
          setState(prev => ({
            ...prev,
            item: cachedItem,
            isLoading: !navigator.onLine,
            isFromCache: true,
            lastUpdated: new Date(cachedItem.cachedAt),
          }));
        }
        
        if (!navigator.onLine && !cachedItem) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error('No cached data available offline'),
          }));
        }
      } catch (error) {
        console.error('[useCachedPlayerById] Failed to load cached item:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to load data'),
        }));
      }
    };
    
    loadData();
  }, [enabled, playerId]);
  
  // Sincronización con tRPC
  useEffect(() => {
    if (!enabled || !trpcQuery.data) return;
    
    const syncData = async () => {
      try {
        const serverData = trpcQuery.data;
        
        // Cachear el dato del servidor
        await cachePlayer(serverData as unknown as import('../../../server/db/schema').Player);
        
        setState(prev => ({
          ...prev,
          item: serverData as unknown as CachedPlayer,
          isLoading: false,
          isRefreshing: false,
          isFromCache: false,
          lastUpdated: new Date(),
          error: null,
        }));
      } catch (error) {
        console.error('[useCachedPlayerById] Failed to sync:', error);
      }
    };
    
    syncData();
  }, [enabled, trpcQuery.data]);
  
  // Auto-refresh
  useEffect(() => {
    if (!enabled || !autoRefresh) return;
    
    const handleOnline = () => {
      if (playerId) {
        setState(prev => ({ ...prev, isRefreshing: true }));
        trpcQuery.refetch();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [enabled, autoRefresh, playerId, trpcQuery]);
  
  const refetch = useCallback(async () => {
    if (!playerId) return;
    
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    if (navigator.onLine) {
      await trpcQuery.refetch();
    } else {
      const cachedItem = await getCachedPlayerById(playerId);
      setState(prev => ({
        ...prev,
        item: cachedItem || null,
        isRefreshing: false,
        isFromCache: true,
      }));
    }
  }, [trpcQuery, playerId]);
  
  const invalidate = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await trpcQuery.refetch();
  }, [trpcQuery]);
  
  return {
    ...state,
    refetch,
    invalidate,
  };
}

// ============================================================================
// HOOK: useCachedPlayerBySlug
// ============================================================================

export function useCachedPlayerBySlug(
  slug: string | undefined,
  options: Omit<UseCachedPlayersOptions, 'limit' | 'position' | 'team'> = {}
): Omit<UseCachedPlayersState, 'data'> & UseCachedPlayersActions {
  const { enabled = true, autoRefresh = true } = options;
  
  const [state, setState] = useState<Omit<UseCachedPlayersState, 'data'>>({
    item: null,
    isLoading: !!slug,
    isRefreshing: false,
    error: null,
    isFromCache: false,
    lastUpdated: null,
  });
  
  // Query de tRPC
  const trpcQuery = trpc.players.getBySlug.useQuery(
    { slug: slug || '' },
    {
      enabled: enabled && !!slug && navigator.onLine,
      retry: 2,
    }
  );
  
  // Carga inicial
  useEffect(() => {
    if (!enabled || !slug) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Intentar cargar del caché primero
        const cachedItem = await getCachedPlayerBySlug(slug);
        
        if (cachedItem) {
          setState(prev => ({
            ...prev,
            item: cachedItem,
            isLoading: !navigator.onLine,
            isFromCache: true,
            lastUpdated: new Date(cachedItem.cachedAt),
          }));
        }
        
        if (!navigator.onLine && !cachedItem) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error('No cached data available offline'),
          }));
        }
      } catch (error) {
        console.error('[useCachedPlayerBySlug] Failed to load:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to load data'),
        }));
      }
    };
    
    loadData();
  }, [enabled, slug]);
  
  // Sincronización con tRPC
  useEffect(() => {
    if (!enabled || !trpcQuery.data) return;
    
    const syncData = async () => {
      try {
        const serverData = trpcQuery.data;
        await cachePlayer(serverData as unknown as import('../../../server/db/schema').Player);
        
        setState(prev => ({
          ...prev,
          item: serverData as unknown as CachedPlayer,
          isLoading: false,
          isRefreshing: false,
          isFromCache: false,
          lastUpdated: new Date(),
          error: null,
        }));
      } catch (error) {
        console.error('[useCachedPlayerBySlug] Failed to sync:', error);
      }
    };
    
    syncData();
  }, [enabled, trpcQuery.data]);
  
  const refetch = useCallback(async () => {
    if (!slug) return;
    
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    if (navigator.onLine) {
      await trpcQuery.refetch();
    } else {
      const cachedItem = await getCachedPlayerBySlug(slug);
      setState(prev => ({
        ...prev,
        item: cachedItem || null,
        isRefreshing: false,
        isFromCache: true,
      }));
    }
  }, [trpcQuery, slug]);
  
  const invalidate = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    await trpcQuery.refetch();
  }, [trpcQuery]);
  
  return {
    ...state,
    refetch,
    invalidate,
  };
}

// ============================================================================
// HOOK: useCachedPlayersByTeam
// ============================================================================

export function useCachedPlayersByTeam(
  team: string | undefined,
  options: Pick<UseCachedPlayersOptions, 'enabled' | 'autoRefresh'> = {}
): Pick<UseCachedPlayersState, 'data' | 'isLoading' | 'isRefreshing' | 'error' | 'isFromCache'> & UseCachedPlayersActions {
  const { enabled = true, autoRefresh = true } = options;
  
  const [state, setState] = useState<Pick<UseCachedPlayersState, 'data' | 'isLoading' | 'isRefreshing' | 'error' | 'isFromCache'>>({
    data: [],
    isLoading: !!team,
    isRefreshing: false,
    error: null,
    isFromCache: false,
  });
  
  // Carga inicial
  useEffect(() => {
    if (!enabled || !team) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        const cachedData = await getCachedPlayersByTeam(team);
        setState(prev => ({
          ...prev,
          data: cachedData,
          isLoading: false,
          isFromCache: true,
        }));
      } catch (error) {
        console.error('[useCachedPlayersByTeam] Failed to load:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to load data'),
        }));
      }
    };
    
    loadData();
  }, [enabled, team]);
  
  const refetch = useCallback(async () => {
    if (!team) return;
    
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    try {
      const cachedData = await getCachedPlayersByTeam(team);
      setState(prev => ({
        ...prev,
        data: cachedData,
        isRefreshing: false,
        isFromCache: true,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isRefreshing: false,
        error: error instanceof Error ? error : new Error('Failed to refetch'),
      }));
    }
  }, [team]);
  
  const invalidate = useCallback(async () => {
    await refetch();
  }, [refetch]);
  
  return {
    ...state,
    refetch,
    invalidate,
  };
}

export default useCachedPlayers;
