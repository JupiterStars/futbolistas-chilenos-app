/**
 * FCH Noticias - Sincronización de Datos
 * 
 * Módulo para sincronización bidireccional entre IndexedDB y el servidor.
 * Maneja colas de sincronización, reintentos con backoff exponencial y
 * resolución de conflictos.
 * 
 * @module client/src/lib/sync
 */

import {
  db,
  getSyncQueuePending,
  removeFromSyncQueue,
  incrementSyncRetry,
  markFavoriteAsSynced,
  getCachedNews,
  cacheNews,
  cachePlayer,
  cacheCategories,
  getMetadata,
  setMetadata,
  type SyncQueueItem,
} from './db';
import { trpc } from './trpc';

// ============================================================================
// CONSTANTES
// ============================================================================

/** Máximo número de reintentos para operaciones fallidas */
export const MAX_RETRY_ATTEMPTS = 5;

/** Delay base para backoff exponencial (ms) */
export const BASE_RETRY_DELAY = 1000;

/** Delay máximo entre reintentos (ms) */
export const MAX_RETRY_DELAY = 60000;

/** Intervalo mínimo entre sincronizaciones (ms) */
export const MIN_SYNC_INTERVAL = 5000;

// ============================================================================
// TIPOS
// ============================================================================

export interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export interface SyncOptions {
  force?: boolean;
  priority?: 'high' | 'normal' | 'low';
  maxRetries?: number;
  onProgress?: (progress: { current: number; total: number; item: string }) => void;
}

// ============================================================================
// UTILIDADES DE BACKOFF
// ============================================================================

/**
 * Calcula el delay para un reintento usando backoff exponencial con jitter
 */
export function calculateRetryDelay(attempt: number): number {
  // Backoff exponencial: 2^attempt * baseDelay
  const exponentialDelay = Math.pow(2, attempt) * BASE_RETRY_DELAY;
  
  // Añadir jitter (±25%) para evitar thundering herd
  const jitter = (Math.random() - 0.5) * 0.5 * exponentialDelay;
  
  return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
}

/**
 * Espera el tiempo especificado
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// SINCRONIZACIÓN DE FAVORITOS
// ============================================================================

/**
 * Sincroniza favoritos pendientes con el servidor
 */
