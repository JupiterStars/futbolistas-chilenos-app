/**
 * Exportaciones de hooks personalizados
 * FCH Noticias - Custom Hooks Exports
 */

// Image Optimization Hook
export { 
  useImageOptimization,
  usePreloadImage,
  usePreloadImages,
  detectFormatSupport,
  getBestFormat,
  generateSrcSet,
  getOptimizedUrl,
} from './useImageOptimization';

export type { UseImageOptimizationOptions } from './useImageOptimization';

// Other hooks
export { useComposition } from './useComposition';
export { usePWA, registerServiceWorker as registerPWALegacy } from './usePWA';
export { usePersistFn } from './usePersistFn';

// Service Worker Hook (PWA con Workbox)
export {
  useServiceWorker,
  registerServiceWorker,
  unregisterServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
} from './useServiceWorker';

export type {
  ServiceWorkerState,
  ServiceWorkerActions,
} from './useServiceWorker';

// IndexedDB / Offline Hooks
export {
  useOfflineData,
  useNetworkStatus,
  useBackgroundSync,
  type OfflineDataState,
  type OfflineDataActions,
} from './useOfflineData';

export {
  useCachedNews,
  useCachedNewsById,
  useCachedNewsBySlug,
  type UseCachedNewsOptions,
  type UseCachedNewsState,
  type UseCachedNewsActions,
} from './useCachedNews';

export {
  useCachedPlayers,
  useCachedPlayerById,
  useCachedPlayerBySlug,
  useCachedPlayersByTeam,
  type UseCachedPlayersOptions,
  type UseCachedPlayersState,
  type UseCachedPlayersActions,
} from './useCachedPlayers';
