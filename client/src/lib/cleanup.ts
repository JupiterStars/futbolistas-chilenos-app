/**
 * FCH Noticias - Limpieza de Caché
 * 
 * Módulo para mantenimiento automático del caché de IndexedDB.
 * Elimina datos expirados y mantiene límites de almacenamiento.
 * 
 * @module client/src/lib/cleanup
 */

import { db, CACHE_EXPIRY_MS, MAX_CACHED_NEWS, MAX_CACHED_PLAYERS } from './db';

// ============================================================================
// CONSTANTES
// ============================================================================

/** Límite máximo de imágenes a mantener en caché */
const MAX_CACHED_IMAGES = 200;

/** Días antes de considerar un item como expirado */
const EXPIRY_DAYS = 7;

/** Store name para imágenes (usado en caché de service worker) */
const IMAGE_CACHE_NAME = 'fch-images-v1';

// ============================================================================
// LIMPIEZA DE ITEMS EXPIRADOS
// ============================================================================

/**
 * Elimina noticias, jugadores y categorías con más de 7 días de antigüedad
 */
export async function cleanupExpiredCache(): Promise<number> {
  const database = await db;
  const cutoffTime = Date.now() - CACHE_EXPIRY_MS;
  let removedCount = 0;
  
  console.log(`[Cleanup] Removing items cached before ${new Date(cutoffTime).toISOString()}`);
  
  // Limpiar noticias expiradas
  const newsTx = database.transaction('news', 'readwrite');
  const allNews = await newsTx.store.getAll();
  for (const item of allNews) {
    if (item.cachedAt < cutoffTime) {
      await newsTx.store.delete(item.id);
      removedCount++;
    }
  }
  await newsTx.done;
  
  // Limpiar jugadores expirados
  const playersTx = database.transaction('players', 'readwrite');
  const allPlayers = await playersTx.store.getAll();
  for (const item of allPlayers) {
    if (item.cachedAt < cutoffTime) {
      await playersTx.store.delete(item.id);
      removedCount++;
    }
  }
  await playersTx.done;
  
  // Limpiar categorías expiradas
  const categoriesTx = database.transaction('categories', 'readwrite');
  const allCategories = await categoriesTx.store.getAll();
  for (const item of allCategories) {
    if (item.cachedAt < cutoffTime) {
      await categoriesTx.store.delete(item.id);
      removedCount++;
    }
  }
  await categoriesTx.done;
  
  console.log(`[Cleanup] Removed ${removedCount} expired items`);
  return removedCount;
}

// ============================================================================
// CONTROL DE LÍMITES
// ============================================================================

/**
 * Mantiene el máximo de noticias permitidas eliminando las más antiguas
 */
export async function enforceMaxNewsLimit(maxNews: number = MAX_CACHED_NEWS): Promise<number> {
  const database = await db;
  
  const tx = database.transaction('news', 'readonly');
  const allNews = await tx.store.getAll();
  await tx.done;
  
  if (allNews.length <= maxNews) {
    return 0;
  }
  
  // Ordenar por fecha de caché (más antiguas primero)
  const sortedNews = allNews.sort((a, b) => a.cachedAt - b.cachedAt);
  const toRemove = sortedNews.slice(0, allNews.length - maxNews);
  
  const deleteTx = database.transaction('news', 'readwrite');
  for (const item of toRemove) {
    await deleteTx.store.delete(item.id);
  }
  await deleteTx.done;
  
  console.log(`[Cleanup] Removed ${toRemove.length} excess news items (limit: ${maxNews})`);
  return toRemove.length;
}

/**
 * Mantiene el máximo de jugadores permitidos
 */
export async function enforceMaxPlayersLimit(maxPlayers: number = MAX_CACHED_PLAYERS): Promise<number> {
  const database = await db;
  
  const tx = database.transaction('players', 'readonly');
  const allPlayers = await tx.store.getAll();
  await tx.done;
  
  if (allPlayers.length <= maxPlayers) {
    return 0;
  }
  
  // Ordenar por fecha de caché (más antiguas primero)
  const sortedPlayers = allPlayers.sort((a, b) => a.cachedAt - b.cachedAt);
  const toRemove = sortedPlayers.slice(0, allPlayers.length - maxPlayers);
  
  const deleteTx = database.transaction('players', 'readwrite');
  for (const item of toRemove) {
    await deleteTx.store.delete(item.id);
  }
  await deleteTx.done;
  
  console.log(`[Cleanup] Removed ${toRemove.length} excess player items (limit: ${maxPlayers})`);
  return toRemove.length;
}

