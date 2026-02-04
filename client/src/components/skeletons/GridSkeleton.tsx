import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface GridSkeletonProps {
  columns?: 1 | 2 | 3 | 4;
  items?: number;
  itemHeight?: "sm" | "md" | "lg";
  showImage?: boolean;
  className?: string;
}

export function GridSkeleton({ 
  columns = 4,
  items = 8,
  itemHeight = "md",
  showImage = true,
  className 
}: GridSkeletonProps) {
  const heightClasses = {
    sm: "h-32",
    md: "h-44",
    lg: "h-56"
  };

  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
  };

  return (
    <div 
      className={cn(
        "grid gap-4",
        gridCols[columns],
        className
      )}
      aria-label="Cargando grid"
      role="status"
    >
      {Array.from({ length: items }).map((_, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5"
        >
          {showImage && (
            <Skeleton className={cn("w-full", heightClasses[itemHeight])} />
          )}
          
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-4/5" />
            
            {/* Variación en el tercer elemento */}
            {index % 2 === 0 ? (
              <Skeleton className="h-3 w-2/3" />
            ) : (
              <Skeleton className="h-3 w-1/2" />
            )}
            
            {/* Metadata line */}
            <div className="flex items-center justify-between pt-1">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
