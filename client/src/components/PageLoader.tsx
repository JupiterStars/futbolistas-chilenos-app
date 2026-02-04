/**
 * PageLoader - Componente de carga para Suspense
 * Muestra un skeleton animado mientras se cargan las páginas lazy
 */
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PageLoaderProps {
  /**
   * Clases CSS adicionales para personalizar el contenedor
   */
  className?: string;
  /**
   * Texto opcional a mostrar debajo del skeleton
   */
  message?: string;
}

/**
 * Componente de carga para mostrar mientras las páginas lazy se cargan
 * Diseñado para ser ligero (<5KB) y no afectar el FCP
 */
export function PageLoader({ className, message = "Cargando..." }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "min-h-screen flex flex-col items-center justify-center",
        "bg-background text-foreground",
        "animate-in fade-in duration-200",
        className
      )}
      role="status"
      aria-label="Cargando página"
      aria-live="polite"
    >
      <div className="w-full max-w-md px-6 space-y-4">
        {/* Logo placeholder */}
        <div className="flex justify-center mb-8">
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>

        {/* Header skeleton */}
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-4 w-1/2 mx-auto" />

        {/* Content skeletons */}
        <div className="space-y-3 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[90%]" />
          <Skeleton className="h-4 w-[80%]" />
        </div>

        {/* Card skeleton */}
        <div className="space-y-3 mt-6">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>

        {/* Loading text */}
        <p className="text-center text-sm text-muted-foreground animate-pulse mt-6">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * PageLoader minimal para usar en layouts o componentes pequeños
 */
export function MiniPageLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center p-8",
        "bg-background text-foreground",
        className
      )}
      role="status"
      aria-label="Cargando"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="absolute inset-0 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    </div>
  );
}

export default PageLoader;