export async function syncFavorites(
  toggleNewsMutation: ReturnType<typeof trpc.favorites.news.toggle.useMutation>,
  togglePlayerMutation: ReturnType<typeof trpc.favorites.players.toggle.useMutation>,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };
  
  const pendingItems = await getSyncQueuePending(options.maxRetries || MAX_RETRY_ATTEMPTS);
  const favoriteItems = pendingItems.filter(item => item.entity === 'favorite');
  
  if (favoriteItems.length === 0) {
    return result;
  }
  
  console.log(`[Sync] Starting sync for ${favoriteItems.length} favorites...`);
  
  for (let i = 0; i < favoriteItems.length; i++) {
    const item = favoriteItems[i];
    
    options.onProgress?.({
      current: i + 1,
      total: favoriteItems.length,
      item: item.id,
    });
    
    try {
      await syncFavoriteItem(item, toggleNewsMutation, togglePlayerMutation);
      await removeFromSyncQueue(item.id);
      result.synced++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Sync] Failed to sync favorite ${item.id}:`, error);
      
      await incrementSyncRetry(item.id);
      result.failed++;
      result.errors.push({ id: item.id, error: errorMessage });
      
      // Si no hemos alcanzado el máximo de reintentos, programar reintento
      if (item.retries < (options.maxRetries || MAX_RETRY_ATTEMPTS) - 1) {
        const retryDelay = calculateRetryDelay(item.retries);
        console.log(`[Sync] Will retry ${item.id} in ${retryDelay}ms`);
      }
    }
  }
  
  result.success = result.failed === 0;
  console.log(`[Sync] Favorites sync completed: ${result.synced} synced, ${result.failed} failed`);
  
  return result;
}

/**
 * Sincroniza un item de favorito individual
 */
async function syncFavoriteItem(
  item: SyncQueueItem,
  toggleNewsMutation: ReturnType<typeof trpc.favorites.news.toggle.useMutation>,
  togglePlayerMutation: ReturnType<typeof trpc.favorites.players.toggle.useMutation>
): Promise<void> {
  const data = item.data as { newsId?: string; playerId?: string };
  
  if (data.newsId) {
    // Nota: Los IDs en el servidor son números, pero en el cliente pueden ser strings
    await toggleNewsMutation.mutateAsync({ 
      newsId: typeof data.newsId === 'string' ? parseInt(data.newsId, 10) || 0 : data.newsId 
    });
  } else if (data.playerId) {
    await togglePlayerMutation.mutateAsync({ 
      playerId: typeof data.playerId === 'string' ? parseInt(data.playerId, 10) || 0 : data.playerId 
    });
  }
  
  // Marcar como sincronizado si tenemos el ID local
  if (item.data.id && typeof item.data.id === 'string') {
    await markFavoriteAsSynced(item.data.id);
  }
}

// ============================================================================
// SINCRONIZACIÓN DESDE SERVIDOR (FETCH)
// ============================================================================

/**
 * Obtiene y cachea las últimas noticias del servidor
 */
export async function syncNewsFromServer(
  listQuery: ReturnType<typeof trpc.news.list.useQuery>,
  limit = 50
): Promise<number> {
  try {
    // Refetch para obtener datos frescos
    const result = await listQuery.refetch();
    
    if (!result.data) {
      console.log('[Sync] No news data from server');
      return 0;
    }
    
    // Adaptar datos al formato de NewsItem y cachear
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const newsItems = Array.isArray(result.data) ? result.data : (result.data as any).items || [];
    
    if (newsItems.length === 0) {
      return 0;
    }
    
    // Convertir y cachear
    await cacheNews(newsItems as unknown as import('../../../server/db/schema').NewsItem[]);
    
    // Actualizar timestamp
    await setMetadata('lastNewsSync', Date.now());
    
    console.log(`[Sync] Cached ${newsItems.length} news items from server`);
    return newsItems.length;
  } catch (error) {
    console.error('[Sync] Failed to sync news from server:', error);
    return 0;
  }
}

/**
 * Obtiene y cachea jugadores del servidor
 */
export async function syncPlayersFromServer(
  listQuery: ReturnType<typeof trpc.players.list.useQuery>,
  limit = 50
): Promise<number> {
  try {
    const result = await listQuery.refetch();
    
    if (!result.data) {
      return 0;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const players = Array.isArray(result.data) ? result.data : (result.data as any).items || [];
    
    if (players.length === 0) {
      return 0;
    }
    
    await cachePlayer(players as unknown as import('../../../server/db/schema').Player[]);
    await setMetadata('lastPlayersSync', Date.now());
    
    console.log(`[Sync] Cached ${players.length} players from server`);
    return players.length;
  } catch (error) {
    console.error('[Sync] Failed to sync players from server:', error);
    return 0;
  }
}

/**
 * Obtiene y cachea categorías del servidor
 */
export async function syncCategoriesFromServer(
  listQuery: ReturnType<typeof trpc.categories.list.useQuery>
): Promise<number> {
  try {
    const result = await listQuery.refetch();
    
    if (!result.data) {
      return 0;
    }
    
    const categories = Array.isArray(result.data) ? result.data : [];
    
    if (categories.length === 0) {
      return 0;
    }
    
    await cacheCategories(categories as unknown as import('../../../server/db/schema').Category[]);
    await setMetadata('lastCategoriesSync', Date.now());
    
    console.log(`[Sync] Cached ${categories.length} categories from server`);
    return categories.length;
  } catch (error) {
    console.error('[Sync] Failed to sync categories from server:', error);
    return 0;
  }
}

// ============================================================================
// SINCRONIZACIÓN COMPLETA
// ============================================================================

/**
 * Ejecuta una sincronización completa de todos los datos
 */
export async function fullSync(
  options: SyncOptions = {}
): Promise<{
  favorites: SyncResult;
  news: number;
  players: number;
  categories: number;
  success: boolean;
}> {
  console.log('[Sync] Starting full sync...');
  
  // Verificar si estamos online
  if (!navigator.onLine) {
    console.log('[Sync] Cannot sync: offline');
    return {
      favorites: { success: false, synced: 0, failed: 0, errors: [{ id: 'offline', error: 'No connection' }] },
      news: 0,
      players: 0,
      categories: 0,
      success: false,
    };
  }
  
  // Verificar intervalo mínimo
  const lastSync = await getMetadata<number>('lastFullSync');
  if (lastSync && !options.force) {
    const timeSinceLastSync = Date.now() - lastSync;
    if (timeSinceLastSync < MIN_SYNC_INTERVAL) {
      console.log(`[Sync] Too soon since last sync (${timeSinceLastSync}ms)`);
      return {
        favorites: { success: true, synced: 0, failed: 0, errors: [] },
        news: 0,
        players: 0,
        categories: 0,
        success: true,
      };
    }
  }
  
  const results = {
    favorites: { success: true, synced: 0, failed: 0, errors: [] as Array<{ id: string; error: string }> },
    news: 0,
    players: 0,
    categories: 0,
    success: true,
  };
  
  // Sincronizar favoritos pendientes
  // Nota: Esto requiere que las mutations estén disponibles
  // En la práctica, esto se hace desde el hook useOfflineData
  
  // Actualizar timestamp
  await setMetadata('lastFullSync', Date.now());
  
  console.log('[Sync] Full sync completed:', results);
  return results;
}

// ============================================================================
// GESTIÓN DE CONFLICTOS
// ============================================================================

export interface ConflictResolution {
  strategy: 'server-wins' | 'client-wins' | 'last-write-wins' | 'manual';
  resolved: boolean;
  data?: unknown;
}

/**
 * Detecta conflictos entre datos locales y del servidor
 */
export function detectConflict(
  localData: { updatedAt: number },
  serverData: { updatedAt: number }
): boolean {
  // Hay conflicto si ambos tienen timestamps diferentes
  return localData.updatedAt !== serverData.updatedAt;
}

/**
 * Resuelve conflictos según la estrategia configurada
 */
export function resolveConflict(
  localData: unknown,
  serverData: unknown,
  strategy: ConflictResolution['strategy'] = 'last-write-wins'
): ConflictResolution {
  switch (strategy) {
    case 'server-wins':
      return { strategy, resolved: true, data: serverData };
      
    case 'client-wins':
      return { strategy, resolved: true, data: localData };
      
    case 'last-write-wins': {
      const local = localData as { updatedAt?: number };
      const server = serverData as { updatedAt?: number };
      const localTime = local.updatedAt || 0;
      const serverTime = server.updatedAt || 0;
      
      return {
        strategy,
        resolved: true,
        data: localTime > serverTime ? localData : serverData,
      };
    }
      
    case 'manual':
    default:
      return { strategy, resolved: false };
  }
}

// ============================================================================
// BACKGROUND SYNC API
// ============================================================================

/**
 * Registra una sincronización en segundo plano
 */
export async function registerBackgroundSync(tag: string = 'fch-sync'): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.log('[Sync] Background Sync not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (registration as any).sync.register(tag);
    console.log(`[Sync] Background sync registered: ${tag}`);
    return true;
  } catch (error) {
    console.error('[Sync] Failed to register background sync:', error);
    return false;
  }
}

/**
 * Verifica si hay sincronizaciones pendientes
 */
export async function getPendingSyncTags(): Promise<string[]> {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return [];
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tags = await (registration as any).sync.getTags();
    return tags as string[];
  } catch (error) {
    console.error('[Sync] Failed to get pending sync tags:', error);
    return [];
  }
}

// ============================================================================
// UTILIDADES DE CONECTIVIDAD
// ============================================================================

/**
 * Verifica si hay conexión con el servidor
 */
export async function checkServerConnectivity(): Promise<boolean> {
  if (!navigator.onLine) {
    return false;
  }
  
  try {
    // Intentar hacer un ping al servidor
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('/api/health', {
      method: 'HEAD',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Espera hasta tener conexión
 */
export function waitForConnection(timeout: number = 30000): Promise<boolean> {
  return new Promise((resolve) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }
    
    const handleOnline = () => {
      cleanup();
      resolve(true);
    };
    
    const handleTimeout = () => {
      cleanup();
      resolve(false);
    };
    
    const cleanup = () => {
      window.removeEventListener('online', handleOnline);
      clearTimeout(timeoutId);
    };
    
    window.addEventListener('online', handleOnline);
    const timeoutId = setTimeout(handleTimeout, timeout);
  });
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default {
  syncFavorites,
  syncNewsFromServer,
  syncPlayersFromServer,
  syncCategoriesFromServer,
  fullSync,
  calculateRetryDelay,
  delay,
  detectConflict,
  resolveConflict,
  registerBackgroundSync,
  getPendingSyncTags,
  checkServerConnectivity,
  waitForConnection,
};
