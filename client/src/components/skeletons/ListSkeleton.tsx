import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ListSkeletonProps {
  items?: number;
  showAvatar?: boolean;
  showIcon?: boolean;
  linesPerItem?: 1 | 2 | 3;
  className?: string;
}

export function ListSkeleton({ 
  items = 5,
  showAvatar = false,
  showIcon = false,
  linesPerItem = 2,
  className 
}: ListSkeletonProps) {
  return (
    <div 
      className={cn("space-y-4", className)}
      aria-label="Cargando lista"
      role="status"
    >
      {Array.from({ length: items }).map((_, index) => (
        <div 
          key={index}
          className="flex items-start gap-3 p-3 rounded-lg bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5"
        >
          {showIcon && (
            <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          )}
          
          {showAvatar && (
            <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          )}
          
          <div className="flex-1 space-y-2 min-w-0">
            <Skeleton className="h-4 w-full" />
            {linesPerItem >= 2 && (
              <Skeleton 
                className={cn(
                  "h-3",
                  index % 3 === 0 ? "w-4/5" : index % 3 === 1 ? "w-3/5" : "w-2/3"
                )} 
              />
            )}
            {linesPerItem >= 3 && (
              <Skeleton className="h-3 w-1/2" />
            )}
          </div>
          
          {/* Action placeholder */}
          <Skeleton className="w-8 h-8 rounded-md shrink-0" />
        </div>
      ))}
    </div>
  );
}
