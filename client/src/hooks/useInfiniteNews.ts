/**
 * FCH Noticias - Hook de Infinite Scroll para Noticias
 * 
 * Combina tRPC + InfiniteScroll + IndexedDB
 * Maneja paginación automática con soporte offline
 * 
 * @module client/src/hooks/useInfiniteNews
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useCachedNews } from './useCachedNews';
import { trpc } from '@/lib/trpc';
import { toast } from '@/lib/toast';

// ============================================================================
// TIPOS
// ============================================================================

export interface UseInfiniteNewsOptions {
  /** Número inicial de noticias por página */
  limit?: number;
  /** ID de categoría para filtrar */
  categoryId?: string;
  /** Si solo obtener noticias destacadas */
  featured?: boolean;
  /** Query de búsqueda */
  searchQuery?: string;
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

export interface UseInfiniteNewsReturn {
  /** Lista de noticias cargadas */
  data: NewsItem[];
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
  /** Función para cargar más noticias */
  loadMore: () => Promise<void>;
  /** Función para refrescar todo */
  refetch: () => Promise<void>;
  /** Página actual */
  page: number;
  /** Total estimado de noticias */
  totalCount: number;
}

// ============================================================================
// HOOK: useInfiniteNews
// ============================================================================

/**
 * Hook para infinite scroll de noticias
 * 
 * @example
 * ```tsx
 * const { data, isLoading, hasMore, loadMore } = useInfiniteNews({ limit: 12 });
 * 
 * return (
 *   <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
 *     <div className="grid">
 *       {data.map(news => <NewsCard key={news.id} news={news} />)}
 *     </div>
 *   </InfiniteScroll>
 * );
 * ```
 */
export function useInfiniteNews(options: UseInfiniteNewsOptions = {}): UseInfiniteNewsReturn {
  const { limit = 12, categoryId, featured = false, searchQuery } = options;
  
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allData, setAllData] = useState<NewsItem[]>([]);

  // Query de cache para offline
  const cachedResult = useCachedNews({
    limit: limit * page, // Cargar todas las páginas acumuladas
    categoryId,
    featured,
    autoRefresh: true,
  });

  // Query del servidor
  const serverResult = trpc.news.list.useQuery(
    { 
      limit: limit * page,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      featured,
    } as any,
    { 
      enabled: typeof window !== 'undefined' && navigator.onLine,
    }
  );

  // Calcular datos combinados
  const data = useMemo(() => {
    const serverData = serverResult.data as unknown as NewsItem[] | undefined;
    const cachedData = cachedResult.data as unknown as NewsItem[] | undefined;
    
    if (serverData && serverData.length > 0) {
      return serverData;
    }
    return cachedData || [];
  }, [serverResult.data, cachedResult.data]);

  // Aplicar filtro de búsqueda local si existe
  const filteredData = useMemo(() => {
    if (!searchQuery?.trim()) return data;
    
    const query = searchQuery.toLowerCase();
    return data.filter((item) => 
      item.title.toLowerCase().includes(query) ||
      item.excerpt?.toLowerCase().includes(query)
    );
  }, [data, searchQuery]);

  // Actualizar allData cuando cambian los datos
  useEffect(() => {
    if (data.length > 0) {
      setAllData(data);
    }
  }, [data]);

  // Calcular si hay más páginas
  const hasMore = useMemo(() => {
    // Si tenemos exactamente el límite solicitado, probablemente hay más
    const currentData = searchQuery ? filteredData : data;
    return currentData.length >= limit * page;
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
      console.error('[useInfiniteNews] Error loading more:', error);
      toast.error('Error al cargar más noticias');
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
    data: searchQuery ? filteredData : allData,
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

export default useInfiniteNews;
