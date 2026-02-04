/**
 * FCH Noticias - Hook unificado para Noticias
 * 
 * Combina tRPC + IndexedDB con fallback automático offline
 * Proporciona una interfaz simplificada para obtener noticias
 * 
 * @module client/src/hooks/useNews
 */

import { useCallback, useMemo } from 'react';
import { useCachedNews, useCachedNewsById, useCachedNewsBySlug } from './useCachedNews';
import { trpc } from '@/lib/trpc';

// ============================================================================
// TIPOS
// ============================================================================

export interface UseNewsOptions {
  /** Número de noticias a obtener */
  limit?: number;
  /** ID de categoría para filtrar */
  categoryId?: string;
  /** Si solo obtener noticias destacadas */
  featured?: boolean;
  /** Si habilitar auto-refresh cuando vuelve conexión */
  autoRefresh?: boolean;
}

export interface UseNewsByIdOptions {
  /** Si habilitar auto-refresh cuando vuelve conexión */
  autoRefresh?: boolean;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  publishedAt: Date | string;
  views: number;
  isPremium: boolean;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
}

// ============================================================================
// HOOK: useNews (Listado unificado)
// ============================================================================

/**
 * Hook unificado para obtener noticias
 * Combina datos de tRPC con cache de IndexedDB para soporte offline
 * 
 * @example
 * ```tsx
 * // Obtener últimas noticias
 * const { data, isLoading, isFromCache } = useNews({ limit: 10 });
 * 
 * // Obtener noticias destacadas
 * const { data } = useNews({ featured: true, limit: 5 });
 * 
 * // Obtener por categoría
 * const { data } = useNews({ categoryId: '1', limit: 20 });
 * ```
 */
export function useNews(options: UseNewsOptions = {}) {
  const { limit = 20, categoryId, featured = false, autoRefresh = true } = options;
  
  // Usar el hook de cache que ya maneja online/offline
  const cachedResult = useCachedNews({
    limit,
    categoryId,
    featured,
    autoRefresh,
    enabled: true,
  });

  // También obtener datos frescos del servidor si estamos online
  const serverResult = trpc.news.list.useQuery(
    { limit, categoryId: categoryId ? parseInt(categoryId) : undefined, featured } as any,
    { enabled: typeof window !== 'undefined' && navigator.onLine }
  );

  // Combinar datos: servidor tiene prioridad, pero usamos cache como fallback
  const data = useMemo(() => {
    const serverData = (serverResult.data as any)?.items || [];
    if (serverData.length > 0) {
      return serverData as NewsItem[];
    }
    return cachedResult.data as unknown as NewsItem[];
  }, [serverResult.data, cachedResult.data]);

  const isLoading = serverResult.isLoading && cachedResult.isLoading;
  const isRefreshing = serverResult.isLoading && !cachedResult.isLoading;
  const error = serverResult.error || cachedResult.error;

  // Refetch manual
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
// HOOK: useNewsById
// ============================================================================

/**
 * Hook para obtener una noticia por ID
 * 
 * @example
 * ```tsx
 * const { item, isLoading } = useNewsById(newsId);
 * ```
 */
export function useNewsById(newsId: string | undefined, options: UseNewsByIdOptions = {}) {
  const { autoRefresh = true } = options;
  
  const cachedResult = useCachedNewsById(newsId, { autoRefresh });
  
  const serverResult = trpc.news.getById.useQuery(
    { id: newsId ? parseInt(newsId) : 0 } as any,
    { enabled: !!newsId && navigator.onLine }
  );

  const item = useMemo(() => {
    if (serverResult.data) {
      return serverResult.data as unknown as NewsItem;
    }
    return cachedResult.item as unknown as NewsItem | null;
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
// HOOK: useNewsBySlug
// ============================================================================

/**
 * Hook para obtener una noticia por slug
 * 
 * @example
 * ```tsx
 * const { item, isLoading } = useNewsBySlug('titulo-de-la-noticia');
 * ```
 */
export function useNewsBySlug(slug: string | undefined, options: UseNewsByIdOptions = {}) {
  const { autoRefresh = true } = options;
  
  const cachedResult = useCachedNewsBySlug(slug, { autoRefresh });
  
  const serverResult = trpc.news.getBySlug.useQuery(
    { slug: slug || '' },
    { enabled: !!slug && navigator.onLine }
  );

  const item = useMemo(() => {
    if (serverResult.data) {
      return serverResult.data as unknown as NewsItem;
    }
    return cachedResult.item as unknown as NewsItem | null;
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

export default useNews;
