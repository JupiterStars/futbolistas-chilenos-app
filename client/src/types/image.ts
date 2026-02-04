/**
 * Tipos para el sistema de optimización de imágenes
 * FCH Noticias - Image Optimization Types
 */

/** Tipo de placeholder mientras carga la imagen */
export type PlaceholderType = 'blur' | 'skeleton' | 'none';

/** Formato de imagen soportado */
export type ImageFormat = 'webp' | 'avif' | 'jpeg' | 'png' | 'auto';

/** Densidad de píxeles para srcset */
export type PixelDensity = '1x' | '2x' | '3x';

/** Tamaños predefinidos para imágenes responsive */
export type ImageSize = 320 | 640 | 768 | 1024 | 1280 | 1536 | 1920;

/** Props del componente OptimizedImage */
export interface OptimizedImageProps {
  /** URL de la imagen */
  src: string;
  /** Texto alternativo para accesibilidad */
  alt: string;
  /** Ancho de la imagen (para aspect ratio) */
  width?: number;
  /** Alto de la imagen (para aspect ratio) */
  height?: number;
  /** Clases CSS adicionales */
  className?: string;
  /** Imagen prioritara (above the fold) - no usa lazy loading */
  priority?: boolean;
  /** Tamaños para el atributo sizes */
  sizes?: string;
  /** Tipo de placeholder mientras carga */
  placeholder?: PlaceholderType;
  /** Formato preferido (auto detecta el mejor) */
  format?: ImageFormat;
  /** Calidad de compresión (0-100) */
  quality?: number;
  /** Callback cuando la imagen carga */
  onLoad?: () => void;
  /** Callback cuando hay error */
  onError?: () => void;
  /** Objeto de estilos inline */
  style?: React.CSSProperties;
  /** Rellenar el contenedor (object-fit: cover) */
  fill?: boolean;
  /** Prioridad de carga (fetchpriority) */
  fetchpriority?: 'high' | 'low' | 'auto';
}

/** Configuración de breakpoints para srcset */
export interface BreakpointConfig {
  /** Ancho en píxeles */
  width: number;
  /** Descriptor para srcset (ej: '320w') */
  descriptor: string;
  /** Condición media query opcional */
  media?: string;
}

/** Estado del hook useImageOptimization */
export interface ImageOptimizationState {
  /** URL de la imagen optimizada */
  optimizedSrc: string;
  /** Srcset generado */
  srcSet: string | undefined;
  /** Formato detectado como soportado */
  supportedFormat: ImageFormat;
  /** Si está cargando */
  isLoading: boolean;
  /** Si hay error */
  hasError: boolean;
  /** Si está en viewport (para lazy loading) */
  isInViewport: boolean;
}

/** Opciones para generar srcset */
export interface SrcSetOptions {
  /** URL base de la imagen */
  src: string;
  /** Anchos a generar */
  widths?: number[];
  /** Calidad */
  quality?: number;
  /** Formato */
  format?: ImageFormat;
}

/** Resultado de detección de formato soportado */
export interface FormatSupport {
  webp: boolean;
  avif: boolean;
  jpeg: boolean;
  png: boolean;
}

/** Configuración global de optimización */
export interface ImageOptimizationConfig {
  /** Dominio CDN para imágenes */
  cdnDomain?: string;
  /** Calidad por defecto */
  defaultQuality: number;
  /** Placeholder por defecto */
  defaultPlaceholder: PlaceholderType;
  /** Breakpoints por defecto */
  defaultBreakpoints: number[];
  /** Si usar lazy loading por defecto */
  defaultLazy: boolean;
}

/** Props para el componente ImagePlaceholder */
export interface ImagePlaceholderProps {
  /** Tipo de placeholder */
  type: PlaceholderType;
  /** Ancho */
  width?: number;
  /** Alto */
  height?: number;
  /** Clases adicionales */
  className?: string;
  /** Ratio de aspecto (ej: 16/9) */
  aspectRatio?: number;
}

/** Evento de carga de imagen */
export interface ImageLoadEvent {
  /** Si cargó exitosamente */
  success: boolean;
  /** Tiempo de carga en ms */
  loadTime?: number;
  /** Formato final usado */
  format?: ImageFormat;
  /** Tamaño en bytes (si disponible) */
  size?: number;
}
