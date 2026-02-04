/**
 * FCH Noticias - Hook de Noticias Cacheadas
 * 
 * Hook para obtener noticias con soporte offline. Si hay conexión,
 * obtiene del servidor y cachea. Si no hay conexión, sirve desde IndexedDB.
 * 
 * @module client/src/hooks/useCachedNews
 */

import { useState, useEffect, useCallback } from 'react';
import { trpc } from '../lib/trpc';
import {
  getCachedNews,
  getCachedNewsById,
  getCachedNewsBySlug,
  getCachedFeaturedNews,
  getCachedNewsByCategory,
  cacheNews,
  type CachedNewsItem,
} from '../lib/db';

// ============================================================================
// TIPOS
// ============================================================================

export interface UseCachedNewsOptions {
  /** Si se debe habilitar el caché offline */
  enabled?: boolean;
  /** Número de noticias a obtener */
  limit?: number;
  /** ID de categoría para filtrar */
  categoryId?: string;
  /** Si solo obtener noticias destacadas */
  featured?: boolean;
  /** Si debe refrescar automáticamente cuando vuelve la conexión */
  autoRefresh?: boolean;
}

export interface UseCachedNewsState {
  /** Lista de noticias */
  data: CachedNewsItem[];
  /** Noticia individual (si se busca por ID/slug) */
  item: CachedNewsItem | null;
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

export interface UseCachedNewsActions {
  /** Refrescar datos manualmente */
  refetch: () => Promise<void>;
  /** Invalidar el caché y recargar */
  invalidate: () => Promise<void>;
}

// ============================================================================
// HOOK: useCachedNews (Listado)
// ============================================================================

export function useCachedNews(
  options: UseCachedNewsOptions = {}
): UseCachedNewsState & UseCachedNewsNewsActions {
  const {
    enabled = true,
    limit = 20,
    categoryId,
    featured = false,
    autoRefresh = true,
  } = options;
  
  // Estado
  const [state, setState] = useState<UseCachedNewsState>({
    data: [],
    item: null,
    isLoading: true,
    isRefreshing: false,
    error: null,
    isFromCache: false,
    lastUpdated: null,
  });
  
  // Query de tRPC
  const trpcQuery = trpc.news.list.useQuery(
    {
      limit,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      featured,
    } as any,
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
          console.log('[useCachedNews] Offline mode: loading from cache');
          let cachedData: CachedNewsItem[] = [];
          
          if (featured) {
            cachedData = await getCachedFeaturedNews(limit);
          } else if (categoryId) {
            cachedData = await getCachedNewsByCategory(categoryId, limit);
          } else {
            cachedData = await getCachedNews(limit);
          }
          
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isFromCache: true,
            lastUpdated: cachedData.length > 0 
              ? new Date(Math.max(...cachedData.map(n => n.cachedAt)))
              : null,
          }));
          return;
        }
        
        // Si estamos online, intentar cargar del servidor
        // Los datos de tRPC se manejan en el effect siguiente
        // Pero mientras tanto, mostramos caché si existe
        const cachedData = await getCachedNews(limit);
        
        if (cachedData.length > 0) {
          setState(prev => ({
            ...prev,
            data: cachedData,
            isLoading: false,
            isFromCache: true,
            lastUpdated: new Date(Math.max(...cachedData.map(n => n.cachedAt))),
          }));
        }
      } catch (error) {
        console.error('[useCachedNews] Failed to load cached data:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to load data'),
        }));
      }
    };
    
    loadData();
  }, [enabled, limit, categoryId, featured]);
  
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
        await cacheNews(serverData as unknown as import('../../../server/db/schema').NewsItem[]);
        
        // Actualizar estado con datos frescos
        setState(prev => ({
          ...prev,
          data: serverData as unknown as CachedNewsItem[],
          isLoading: false,
          isRefreshing: false,
          isFromCache: false,
          lastUpdated: new Date(),
          error: null,
        }));
        
        console.log('[useCachedNews] Data synced from server:', serverData.length, 'items');
      } catch (error) {
        console.error('[useCachedNews] Failed to sync with server:', error);
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
  // MANEJO DE ERRORES DE tRPC
  // ============================================================================
  
  useEffect(() => {
    if (trpcQuery.error) {
      console.error('[useCachedNews] tRPC error:', trpcQuery.error);
      
      // Si hay error pero tenemos datos cacheados, seguimos mostrándolos
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: trpcQuery.error || new Error('Failed to fetch from server') as unknown as Error,
      }));
    }
  }, [trpcQuery.error]);
  
  // ============================================================================
  // AUTO-REFRESH CUANDO VUELVE LA CONEXIÓN
  // ============================================================================
  
  useEffect(() => {
    if (!enabled || !autoRefresh) return;
    
    const handleOnline = () => {
      console.log('[useCachedNews] Connection restored, refreshing...');
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
      // Si estamos offline, solo recargar del caché
      const cachedData = await getCachedNews(limit);
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
// HOOK: useCachedNewsById
// ============================================================================

export function useCachedNewsById(
  newsId: string | undefined,
  options: Omit<UseCachedNewsOptions, 'limit' | 'categoryId' | 'featured'> = {}
): Omit<UseCachedNewsState, 'data'> & UseCachedNewsActions {
  const { enabled = true, autoRefresh = true } = options;
  
  const [state, setState] = useState<Omit<UseCachedNewsState, 'data'>>({
    item: null,
    isLoading: !!newsId,
    isRefreshing: false,
    error: null,
    isFromCache: false,
    lastUpdated: null,
  });
  
  // Query de tRPC
  const trpcQuery = trpc.news.getById.useQuery(
    { id: newsId ? parseInt(newsId) : 0 } as any,
    {
      enabled: enabled && !!newsId && navigator.onLine,
      retry: 2,
    }
  );
  
  // Carga inicial
  useEffect(() => {
    if (!enabled || !newsId) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    const loadData = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      try {
        // Intentar cargar del caché primero
        const cachedItem = await getCachedNewsById(newsId);
        
        if (cachedItem) {
          setState(prev => ({
            ...prev,
            item: cachedItem,
            isLoading: !navigator.onLine, // Si estamos offline, terminamos aquí
            isFromCache: true,
            lastUpdated: new Date(cachedItem.cachedAt),
          }));
        }
        
        // Si estamos offline y no hay caché, mostrar error
        if (!navigator.onLine && !cachedItem) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: new Error('No cached data available offline'),
          }));
        }
      } catch (error) {
        console.error('[useCachedNewsById] Failed to load cached item:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error : new Error('Failed to load data'),
        }));
      }
    };
    
    loadData();
  }, [enabled, newsId]);
  
  // Sincronización con tRPC
  useEffect(() => {
    if (!enabled || !trpcQuery.data) return;
    
    const syncData = async () => {
      try {
        const serverData = trpcQuery.data;
        
        // Cachear el dato del servidor
        await cacheNews(serverData as unknown as import('../../../server/db/schema').NewsItem);
        
        setState(prev => ({
          ...prev,
          item: serverData as unknown as CachedNewsItem,
          isLoading: false,
          isRefreshing: false,
          isFromCache: false,
          lastUpdated: new Date(),
          error: null,
        }));
      } catch (error) {
        console.error('[useCachedNewsById] Failed to sync:', error);
      }
    };
    
    syncData();
  }, [enabled, trpcQuery.data]);
  
  // Auto-refresh
  useEffect(() => {
    if (!enabled || !autoRefresh) return;
    
    const handleOnline = () => {
      if (newsId) {
        setState(prev => ({ ...prev, isRefreshing: true }));
        trpcQuery.refetch();
      }
    };
    
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [enabled, autoRefresh, newsId, trpcQuery]);
  
  const refetch = useCallback(async () => {
    if (!newsId) return;
    
    setState(prev => ({ ...prev, isRefreshing: true }));
    
    if (navigator.onLine) {
      await trpcQuery.refetch();
    } else {
      const cachedItem = await getCachedNewsById(newsId);
      setState(prev => ({
        ...prev,
        item: cachedItem || null,
        isRefreshing: false,
        isFromCache: true,
      }));
    }
  }, [trpcQuery, newsId]);
  
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
// HOOK: useCachedNewsBySlug
// ============================================================================

export function useCachedNewsBySlug(
  slug: string | undefined,
  options: Omit<UseCachedNewsOptions, 'limit' | 'categoryId' | 'featured'> = {}
): Omit<UseCachedNewsState, 'data'> & UseCachedNewsActions {
  const { enabled = true, autoRefresh = true } = options;
  
  const [state, setState] = useState<Omit<UseCachedNewsState, 'data'>>({
    item: null,
    isLoading: !!slug,
    isRefreshing: false,
    error: null,
    isFromCache: false,
    lastUpdated: null,
  });
  
  // Query de tRPC
  const trpcQuery = trpc.news.getBySlug.useQuery(
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
        const cachedItem = await getCachedNewsBySlug(slug);
        
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
        console.error('[useCachedNewsBySlug] Failed to load:', error);
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
        await cacheNews(serverData as unknown as import('../../../server/db/schema').NewsItem);
        
        setState(prev => ({
          ...prev,
          item: serverData as unknown as CachedNewsItem,
          isLoading: false,
          isRefreshing: false,
          isFromCache: false,
          lastUpdated: new Date(),
          error: null,
        }));
      } catch (error) {
        console.error('[useCachedNewsBySlug] Failed to sync:', error);
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
      const cachedItem = await getCachedNewsBySlug(slug);
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
// TIPO ADICIONAL PARA ACTIONS
// ============================================================================

interface UseCachedNewsNewsActions extends UseCachedNewsActions {}

export default useCachedNews;
