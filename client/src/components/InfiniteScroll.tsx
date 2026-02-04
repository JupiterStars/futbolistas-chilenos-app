import { useEffect, useRef, useCallback, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface InfiniteScrollProps {
  onLoadMore: () => Promise<void>;
  hasMore: boolean;
  threshold?: number;
  loader?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  loaderClassName?: string;
  reverse?: boolean;
  debounceMs?: number;
}

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