// ============================================================================
// LIMPIEZA DE IMÁGENES
// ============================================================================

/**
 * Obtiene todas las URLs de imágenes referenciadas en el caché
 */
async function getReferencedImageUrls(): Promise<Set<string>> {
  const database = await db;
  const urls = new Set<string>();
  
  // Obtener URLs de noticias
  const newsTx = database.transaction('news', 'readonly');
  const allNews = await newsTx.store.getAll();
  for (const item of allNews) {
    if (item.imageUrl) {
      urls.add(item.imageUrl);
    }
  }
  await newsTx.done;
  
  // Obtener URLs de jugadores
  const playersTx = database.transaction('players', 'readonly');
  const allPlayers = await playersTx.store.getAll();
  for (const item of allPlayers) {
    if (item.imageUrl) {
      urls.add(item.imageUrl);
    }
  }
  await playersTx.done;
  
  return urls;
}

/**
 * Limpia imágenes huérfanas del caché del service worker
 * NOTA: Esto requiere que el service worker esté implementado
 */
export async function cleanupOrphanedImages(): Promise<number> {
  if (!('caches' in window)) {
    console.log('[Cleanup] Cache API not available');
    return 0;
  }
  
  try {
    const imageCache = await caches.open(IMAGE_CACHE_NAME);
    const cachedRequests = await imageCache.keys();
    const referencedUrls = await getReferencedImageUrls();
    
    let removedCount = 0;
    
    for (const request of cachedRequests) {
      const url = request.url;
      
      // Verificar si la URL está referenciada
      let isReferenced = false;
      const urlsArray = Array.from(referencedUrls);
    for (const refUrl of urlsArray) {
        if (url.includes(refUrl) || refUrl.includes(url)) {
          isReferenced = true;
          break;
        }
      }
      
      if (!isReferenced) {
        await imageCache.delete(request);
        removedCount++;
      }
    }
    
    console.log(`[Cleanup] Removed ${removedCount} orphaned images`);
    return removedCount;
  } catch (error) {
    console.error('[Cleanup] Failed to cleanup images:', error);
    return 0;
  }
}

/**
 * Limita el número de imágenes en caché
 */
export async function enforceMaxImagesLimit(maxImages: number = MAX_CACHED_IMAGES): Promise<number> {
  if (!('caches' in window)) {
    return 0;
  }
  
  try {
    const imageCache = await caches.open(IMAGE_CACHE_NAME);
    const cachedRequests = await imageCache.keys();
    
    if (cachedRequests.length <= maxImages) {
      return 0;
    }
    
    // Ordenar por fecha de acceso (requiere metadata adicional)
    // Por ahora, eliminamos las más antiguas basándonos en el orden
    const toRemove = cachedRequests.slice(0, cachedRequests.length - maxImages);
    
    for (const request of toRemove) {
      await imageCache.delete(request);
    }
    
    console.log(`[Cleanup] Removed ${toRemove.length} excess images (limit: ${maxImages})`);
    return toRemove.length;
  } catch (error) {
    console.error('[Cleanup] Failed to enforce image limit:', error);
    return 0;
  }
}

// ============================================================================
// LIMPIEZA DE COLA DE SINCRONIZACIÓN
// ============================================================================

/**
 * Limpia items de sincronización con demasiados reintentos fallidos
 */
export async function cleanupFailedSyncItems(maxRetries: number = 5): Promise<number> {
  const database = await db;
  
  const tx = database.transaction('sync-queue', 'readonly');
  const allItems = await tx.store.getAll();
  await tx.done;
  
  const toRemove = allItems.filter(item => item.retries >= maxRetries);
  
  const deleteTx = database.transaction('sync-queue', 'readwrite');
  for (const item of toRemove) {
    await deleteTx.store.delete(item.id);
  }
  await deleteTx.done;
  
  console.log(`[Cleanup] Removed ${toRemove.length} failed sync items (max retries: ${maxRetries})`);
  return toRemove.length;
}

/**
 * Limpia items de sincronización antiguos (> 30 días)
 */
