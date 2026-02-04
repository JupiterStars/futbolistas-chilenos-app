/**
 * Workbox Configuration for FCH Noticias PWA
 * 
 * Este archivo configura las estrategias de caché para:
 * - Precaching: Shell de la aplicación (HTML, JS, CSS core)
 * - Runtime caching: APIs, imágenes, fuentes
 * - Offline fallback: Página de respaldo cuando no hay conexión
 * 
 * @see https://developer.chrome.com/docs/workbox/modules/workbox-build
 */

module.exports = {
  // Directorio donde se encuentran los archivos compilados
  globDirectory: 'dist/',
  
  // Patrones de archivos para precaching (shell app)
  globPatterns: [
    '**/*.{html,js,css}',
    '**/*.{png,jpg,jpeg,webp,avif,svg,ico}',
    '**/*.json',
    'assets/**/*',
  ],
  
  // Destino del Service Worker generado
  swDest: 'dist/sw.js',
  
  // Nombre del archivo de source map (opcional)
  sourcemap: process.env.NODE_ENV !== 'production',
  
  // Modo de registro detallado en desarrollo
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Estrategias de runtime caching
  runtimeCaching: [
    // =============================================================================
    // APIs tRPC - NetworkFirst con fallback a caché
    // =============================================================================
    // Estrategia: Intenta red primero, si falla usa caché
    // Ideal para APIs que necesitan datos frescos pero funcionan offline
    {
      urlPattern: /\/api\/trpc\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache-v1',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        networkTimeoutSeconds: 3, // Timeout rápido para mejor UX
      },
    },
    
    // =============================================================================
    // Imágenes - CacheFirst
    // =============================================================================
    // Estrategia: Usa caché primero, si no está descarga y cachea
    // Ideal para imágenes que no cambian frecuentemente
    {
      urlPattern: /\.(?:png|jpg|jpeg|webp|avif|gif|svg)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache-v1',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        // Límite de tamaño: 50MB total
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              // Solo cachear respuestas menores a 5MB
              const contentLength = response.headers.get('content-length');
              if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
                return null;
              }
              return response;
            },
          },
        ],
      },
    },
    
    // =============================================================================
    // Google Fonts - CacheFirst con TTL largo
    // =============================================================================
    // Estrategia: Cache agresivo ya que las fuentes raramente cambian
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets-v1',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts-v1',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 año
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        // Precachear fuentes comunes
        matchOptions: {
          ignoreVary: true,
        },
      },
    },
    
    // =============================================================================
    // Archivos estáticos del sitio - StaleWhileRevalidate
    // =============================================================================
    // Estrategia: Sirve desde caché inmediatamente, actualiza en background
    // Ideal para JS/CSS que pueden actualizarse pero no son críticos
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources-v1',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    // =============================================================================
    // CDN externo (unpkg, cdnjs, etc.) - CacheFirst
    // =============================================================================
    {
      urlPattern: /^https:\/\/unpkg\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'unpkg-cache-v1',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 días
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
    
    // =============================================================================
    // Páginas HTML - NetworkFirst con fallback offline
    // =============================================================================
    // Intenta red primero para contenido dinámico, fallback a caché
    {
      urlPattern: /\/[^/]*$/i, // URLs que terminan en / o sin extensión
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache-v1',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 horas
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
        networkTimeoutSeconds: 2,
      },
    },
  ],
  
  // =============================================================================
  // Offline Fallback (navigateFallback en Workbox)
  // =============================================================================
  // Página a mostrar cuando no hay conexión ni caché disponible
  navigateFallback: '/offline.html',
  navigateFallbackDenylist: [/^\/api\//, /^\/__manus__\//],
  
  // =============================================================================
  // Skip Waiting
  // =============================================================================
  // Activa el nuevo SW inmediatamente sin esperar
  skipWaiting: true,
  
  // Toma control de todas las pestañas inmediatamente
  clientsClaim: true,
  
  // =============================================================================
  // Navigation Preload (opcional, mejora performance)
  // =============================================================================
  // Precarga navegación en paralelo con el SW
  navigationPreload: false, // Desactivado por compatibilidad con estrategias
  
  // =============================================================================
  // Cleanup Outdated Caches
  // =============================================================================
  // Limpia cachés antiguos automáticamente
  cleanupOutdatedCaches: true,
  
  // =============================================================================
  // Ignorar ciertos parámetros de URL para el caché
  // =============================================================================
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  
  // =============================================================================
  // ManifestTransforms (opcional)
  // =============================================================================
  // Transforma el manifest de precaching si es necesario
  manifestTransforms: [
    async (manifestEntries) => {
      // Puedes filtrar o modificar entradas aquí
      const manifest = manifestEntries.map((entry) => {
        // Asegurar que los archivos tengan revisiones correctas
        return entry;
      });
      return { manifest, warnings: [] };
    },
  ],
  
  // =============================================================================
  // Maximum File Size to Precache (en bytes)
  // =============================================================================
  // No precachear archivos mayores a 5MB
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
};
