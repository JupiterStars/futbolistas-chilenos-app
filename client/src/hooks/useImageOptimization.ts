/**
 * Hook para optimización de imágenes
 * FCH Noticias - Image Optimization Hook
 * 
 * Características:
 * - Detección automática de soporte WebP/AVIF
 * - Generación de srcset responsive
 * - Intersection Observer para lazy loading
 * - Manejo de errores graceful
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type {
  ImageFormat,
  FormatSupport,
  SrcSetOptions,
  ImageOptimizationState,
} from '@/types/image';

// Breakpoints por defecto para srcset
const DEFAULT_BREAKPOINTS = [320, 640, 768, 1024, 1280, 1536];

// Cache de soporte de formatos
let formatSupportCache: FormatSupport | null = null;

/**
 * Detecta qué formatos de imagen soporta el navegador
 * @returns Objeto con soporte de cada formato
 */
export function detectFormatSupport(): FormatSupport {
  if (formatSupportCache) {
    return formatSupportCache;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  const support: FormatSupport = {
    webp: false,
    avif: false,
    jpeg: true,
    png: true,
  };

  // Detectar WebP
  try {
    const webpData = canvas.toDataURL('image/webp');
    support.webp = webpData.indexOf('data:image/webp') === 0;
  } catch {
    support.webp = false;
  }

  // Detectar AVIF (más ligero que WebP)
  // AVIF tiene mejor compresión pero menor soporte
  if (support.webp) {
    // Solo verificamos AVIF si soporta WebP (navegador moderno)
    try {
      const avifData = canvas.toDataURL('image/avif');
      support.avif = avifData.indexOf('data:image/avif') === 0;
    } catch {
      support.avif = false;
    }
  }

  formatSupportCache = support;
  return support;
}

/**
 * Obtiene el mejor formato soportado
 * @param preferredFormat Formato preferido o 'auto' para detección automática
 * @returns El mejor formato disponible
 */
export function getBestFormat(preferredFormat: ImageFormat = 'auto'): ImageFormat {
  if (preferredFormat !== 'auto') {
    const support = detectFormatSupport();
    if (support[preferredFormat]) {
      return preferredFormat;
    }
  }

  const support = detectFormatSupport();
  if (support.avif) return 'avif';
  if (support.webp) return 'webp';
  return 'jpeg';
}

/**
 * Genera un srcset responsive para una imagen
 * @param options Opciones para generar el srcset
 * @returns String con el srcset o undefined
 */
export function generateSrcSet(options: SrcSetOptions): string | undefined {
  const { src, widths = DEFAULT_BREAKPOINTS, format = 'auto' } = options;

  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return undefined;
  }

  // Si es una URL externa completa, no generamos srcset
  if (src.startsWith('http') && !src.includes(window.location.hostname)) {
    return undefined;
  }

  const bestFormat = format === 'auto' ? getBestFormat() : getBestFormat(format);
  
  // Generar URLs para cada breakpoint
  const urls = widths.map(width => {
    // Si la URL ya tiene query params, agregamos con &
    const separator = src.includes('?') ? '&' : '?';
    const url = `${src}${separator}w=${width}&f=${bestFormat}`;
    return `${url} ${width}w`;
  });

  return urls.join(', ');
}

/**
 * Convierte una URL a una versión optimizada
 * @param src URL original
 * @param format Formato deseado
 * @param width Ancho opcional
 * @param quality Calidad (1-100)
 * @returns URL optimizada
 */
