import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface NewsCardSkeletonProps {
  variant?: "default" | "compact" | "featured";
  className?: string;
}

export function NewsCardSkeleton({ 
  variant = "default",
  className 
}: NewsCardSkeletonProps) {
  if (variant === "compact") {
    return (
      <div 
        className={cn(
          "group bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5",
          className
        )}
        aria-label="Cargando noticia"
        role="status"
      >
        <div className="relative h-32 overflow-hidden bg-gray-100 dark:bg-white/5">
          <Skeleton className="w-full h-full" />
          {/* Category Badge Skeleton */}
          <div className="absolute top-2 left-2">
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex items-center justify-between pt-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "featured") {
    return (
      <div 
        className={cn(
          "group bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5",
          className
        )}
        aria-label="Cargando noticia destacada"
        role="status"
      >
        <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-white/5">
          <Skeleton className="w-full h-full" />
          {/* Category Badge Skeleton */}
          <div className="absolute top-4 left-4">
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          {/* Views Badge Skeleton */}
          <div className="absolute top-4 right-4">
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
        
        <div className="p-5 space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div 
      className={cn(
        "group bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5",
        className
      )}
      aria-label="Cargando noticia"
      role="status"
    >
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-white/5">
        <Skeleton className="w-full h-full" />
        {/* Category Badge Skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Views Badge Skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
    </div>
  );
}
