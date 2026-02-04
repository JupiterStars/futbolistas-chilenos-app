import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PlayerCardSkeletonProps {
  className?: string;
}

export function PlayerCardSkeleton({ className }: PlayerCardSkeletonProps) {
  return (
    <div 
      className={cn(
        "group bg-card rounded-xl overflow-hidden border border-border",
        className
      )}
      aria-label="Cargando jugador"
      role="status"
    >
      {/* Image Container */}
      <div className="aspect-[3/4] relative bg-muted">
        <Skeleton className="w-full h-full" />
        
        {/* Rating badge skeleton */}
        <div className="absolute top-4 right-4">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>

        {/* Player info overlay skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-4 w-8" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-4 grid grid-cols-3 gap-2 text-center border-t border-border">
        <div className="space-y-1">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-6 w-8 mx-auto" />
          <Skeleton className="h-3 w-10 mx-auto" />
        </div>
      </div>
    </div>
  );
}