export async function cleanupOldSyncItems(maxAgeDays: number = 30): Promise<number> {
  const database = await db;
  const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
  
  const tx = database.transaction('sync-queue', 'readonly');
  const allItems = await tx.store.getAll();
  await tx.done;
  
  const toRemove = allItems.filter(item => item.timestamp < cutoffTime);
  
  const deleteTx = database.transaction('sync-queue', 'readwrite');
  for (const item of toRemove) {
    await deleteTx.store.delete(item.id);
  }
  await deleteTx.done;
  
  console.log(`[Cleanup] Removed ${toRemove.length} old sync items (>${maxAgeDays} days)`);
  return toRemove.length;
}

// ============================================================================
// LIMPIEZA COMPLETA
// ============================================================================

/**
 * Ejecuta todas las rutinas de limpieza
 */
export async function runFullCleanup(): Promise<{
  expiredItems: number;
  excessNews: number;
  excessPlayers: number;
  orphanedImages: number;
  failedSyncItems: number;
  totalRemoved: number;
}> {
  console.log('[Cleanup] Running full cleanup...');
  
  const results = {
    expiredItems: await cleanupExpiredCache(),
    excessNews: await enforceMaxNewsLimit(),
    excessPlayers: await enforceMaxPlayersLimit(),
    orphanedImages: await cleanupOrphanedImages(),
    failedSyncItems: await cleanupFailedSyncItems(),
    totalRemoved: 0,
  };
  
  results.totalRemoved = 
    results.expiredItems + 
    results.excessNews + 
    results.excessPlayers + 
    results.orphanedImages + 
    results.failedSyncItems;
  
  console.log('[Cleanup] Full cleanup completed:', results);
  return results;
}

// ============================================================================
// ESTADÍSTICAS DE ALMACENAMIENTO
// ============================================================================

/**
 * Obtiene información sobre el uso de almacenamiento
 */
export async function getStorageStats(): Promise<{
  usage: number | null;
  quota: number | null;
  usageDetails?: Record<string, number> | undefined;
}> {
  if (!('storage' in navigator && 'estimate' in navigator.storage)) {
    return { usage: null, quota: null };
  }
  
  try {
    const estimate = await navigator.storage.estimate();
    return {
      usage: estimate.usage || null,
      quota: estimate.quota || null,
      usageDetails: (estimate as { usageDetails?: Record<string, number> }).usageDetails,
    };
  } catch (error) {
    console.error('[Cleanup] Failed to get storage estimate:', error);
    return { usage: null, quota: null };
  }
}

/**
 * Verifica si el almacenamiento está por encima de un umbral
 */
export async function isStorageCritical(thresholdPercent: number = 90): Promise<boolean> {
  const stats = await getStorageStats();
  
  if (stats.usage === null || stats.quota === null) {
    return false;
  }
  
  const usedPercent = (stats.usage / stats.quota) * 100;
  return usedPercent >= thresholdPercent;
}

/**
 * Solicita persistencia del almacenamiento (evita que el browser borre datos)
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (!('storage' in navigator && 'persist' in navigator.storage)) {
    return false;
  }
  
  try {
    const isPersistent = await navigator.storage.persist();
    console.log(`[Cleanup] Persistent storage: ${isPersistent ? 'granted' : 'denied'}`);
    return isPersistent;
  } catch (error) {
    console.error('[Cleanup] Failed to request persistent storage:', error);
    return false;
  }
}

// ============================================================================
// PROGRAMACIÓN DE LIMPIEZA
// ============================================================================

/**
 * Programa limpieza periódica usando requestIdleCallback
 */
export function scheduleCleanup(callback?: (results: unknown) => void): void {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(async (deadline) => {
      // Solo ejecutar si hay suficiente tiempo disponible
      if (deadline.timeRemaining() > 50) {
        const results = await runFullCleanup();
        callback?.(results);
      }
    }, { timeout: 5000 });
  } else {
    // Fallback para navegadores sin requestIdleCallback
    setTimeout(async () => {
      const results = await runFullCleanup();
      callback?.(results);
    }, 1000);
  }
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default {
  cleanupExpiredCache,
  enforceMaxNewsLimit,
  enforceMaxPlayersLimit,
  cleanupOrphanedImages,
  enforceMaxImagesLimit,
  cleanupFailedSyncItems,
  cleanupOldSyncItems,
  runFullCleanup,
  getStorageStats,
  isStorageCritical,
  requestPersistentStorage,
  scheduleCleanup,
};
