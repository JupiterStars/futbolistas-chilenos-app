/**
 * @fileoverview FCH Noticias - Custom Hooks Index
 * 
 * Este archivo exporta todos los custom hooks del proyecto.
 * Todos los hooks están documentados con JSDoc para mejor autocompletado.
 * 
 * @module client/src/hooks
 * @version 1.0.0
 * @license MIT
 */

// ============================================================================
// HOOKS DE DATOS Y CACHE
// ============================================================================

/**
 * Hook para obtener noticias con soporte offline.
 * Cachea datos en IndexedDB y sincroniza con el servidor.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, isFromCache, refetch } = useCachedNews({
 *   limit: 20,
 *   featured: true
 * });
 * ```
 */
export { useCachedNews, useCachedNewsById, useCachedNewsBySlug } from './useCachedNews';
export type { UseCachedNewsOptions, UseCachedNewsState, UseCachedNewsActions } from './useCachedNews';

/**
 * Hook para obtener jugadores con soporte offline.
 * Similar a useCachedNews pero optimizado para jugadores.
 * 
 * @example
 * ```tsx
 * const { data, isLoading, refetch } = useCachedPlayers({
 *   limit: 50,
 *   position: 'Delantero'
 * });
 * ```
 */
export { useCachedPlayers, useCachedPlayerById, useCachedPlayerBySlug, useCachedPlayersByTeam } from './useCachedPlayers';
export type { UseCachedPlayersOptions, UseCachedPlayersState, UseCachedPlayersActions } from './useCachedPlayers';

// ============================================================================
// HOOKS DE OFFLINE Y SINCRONIZACIÓN
// ============================================================================

/**
 * Hook para gestionar estado de conexión y sincronización.
 * Maneja cola de sincronización, limpieza automática y estadísticas.
 * 
 * @example
 * ```tsx
 * const { isOnline, pendingSyncCount, syncNow, clearCache } = useOfflineData();
 * ```
 */
export { useOfflineData, useNetworkStatus, useBackgroundSync } from './useOfflineData';
export type { OfflineDataState, OfflineDataActions } from './useOfflineData';

/**
 * Hook para gestionar el Service Worker y PWA.
 * Incluye registro, actualizaciones, background sync y comunicación.
 * 
 * @example
 * ```tsx
 * const { isUpdated, updateApp, syncFavorites } = useServiceWorker();
 * ```
 */
export { useServiceWorker } from './useServiceWorker';
export type { ServiceWorkerState, ServiceWorkerActions } from './useServiceWorker';

// ============================================================================
// HOOKS DE UI Y UTILIDADES
// ============================================================================

/**
 * Hook para gestión de Progressive Web App.
 * Detecta instalación, estado offline y maneja el prompt de instalación.
 * 
 * @example
 * ```tsx
 * const { isInstallable, isInstalled, installApp } = usePWA();
 * ```
 */
export { usePWA, registerServiceWorker as registerPWAServiceWorker } from './usePWA';

/**
 * Hook para optimización de imágenes.
 * Detecta formatos soportados, genera srcset y maneja lazy loading.
 * 
 * @example
 * ```tsx
 * const { optimizedSrc, srcSet, isLoading } = useImageOptimization(src, {
 *   format: 'webp',
 *   quality: 85,
 *   lazy: true
 * });
 * ```
 */
export { 
  useImageOptimization, 
  usePreloadImage, 
  usePreloadImages,
  detectFormatSupport,
  getBestFormat,
  generateSrcSet,
  getOptimizedUrl
} from './useImageOptimization';
export type { UseImageOptimizationOptions } from './useImageOptimization';

// ============================================================================
// HOOKS DE DATOS (LEGACY - usar useCachedNews/useCachedPlayers)
// ============================================================================

/**
 * @deprecated Usar useCachedNews en su lugar
 */
export { useNews } from './useNews';

/**
 * @deprecated Usar useCachedPlayers en su lugar
 */
export { usePlayer } from './usePlayer';

// ============================================================================
// HOOKS DE INFINITE SCROLL
// ============================================================================

/**
 * Hook para scroll infinito de noticias.
 * @deprecated Usar useCachedNews con paginación
 */
export { useInfiniteNews } from './useInfiniteNews';

/**
 * Hook para scroll infinito de jugadores.
 * @deprecated Usar useCachedPlayers con paginación
 */
export { useInfinitePlayers } from './useInfinitePlayers';

// ============================================================================
// HOOKS DE UTILIDADES
// ============================================================================

/**
 * Hook para persistir funciones en referencias.
 * Útil para evitar recreación de callbacks en effects.
 */
export { usePersistFn } from './usePersistFn';

/**
 * Hook para gestión de composición de eventos.
 * Útil para inputs que combinan múltiples fuentes de datos.
 */
export { useComposition } from './useComposition';
