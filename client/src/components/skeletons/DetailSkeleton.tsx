import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DetailSkeletonProps {
  variant?: "news" | "player" | "generic";
  className?: string;
}

export function DetailSkeleton({ 
  variant = "generic",
  className 
}: DetailSkeletonProps) {
  // News Detail Skeleton
  if (variant === "news") {
    return (
      <div 
        className={cn("space-y-8", className)}
        aria-label="Cargando noticia"
        role="status"
      >
        {/* Back button */}
        <Skeleton className="h-10 w-28" />

        {/* Hero image */}
        <Skeleton className="h-[300px] md:h-[400px] w-full rounded-xl" />

        {/* Title */}
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-4/5" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pb-8 border-b border-border">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-28" />
        </div>

        {/* Content paragraphs */}
        <div className="space-y-4 max-w-none">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>

        {/* Comments section */}
        <div className="mt-12 pt-8 border-t border-border space-y-6">
          <Skeleton className="h-8 w-40" />
          
          {/* Comment items */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Player Detail Skeleton
  if (variant === "player") {
    return (
      <div 
        className={cn("space-y-8", className)}
        aria-label="Cargando jugador"
        role="status"
      >
        {/* Back button */}
        <Skeleton className="h-10 w-40" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Card */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl overflow-hidden border border-border">
              {/* Image */}
              <Skeleton className="aspect-[3/4] w-full" />
              
              <div className="p-4 space-y-4">
                {/* Action buttons */}
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-10" />
                </div>
                
                {/* Info items */}
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 pb-4">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-28" />
            </div>

            {/* Stats Card */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <Skeleton className="h-7 w-48" />
              
              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-muted rounded-lg p-4 space-y-2">
                    <Skeleton className="w-5 h-5 mx-auto" />
                    <Skeleton className="h-7 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>

              {/* Discipline section */}
              <div className="pt-6 border-t border-border space-y-4">
                <Skeleton className="h-5 w-24" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full rounded-lg" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </div>
            </div>

            {/* Skills Card */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <Skeleton className="h-7 w-40" />
              <Skeleton className="h-[300px] w-full" />
              
              {/* Skill bars */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-muted rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-14" />
                      <Skeleton className="h-4 w-6" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Generic Detail Skeleton
  return (
    <div 
      className={cn("space-y-8", className)}
      aria-label="Cargando contenido"
      role="status"
    >
      {/* Hero */}
      <Skeleton className="h-[400px] w-full rounded-xl" />

      {/* Title */}
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-3/4" />
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-24" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-4/5" />
      </div>
    </div>
  );
}