export function getOptimizedUrl(
  src: string,
  format: ImageFormat = 'auto',
  width?: number,
  quality: number = 85
): string {
  if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  // Si es URL externa, devolvemos como está
  if (src.startsWith('http') && !src.includes(window.location.hostname)) {
    return src;
  }

  const bestFormat = format === 'auto' ? getBestFormat() : getBestFormat(format);
  const params = new URLSearchParams();
  
  params.append('f', bestFormat);
  params.append('q', quality.toString());
  
  if (width) {
    params.append('w', width.toString());
  }

  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}${params.toString()}`;
}

/**
 * Hook para optimización de imágenes
 * @param src URL de la imagen
 * @param options Opciones de optimización
 * @returns Estado de la optimización
 */
export interface UseImageOptimizationOptions {
  /** Habilitar lazy loading */
  lazy?: boolean;
  /** Formato preferido */
  format?: ImageFormat;
  /** Calidad (1-100) */
  quality?: number;
  /** Ancho de la imagen (para generar srcset) */
  width?: number;
  /** Generar srcset responsive */
  responsive?: boolean;
  /** Breakpoints personalizados */
  breakpoints?: number[];
  /** Root margin para intersection observer */
  rootMargin?: string;
  /** Umbral para intersection observer */
  threshold?: number;
}

export function useImageOptimization(
  src: string | undefined,
  options: UseImageOptimizationOptions = {}
): ImageOptimizationState {
  const {
    lazy = true,
    format = 'auto',
    quality = 85,
    width,
    responsive = true,
    breakpoints = DEFAULT_BREAKPOINTS,
    rootMargin = '50px',
    threshold = 0.01,
  } = options;

  const [isInViewport, setIsInViewport] = useState(!lazy);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [supportedFormat, setSupportedFormat] = useState<ImageFormat>('jpeg');
  
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Detectar formato soportado al montar
  useEffect(() => {
    setSupportedFormat(getBestFormat(format));
  }, [format]);

  // Configurar Intersection Observer para lazy loading
  useEffect(() => {
    if (!lazy || isInViewport || !src) {
      return;
    }

    const element = imageRef.current;
    if (!element) return;

    // Limpiar observer anterior si existe
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInViewport(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, isInViewport, src, rootMargin, threshold]);

  // Generar URL optimizada y srcset
  const optimizedSrc = useMemo(() => {
    if (!src) return '';
    return getOptimizedUrl(src, format, width, quality);
  }, [src, format, width, quality]);

  const srcSet = useMemo(() => {
    if (!src || !responsive) return undefined;
    return generateSrcSet({
      src,
      widths: breakpoints,
      format,
      quality,
    });
  }, [src, responsive, breakpoints, format, quality]);

  // Resetear estado cuando cambia la fuente
  useEffect(() => {
    if (src) {
      setHasError(false);
      setIsLoading(true);
    }
  }, [src]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  return {
    optimizedSrc,
    srcSet,
    supportedFormat,
    isLoading,
    hasError,
    isInViewport,
  };
}

/**
 * Hook simple para precargar una imagen
 * @param src URL de la imagen a precargar
 * @returns Estado de la precarga
 */
export function usePreloadImage(src: string | undefined): {
  loaded: boolean;
  error: boolean;
} {
  const [state, setState] = useState({ loaded: false, error: false });

  useEffect(() => {
    if (!src) {
      setState({ loaded: false, error: false });
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setState({ loaded: true, error: false });
    };
    
    img.onerror = () => {
      setState({ loaded: false, error: true });
    };

    img.src = src;

    // Si la imagen ya está en cache
    if (img.complete) {
      setState({ loaded: true, error: false });
    }

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return state;
}

/**
 * Hook para precargar múltiples imágenes
 * @param srcs Array de URLs a precargar
 * @returns Progreso de la precarga (0-1)
 */
export function usePreloadImages(srcs: string[]): number {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (srcs.length === 0) {
      setProgress(1);
      return;
    }

    let loaded = 0;
    const total = srcs.length;

    const updateProgress = () => {
      loaded++;
      setProgress(loaded / total);
    };

    const images = srcs.map((src) => {
      const img = new Image();
      img.onload = updateProgress;
      img.onerror = updateProgress; // Contar errores como completados
      img.src = src;
      
      // Si ya está en cache
      if (img.complete) {
        updateProgress();
      }
      
      return img;
    });

    return () => {
      images.forEach((img) => {
        img.onload = null;
        img.onerror = null;
      });
    };
  }, [srcs]);

  return progress;
}

export default useImageOptimization;
