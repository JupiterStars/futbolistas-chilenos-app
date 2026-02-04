# Image Optimization Guide - FCH Noticias

Guía completa para usar el sistema de optimización de imágenes en el proyecto FCH Noticias.

## 📋 Índice

1. [Componente OptimizedImage](#componente-optimizedimage)
2. [Hook useImageOptimization](#hook-useimageoptimization)
3. [Guía de Migración](#guía-de-migración)
4. [Ejemplos por Contexto](#ejemplos-por-contexto)
5. [Configuración Avanzada](#configuración-avanzada)
6. [Performance Tips](#performance-tips)

---

## Componente OptimizedImage

El componente `OptimizedImage` es un reemplazo drop-in para la etiqueta `<img>` con optimizaciones automáticas.

### Props

```typescript
interface OptimizedImageProps {
  src: string;                    // URL de la imagen (requerido)
  alt: string;                    // Texto alternativo (requerido)
  width?: number;                 // Ancho de la imagen
  height?: number;                // Alto de la imagen
  className?: string;             // Clases CSS adicionales
  priority?: boolean;             // Imagen prioritaria (LCP)
  sizes?: string;                 // Atributo sizes para responsive
  placeholder?: 'blur' | 'skeleton' | 'none';  // Tipo de placeholder
  format?: 'webp' | 'avif' | 'auto';           // Formato preferido
  quality?: number;               // Calidad (0-100), default: 85
  fill?: boolean;                 // Rellenar contenedor
  fetchpriority?: 'high' | 'low' | 'auto';     // Prioridad de fetch
}
```

### Uso Básico

```tsx
import { OptimizedImage } from '@/components/OptimizedImage';

// Reemplazo simple de <img>
<OptimizedImage 
  src="/uploads/noticia-123.jpg" 
  alt="Gol de Chile contra Argentina"
  width={800}
  height={450}
/>
```

### Imágenes Prioritarias (Above the Fold)

Las imágenes que aparecen inmediatamente al cargar la página deben usar `priority`:

```tsx
// Hero image - carga inmediata
<OptimizedImage 
  src="/hero-portada.jpg" 
  alt="Portada FCH Noticias"
  priority
  width={1200}
  height={600}
/>

// Logo - siempre visible
<OptimizedImage 
  src="/logo-fch.png" 
  alt="Logo FCH"
  priority
  width={150}
  height={50}
/>
```

### Placeholders

Elige el tipo de placeholder según el contexto:

```tsx
// Skeleton (default) - mejor para listas
<OptimizedImage 
  src="/noticia.jpg" 
  alt="Noticia"
  placeholder="skeleton"
/>

// Blur - mejor para hero images
<OptimizedImage 
  src="/hero.jpg" 
  alt="Hero"
  placeholder="blur"
/>

// None - sin placeholder
<OptimizedImage 
  src="/icono.png" 
  alt="Icono"
  placeholder="none"
/>
```

### Imágenes Responsive

```tsx
// Con sizes personalizado
<OptimizedImage 
  src="/noticia.jpg" 
  alt="Noticia"
  sizes="(max-width: 768px) 100vw, 50vw"
  width={800}
  height={450}
/>

// Rellenar contenedor
<div className="relative w-full h-64">
  <OptimizedImage 
    src="/noticia.jpg" 
    alt="Noticia"
    fill
    className="object-cover rounded-lg"
  />
</div>
```

---

## Hook useImageOptimization

Hook avanzado para casos de uso personalizados.

### API

```typescript
const {
  optimizedSrc,     // URL optimizada
  srcSet,          // Srcset generado
  supportedFormat, // Formato detectado
  isLoading,       // Estado de carga
  hasError,        // Si hubo error
  isInViewport,    // Si está en viewport
} = useImageOptimization(src, {
  lazy?: boolean;      // Default: true
  format?: ImageFormat; // Default: 'auto'
  quality?: number;     // Default: 85
  width?: number;
  responsive?: boolean; // Default: true
  breakpoints?: number[];
  rootMargin?: string;  // Default: '50px'
  threshold?: number;   // Default: 0.01
});
```

### Uso

```tsx
import { useImageOptimization } from '@/hooks/useImageOptimization';

function CustomImage({ src, alt }) {
  const { optimizedSrc, srcSet, isInViewport } = useImageOptimization(src, {
    lazy: true,
    quality: 90,
  });

  return (
    <img
      src={isInViewport ? optimizedSrc : undefined}
      srcSet={isInViewport ? srcSet : undefined}
      alt={alt}
      loading="lazy"
    />
  );
}
```

### Funciones Auxiliares

```typescript
import { 
  detectFormatSupport, 
  getBestFormat,
  generateSrcSet,
  getOptimizedUrl,
  usePreloadImage,
  usePreloadImages 
} from '@/hooks/useImageOptimization';

// Detectar soporte de formatos
const support = detectFormatSupport();
console.log(support.webp); // true/false
console.log(support.avif); // true/false

// Obtener mejor formato
const format = getBestFormat('auto'); // 'avif', 'webp', o 'jpeg'

// Generar srcset manualmente
const srcSet = generateSrcSet({
  src: '/imagen.jpg',
  widths: [320, 640, 1024],
  format: 'webp',
  quality: 85,
});

// Precargar imagen
const { loaded, error } = usePreloadImage('/imagen.jpg');

// Precargar múltiples imágenes
const progress = usePreloadImages(['/img1.jpg', '/img2.jpg', '/img3.jpg']);
```

---

## Guía de Migración

### Paso 1: Reemplazar `<img>` simples

**Antes:**
```tsx
<img 
  src={noticia.image} 
  alt={noticia.title}
  className="w-full h-48 object-cover rounded-lg"
/>
```

**Después:**
```tsx
<OptimizedImage 
  src={noticia.image} 
  alt={noticia.title}
  width={800}
  height={384}
  className="w-full h-48 object-cover rounded-lg"
/>
```

### Paso 2: Imágenes en tarjetas

**Antes:**
```tsx
<div className="card">
  <img src={noticia.image} alt={noticia.title} />
  <h3>{noticia.title}</h3>
</div>
```

**Después:**
```tsx
<div className="card">
  <OptimizedImage 
    src={noticia.image} 
    alt={noticia.title}
    width={400}
    height={225}
    placeholder="skeleton"
  />
  <h3>{noticia.title}</h3>
</div>
```

### Paso 3: Hero/Portada (LCP)

**Antes:**
```tsx
<img 
  src="/hero.jpg" 
  alt="Portada"
  className="w-full h-[500px] object-cover"
/>
```

**Después:**
```tsx
<OptimizedImage 
  src="/hero.jpg" 
  alt="Portada"
  priority
  width={1200}
  height={500}
  sizes="100vw"
  placeholder="blur"
  className="w-full h-[500px] object-cover"
/>
```

### Paso 4: Logos e iconos

**Antes:**
```tsx
<img src={team.logo} alt={team.name} className="w-10 h-10" />
```

**Después:**
```tsx
<OptimizedImage 
  src={team.logo} 
  alt={team.name}
  width={40}
  height={40}
  placeholder="none"
  className="w-10 h-10 object-contain"
/>
```

### Paso 5: Imágenes con object-fit

**Antes:**
```tsx
<div className="relative w-full h-64">
  <img 
    src={player.photo} 
    alt={player.name}
    className="absolute inset-0 w-full h-full object-cover"
  />
</div>
```

**Después:**
```tsx
<div className="relative w-full h-64">
  <OptimizedImage 
    src={player.photo} 
    alt={player.name}
    fill
    className="object-cover"
  />
</div>
```

---

## Ejemplos por Contexto

### 1. Lista de Noticias

```tsx
function NewsList({ noticias }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {noticias.map((noticia, index) => (
        <article key={noticia.id} className="card">
          {/* Primera imagen: prioridad alta */}
          <OptimizedImage 
            src={noticia.image} 
            alt={noticia.title}
            width={400}
            height={225}
            priority={index === 0}
            placeholder="skeleton"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <h3>{noticia.title}</h3>
          <p>{noticia.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

### 2. Detalle de Jugador

```tsx
function PlayerDetail({ player }) {
  return (
    <div className="player-profile">
      {/* Foto principal - prioridad alta */}
      <div className="relative w-48 h-48 rounded-full overflow-hidden">
        <OptimizedImage 
          src={player.photo} 
          alt={player.name}
          priority
          fill
          placeholder="blur"
          className="object-cover"
        />
      </div>
      
      {/* Equipo - prioridad baja */}
      <div className="flex items-center gap-2">
        <OptimizedImage 
          src={player.team.logo} 
          alt={player.team.name}
          width={32}
          height={32}
          placeholder="none"
          className="w-8 h-8 object-contain"
        />
        <span>{player.team.name}</span>
      </div>
    </div>
  );
}
```

### 3. Galería de Fotos

```tsx
function PhotoGallery({ photos }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <div key={photo.id} className="aspect-square relative">
          <OptimizedImage 
            src={photo.url} 
            alt={photo.caption}
            fill
            priority={index < 4} // Solo las primeras 4 son prioritarias
            placeholder="skeleton"
            className="object-cover rounded-lg hover:scale-105 transition-transform"
          />
        </div>
      ))}
    </div>
  );
}
```

### 4. Header/Navbar

```tsx
function Navbar() {
  return (
    <nav className="navbar">
      {/* Logo - siempre prioritario */}
      <Link to="/">
        <OptimizedImage 
          src="/logo-fch.png" 
          alt="FCH Noticias"
          priority
          width={150}
          height={50}
          placeholder="none"
        />
      </Link>
    </nav>
  );
}
```

### 5. Búsqueda con Resultados

```tsx
function SearchResults({ results }) {
  return (
    <div className="search-results">
      {results.map((result, index) => (
        <div key={result.id} className="result-item">
          {result.image && (
            <OptimizedImage 
              src={result.image} 
              alt={result.title}
              width={120}
              height={80}
              placeholder="skeleton"
              sizes="120px"
            />
          )}
          <div className="result-content">
            <h4>{result.title}</h4>
            <p>{result.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Configuración Avanzada

### Configuración Global

Crea un archivo de configuración en `src/config/image.ts`:

```typescript
import type { ImageOptimizationConfig } from '@/types/image';

export const imageConfig: ImageOptimizationConfig = {
  cdnDomain: 'https://cdn.fchnoticias.cl',
  defaultQuality: 85,
  defaultPlaceholder: 'skeleton',
  defaultBreakpoints: [320, 640, 768, 1024, 1280, 1536, 1920],
  defaultLazy: true,
};
```

### Breakpoints Personalizados

```tsx
const CUSTOM_BREAKPOINTS = [200, 400, 600, 800];

<OptimizedImage 
  src="/imagen.jpg"
  alt="Descripción"
  sizes="(max-width: 400px) 200px, (max-width: 800px) 400px, 800px"
  // Internamente usa los breakpoints para srcset
/>
```

### CDN Integration

Si usas un CDN para imágenes:

```typescript
// En tu hook o componente
function getCdnUrl(src: string, options: { width?: number; format?: string }) {
  const { width, format } = options;
  const params = new URLSearchParams();
  
  if (width) params.append('w', width.toString());
  if (format) params.append('f', format);
  
  return `https://cdn.tudominio.com/${src}?${params.toString()}`;
}
```

---

## Performance Tips

### 1. Prioriza las Imágenes LCP

Las imágenes "Largest Contentful Paint" deben tener `priority`:

```tsx
// ✅ Bien - Hero image con priority
<OptimizedImage src="/hero.jpg" priority ... />

// ❌ Mal - Sin priority, retrasa LCP
<OptimizedImage src="/hero.jpg" ... />
```

### 2. Usa Dimensiones Correctas

Siempre proporciona `width` y `height` para evitar CLS (Cumulative Layout Shift):

```tsx
// ✅ Bien - Con dimensiones
<OptimizedImage src="/foto.jpg" width={800} height={450} ... />

// ⚠️ Aceptable - Con fill (requiere contenedor con tamaño)
<div className="w-full h-64 relative">
  <OptimizedImage src="/foto.jpg" fill ... />
</div>
```

### 3. Sizes Apropiados

El atributo `sizes` ayuda al navegador a elegir la imagen correcta:

```tsx
// ✅ Bien - Sizes específico
<OptimizedImage 
  src="/foto.jpg"
  sizes="(max-width: 768px) 100vw, 50vw"
  ...
/>

// ❌ Mal - Sin sizes, puede descargar imagen muy grande
<OptimizedImage src="/foto.jpg" ... />
```

### 4. Lazy Loading para Imágenes Below the Fold

```tsx
// ✅ Bien - Imágenes debajo del fold sin priority
<div className="noticias-lista">
  {noticias.map((noticia, index) => (
    <OptimizedImage 
      key={noticia.id}
      src={noticia.image}
      priority={index < 3} // Solo las primeras 3 son prioritarias
      ...
    />
  ))}
</div>
```

### 5. Placeholder Skeleton para Listas

```tsx
// ✅ Bien - Skeleton en listas para mejor UX
<OptimizedImage src="/foto.jpg" placeholder="skeleton" ... />

// ✅ Bien - Blur en hero images
<OptimizedImage src="/hero.jpg" placeholder="blur" priority ... />
```

### 6. Precarga de Imágenes Críticas

```tsx
import { usePreloadImages } from '@/hooks/useImageOptimization';

function Gallery({ images }) {
  // Precargar las primeras 3 imágenes
  const preloadProgress = usePreloadImages(
    images.slice(0, 3).map(img => img.url)
  );
  
  return (
    <div>
      {preloadProgress < 1 && (
        <div>Cargando imágenes... {Math.round(preloadProgress * 100)}%</div>
      )}
      {/* ... */}
    </div>
  );
}
```

---

## Chequeo de Implementación

### Lista de Verificación

- [ ] Todas las imágenes usan `OptimizedImage`
- [ ] Imágenes LCP tienen `priority`
- [ ] Todas las imágenes tienen `width` y `height` o `fill`
- [ ] Atributo `alt` descriptivo en todas las imágenes
- [ ] `sizes` definido para imágenes responsive
- [ ] Placeholder apropiado según contexto

### Testing

```bash
# Verificar en DevTools
1. Abre DevTools > Network > Img
2. Recarga la página
3. Verifica que:
   - Las imágenes LCP cargan primero
   - Se usan formatos WebP/AVIF
   - Los tamaños son apropiados
   - Hay lazy loading (defer para imágenes below fold)
```

### Métricas a Monitorear

- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 1.8s

---

## Troubleshooting

### Imágenes no cargan

```tsx
// Verifica que la URL sea correcta
<OptimizedImage 
  src="/uploads/imagen.jpg"  // ✅ Ruta absoluta desde public
  // src="uploads/imagen.jpg"   // ❌ Ruta relativa puede fallar
  alt="Descripción"
/>
```

### Layout Shift (CLS)

```tsx
// Solución: Siempre proporciona dimensiones
// ✅ Con width/height
<OptimizedImage src="/foto.jpg" width={800} height={450} />

// ✅ O con contenedor dimensionado + fill
<div className="w-full h-64 relative">
  <OptimizedImage src="/foto.jpg" fill />
</div>
```

### Imágenes borrosas

```tsx
// Aumenta la calidad si es necesario
<OptimizedImage src="/foto.jpg" quality={90} ... />
```

---

## Actualizaciones Futuras

- [ ] Soporte para imágenes con efecto blur-up progresivo
- [ ] Integración con CDN para transformaciones on-the-fly
- [ ] Soporte para AVIF con fallback más robusto
- [ ] Componente ImageCarousel con precarga inteligente
