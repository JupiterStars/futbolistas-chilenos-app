/**
 * FCH Noticias - Componente InfiniteScroll
 * 
 * Componente para implementar scroll infinito con Intersection Observer.
 * Detecta cuando el usuario llega al final de la lista y carga más contenido.
 * 
 * @example
 * ```tsx
 * <InfiniteScroll
 *   onLoadMore={async () => {
 *     const newItems = await fetchMoreItems(page + 1);
 *     setItems(prev => [...prev, ...newItems]);
 *     setPage(p => p + 1);
 *   }}
 *   hasMore={hasMore}
 *   threshold={200}
 * >
 *   {items.map(item => <Card key={item.id} {...item} />)}
 * </InfiniteScroll>
 * ```
 * 
 * @module client/src/components/InfiniteScroll
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Props para el componente InfiniteScroll
 */
interface InfiniteScrollProps {
  /** Callback que se ejecuta cuando se debe cargar más contenido */
  onLoadMore: () => Promise<void>;
  /** Indica si hay más contenido para cargar */
  hasMore: boolean;
  /** Distancia en px desde el final para iniciar carga (default: 100) */
  threshold?: number;
  /** Componente personalizado de loader (opcional) */
  loader?: React.ReactNode;
  /** Contenido a renderizar */
  children: React.ReactNode;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Clases CSS adicionales para el loader */
  loaderClassName?: string;
  /** Si es true, carga contenido al hacer scroll hacia arriba (chat-style) */
  reverse?: boolean;
  /** Tiempo de debounce entre cargas en ms (default: 200) */
  debounceMs?: number;
}

/**
 * Componente InfiniteScroll - Scroll infinito con Intersection Observer
 * 
 * Características:
 * - Detección automática del final de la lista
 * - Debounce para evitar múltiples cargas simultáneas
 * - Loader personalizable
 * - Mensaje de "No hay más contenido"
 * - Soporte para scroll inverso (chat)
 * 
 * @param {InfiniteScrollProps} props - Props del componente
 * @returns {JSX.Element} Componente InfiniteScroll
 */
export function InfiniteScroll({
  onLoadMore,
  hasMore,
  threshold = 100,
  loader,
  children,
  className,
  loaderClassName,
  reverse = false,
  debounceMs = 200
}: InfiniteScrollProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // Debounced load more handler
  const handleLoadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore) return;
    
    isLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      await onLoadMore();
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      // Add small delay to prevent rapid successive calls
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        isLoadingRef.current = false;
        setIsLoading(false);
      }, debounceMs);
    }
  }, [onLoadMore, hasMore, debounceMs]);

  useEffect(() => {
    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Don't create observer if no more items
    if (!hasMore) {
      return;
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
          handleLoadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [hasMore, threshold, handleLoadMore]);

  const defaultLoader = (
    <div 
      className={cn(
        "flex items-center justify-center py-6 gap-3",
        loaderClassName
      )}
      role="status"
      aria-label="Cargando más contenido"
    >
      <Spinner className="w-5 h-5" />
      <span className="text-sm text-muted-foreground">Cargando...</span>
    </div>
  );

  return (
    <div className={className}>
      {children}
      
      {/* Sentinel element for intersection observer */}
      {hasMore && (
        <div
          ref={loadMoreRef}
          className={cn(
            "w-full",
            reverse && "order-first"
          )}
          aria-hidden="true"
        >
          {isLoading && (loader || defaultLoader)}
        </div>
      )}
      
      {/* End of list indicator */}
      {!hasMore && !isLoading && (
        <div 
          className="text-center py-6 text-sm text-muted-foreground"
          role="status"
        >
          No hay más contenido
        </div>
      )}
    </div>
  );
}
