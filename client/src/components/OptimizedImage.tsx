/**
 * Componente de imagen optimizado
 * FCH Noticias - OptimizedImage Component
 * 
 * Características:
 * - WebP/AVIF con fallback automático
 * - Lazy loading nativo del navegador
 * - Async decoding para mejor performance
 * - Srcset responsive automático
 * - Placeholder skeleton/blur durante carga
 * - Manejo de errores graceful
 * - Soporte para imágenes prioritarias (LCP)
 */

import { useState, useCallback, useRef, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useImageOptimization } from '@/hooks/useImageOptimization';
import type { OptimizedImageProps, PlaceholderType } from '@/types/image';

// ============================================================
// Componente Placeholder
// ============================================================

interface ImagePlaceholderProps {
  type: PlaceholderType;
  width?: number;
  height?: number;
  className?: string;
  aspectRatio?: number;
  fill?: boolean;
}

/**
 * Placeholder para mostrar mientras carga la imagen
 */
function ImagePlaceholder({
  type,
  width,
  height,
  className,
  aspectRatio,
  fill,
}: ImagePlaceholderProps) {
  // Calcular aspect ratio
  const ratio = aspectRatio || (width && height ? width / height : undefined);

  if (type === 'none') {
    return null;
  }

  if (type === 'blur') {
    return (
      <div
        className={cn(
          'absolute inset-0 bg-muted animate-pulse backdrop-blur-sm',
          className
        )}
        style={{
          aspectRatio: ratio,
        }}
      />
    );
  }

  // Skeleton placeholder (default)
  return (
    <Skeleton
      className={cn(
        'absolute inset-0 w-full h-full',
        !fill && ratio && 'relative',
        className
      )}
      style={{
        aspectRatio: ratio,
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
      }}
    />
  );
}

// ============================================================
// Componente Error Fallback
// ============================================================

interface ErrorFallbackProps {
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}

/**
 * Componente mostrado cuando la imagen falla al cargar
 */
function ErrorFallback({ alt, className, width, height, fill }: ErrorFallbackProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-muted/50 text-muted-foreground',
        fill ? 'absolute inset-0 w-full h-full' : 'relative',
        className
      )}
      style={{
        width: fill ? '100%' : width,
        height: fill ? '100%' : height,
        minHeight: fill ? undefined : 100,
      }}
    >
      <div className="flex flex-col items-center gap-2 p-4 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="text-xs opacity-70 line-clamp-2">{alt}</span>
      </div>
    </div>
  );
}

// ============================================================
// Componente Principal OptimizedImage
// ============================================================

/**
 * Props extendidas con ref para forwardRef
 */
export interface OptimizedImageComponentProps extends OptimizedImageProps {
  /** Ref para acceder al elemento img */
  imgRef?: React.RefObject<HTMLImageElement | null>;
}

/**
 * Componente de imagen optimizado con lazy loading y formatos modernos
 * 
 * @example
 * ```tsx
 * // Uso básico
 * <OptimizedImage src="/photo.jpg" alt="Descripción" />
 * 
 * // Imagen prioritaria (LCP)
 * <OptimizedImage src="/hero.jpg" alt="Hero" priority width={1200} height={600} />
 * 
 * // Con placeholder blur
 * <OptimizedImage src="/photo.jpg" alt="Descripción" placeholder="blur" />
 * 
 * // Responsive con sizes
 * <OptimizedImage 
 *   src="/photo.jpg" 
 *   alt="Descripción" 
 *   sizes="(max-width: 768px) 100vw, 50vw"
 * />
 * ```
 */
export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageComponentProps>(
  function OptimizedImage(
    {
      src,
      alt,
      width,
      height,
      className,
      priority = false,
      sizes = '100vw',
      placeholder = 'skeleton',
      format = 'auto',
      quality = 85,
      onLoad,
      onError,
      style,
      fill = false,
      fetchpriority,
      imgRef: externalImgRef,
    },
    forwardedRef
    ) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const internalRef = useRef<HTMLImageElement>(null);
    const imgRef = externalImgRef || internalRef;

    // Usar el hook de optimización
    const {
      optimizedSrc,
      srcSet,
      supportedFormat,
      isInViewport,
    } = useImageOptimization(src, {
      lazy: !priority,
      format,
      quality,
      width,
      responsive: true,
      rootMargin: '50px',
      threshold: 0.01,
    });

    // Calcular aspect ratio
    const aspectRatio = width && height ? width / height : undefined;

    // Handlers
    const handleLoad = useCallback(() => {
      setIsLoaded(true);
      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(() => {
      setHasError(true);
      onError?.();
    }, [onError]);

    // Determinar fetchpriority
    const imageFetchPriority = fetchpriority ?? (priority ? 'high' : 'auto');

    // Determinar loading
    const loading = priority ? 'eager' : 'lazy';

    // Determinar decoding
    const decoding = priority ? 'sync' : 'async';

    // Si hay error, mostrar fallback
    if (hasError) {
      return (
        <ErrorFallback
          alt={alt}
          className={className}
          width={width}
          height={height}
          fill={fill}
        />
      );
    }

    // Si no está en viewport aún (lazy loading), mostrar solo placeholder
    if (!priority && !isInViewport) {
      return (
        <div
          ref={imgRef as React.RefObject<HTMLDivElement>}
          className={cn(
            'relative overflow-hidden',
            fill ? 'absolute inset-0' : 'inline-block',
            className
          )}
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
            aspectRatio: fill ? undefined : aspectRatio,
            ...style,
          }}
        >
          <ImagePlaceholder
            type={placeholder}
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            fill={fill}
          />
        </div>
      );
    }

    return (
      <div
        className={cn(
          'relative overflow-hidden',
          fill ? 'absolute inset-0' : 'inline-block',
          className
        )}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          aspectRatio: fill ? undefined : aspectRatio,
          ...style,
        }}
      >
        {/* Placeholder (visible hasta que carga) */}
        {!isLoaded && placeholder !== 'none' && (
          <ImagePlaceholder
            type={placeholder}
            width={width}
            height={height}
            aspectRatio={aspectRatio}
            fill={fill}
            className={cn(
              'transition-opacity duration-300',
              isLoaded ? 'opacity-0' : 'opacity-100'
            )}
          />
        )}

        {/* Imagen optimizada */}
        <picture className="contents">
          {/* AVIF source (mejor compresión) */}
          {supportedFormat === 'avif' && (
            <source
              srcSet={srcSet}
              sizes={sizes}
              type="image/avif"
            />
          )}
          
          {/* WebP source (fallback moderno) */}
          {(supportedFormat === 'webp' || supportedFormat === 'avif') && (
            <source
              srcSet={srcSet}
              sizes={sizes}
              type="image/webp"
            />
          )}

          {/* Imagen principal */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img
            ref={forwardedRef || imgRef}
            src={optimizedSrc}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            loading={loading}
            decoding={decoding}
            fetchPriority={imageFetchPriority}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              'transition-opacity duration-300',
              fill ? 'w-full h-full object-cover' : '',
              isLoaded ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              width: fill ? '100%' : width,
              height: fill ? '100%' : height,
            }}
          />
        </picture>
      </div>
    );
  }
);

// Exportar tipos
export type { OptimizedImageProps };

// Default export
export default OptimizedImage;
