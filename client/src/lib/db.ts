/**
 * FCH Noticias - IndexedDB Manager
 * 
 * Sistema de caché offline con IndexedDB usando la librería `idb`.
 * Almacena noticias, jugadores, categorías y favoritos para acceso offline.
 * 
 * @module client/src/lib/db
 */

import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { NewsItem, Player, Category, Favorite } from '../../../server/db/schema';

// ============================================================================
// CONSTANTES
// ============================================================================

export const DB_NAME = 'fch-noticias-db';
export const DB_VERSION = 1;
export const MAX_CACHED_NEWS = 100;
export const MAX_CACHED_PLAYERS = 50;
export const CACHE_EXPIRY_DAYS = 7;
export const CACHE_EXPIRY_MS = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// ============================================================================
// TIPOS EXTENDIDOS PARA CACHÉ
// ============================================================================

export interface CachedNewsItem extends NewsItem {
  cachedAt: number;
  category?: Category | null;
}

export interface CachedPlayer extends Player {
  cachedAt: number;
}

export interface CachedCategory extends Category {
  cachedAt: number;
}

export interface CachedFavorite extends Omit<Favorite, 'createdAt'> {
  cachedAt: number;
  synced: boolean;
  createdAt: number;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: 'favorite' | 'reading_history' | 'comment';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
}

// ============================================================================
// SCHEMA DE INDEXEDDB
// ============================================================================

interface FCHDatabase extends DBSchema {
  news: {
    key: string;
    value: CachedNewsItem;
    indexes: {
      'by-date': number;
      'by-cached': number;
      'by-category': string;
      'by-featured': number;
    };
  };
  players: {
    key: string;
    value: CachedPlayer;
    indexes: {
      'by-name': string;
      'by-cached': number;
      'by-team': string;
    };
  };
  categories: {
    key: string;
    value: CachedCategory;
    indexes: {
      'by-cached': number;
    };
  };
  favorites: {
    key: string;
    value: CachedFavorite;
    indexes: {
      'by-user': string;
      'by-synced': number;
      'by-news': string;
      'by-player': string;
    };
  };
  'sync-queue': {
    key: string;
    value: SyncQueueItem;
    indexes: {
      'by-timestamp': number;
      'by-retries': number;
    };
  };
  metadata: {
    key: string;
    value: {
      key: string;
      value: unknown;
      updatedAt: number;
    };
  };
}

export type FCHDB = IDBPDatabase<FCHDatabase>;

// ============================================================================
// INICIALIZACIÓN DE LA BASE DE DATOS
// ============================================================================

export const db = openDB<FCHDatabase>(DB_NAME, DB_VERSION, {
  upgrade(database, oldVersion, newVersion) {
    console.log(`[IndexedDB] Upgrading from version ${oldVersion} to ${newVersion}`);

    // Store: Noticias
    if (!database.objectStoreNames.contains('news')) {
      const newsStore = database.createObjectStore('news', { keyPath: 'id' });
      newsStore.createIndex('by-date', 'publishedAt');
      newsStore.createIndex('by-cached', 'cachedAt');
      newsStore.createIndex('by-category', 'categoryId');
      newsStore.createIndex('by-featured', 'featured');
      console.log('[IndexedDB] Created store: news');
    }

    // Store: Jugadores
    if (!database.objectStoreNames.contains('players')) {
      const playersStore = database.createObjectStore('players', { keyPath: 'id' });
      playersStore.createIndex('by-name', 'name');
      playersStore.createIndex('by-cached', 'cachedAt');
      playersStore.createIndex('by-team', 'team');
      console.log('[IndexedDB] Created store: players');
    }

    // Store: Categorías
    if (!database.objectStoreNames.contains('categories')) {
      const categoriesStore = database.createObjectStore('categories', { keyPath: 'id' });
      categoriesStore.createIndex('by-cached', 'cachedAt');
      console.log('[IndexedDB] Created store: categories');
    }

    // Store: Favoritos
    if (!database.objectStoreNames.contains('favorites')) {
      const favoritesStore = database.createObjectStore('favorites', { keyPath: 'id' });
      favoritesStore.createIndex('by-user', 'userId');
      favoritesStore.createIndex('by-synced', 'synced');
      favoritesStore.createIndex('by-news', 'newsId');
      favoritesStore.createIndex('by-player', 'playerId');
      console.log('[IndexedDB] Created store: favorites');
    }

    // Store: Cola de sincronización
    if (!database.objectStoreNames.contains('sync-queue')) {
      const syncQueueStore = database.createObjectStore('sync-queue', { keyPath: 'id' });
      syncQueueStore.createIndex('by-timestamp', 'timestamp');
      syncQueueStore.createIndex('by-retries', 'retries');
      console.log('[IndexedDB] Created store: sync-queue');
    }

    // Store: Metadata
    if (!database.objectStoreNames.contains('metadata')) {
      database.createObjectStore('metadata', { keyPath: 'key' });
      console.log('[IndexedDB] Created store: metadata');
    }
  },
  blocked() {
    console.warn('[IndexedDB] Database upgrade blocked. Close other tabs.');
  },
  blocking() {
    console.warn('[IndexedDB] Database upgrade blocking other tabs.');
  },
});

// ============================================================================
// FUNCIONES CRUD - NOTICIAS
// ============================================================================

/**
 * Guarda una o varias noticias en el caché
 */
export async function cacheNews(news: NewsItem | NewsItem[]): Promise<void> {
  const database = await db;
  const items = Array.isArray(news) ? news : [news];
  
  const tx = database.transaction('news', 'readwrite');
  const timestamp = Date.now();
  
  for (const item of items) {
    const cachedItem: CachedNewsItem = {
      ...item,
      cachedAt: timestamp,
    };
    await tx.store.put(cachedItem);
  }
  
  await tx.done;
  console.log(`[IndexedDB] Cached ${items.length} news items`);
}

/**
 * Obtiene las últimas noticias cacheadas
 */
export async function getCachedNews(limit = 50): Promise<CachedNewsItem[]> {
  const database = await db;
  const tx = database.transaction('news', 'readonly');
  
  const items = await tx.store.index('by-date').getAll();
  
  // Ordenar por fecha de publicación descendente
  items.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
  
  await tx.done;
  return items.slice(0, limit);
}

/**
 * Obtiene una noticia específica por ID
 */
export async function getCachedNewsById(id: string): Promise<CachedNewsItem | undefined> {
  const database = await db;
  return database.get('news', id);
}

/**
 * Obtiene una noticia por slug
 */
export async function getCachedNewsBySlug(slug: string): Promise<CachedNewsItem | undefined> {
  const database = await db;
  const tx = database.transaction('news', 'readonly');
  
  const allNews = await tx.store.getAll();
  await tx.done;
  
  return allNews.find(item => item.slug === slug);
}

/**
 * Obtiene noticias destacadas
 */
export async function getCachedFeaturedNews(limit = 5): Promise<CachedNewsItem[]> {
  const database = await db;
  const tx = database.transaction('news', 'readonly');
  
  const allNews = await tx.store.getAll();
  await tx.done;
  
  return allNews
    .filter(item => item.featured)
    .sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, limit);
}

/**
 * Obtiene noticias por categoría
 */
export async function getCachedNewsByCategory(categoryId: string, limit = 20): Promise<CachedNewsItem[]> {
  const database = await db;
  const tx = database.transaction('news', 'readonly');
  
  const items = await tx.store.index('by-category').getAll(categoryId);
  
  items.sort((a, b) => {
    const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return dateB - dateA;
  });
  
  await tx.done;
  return items.slice(0, limit);
}

/**
 * Elimina una noticia del caché
 */
export async function removeCachedNews(id: string): Promise<void> {
  const database = await db;
  await database.delete('news', id);
}

// ============================================================================
// FUNCIONES CRUD - JUGADORES
// ============================================================================

/**
 * Guarda un jugador o lista de jugadores en el caché
 */
export async function cachePlayer(player: Player | Player[]): Promise<void> {
  const database = await db;
  const items = Array.isArray(player) ? player : [player];
  
  const tx = database.transaction('players', 'readwrite');
  const timestamp = Date.now();
  
  for (const item of items) {
    const cachedItem: CachedPlayer = {
      ...item,
      cachedAt: timestamp,
    };
    await tx.store.put(cachedItem);
  }
  
  await tx.done;
  console.log(`[IndexedDB] Cached ${items.length} players`);
}

/**
 * Obtiene todos los jugadores cacheados
 */
export async function getCachedPlayers(limit = 50): Promise<CachedPlayer[]> {
  const database = await db;
  const tx = database.transaction('players', 'readonly');
  
  const items = await tx.store.index('by-name').getAll();
  await tx.done;
  
  return items.slice(0, limit);
}

/**
 * Obtiene un jugador por ID
 */
export async function getCachedPlayerById(id: string): Promise<CachedPlayer | undefined> {
  const database = await db;
  return database.get('players', id);
}

/**
 * Obtiene un jugador por slug
 */
export async function getCachedPlayerBySlug(slug: string): Promise<CachedPlayer | undefined> {
  const database = await db;
  const tx = database.transaction('players', 'readonly');
  
  const allPlayers = await tx.store.getAll();
  await tx.done;
  
  return allPlayers.find(player => player.slug === slug);
}

/**
 * Obtiene jugadores por equipo
 */
export async function getCachedPlayersByTeam(team: string): Promise<CachedPlayer[]> {
  const database = await db;
  const tx = database.transaction('players', 'readonly');
  
  const players = await tx.store.index('by-team').getAll(team);
  await tx.done;
  
  return players;
}

/**
 * Elimina un jugador del caché
 */
export async function removeCachedPlayer(id: string): Promise<void> {
  const database = await db;
  await database.delete('players', id);
}

// ============================================================================
// FUNCIONES CRUD - CATEGORÍAS
// ============================================================================

/**
 * Guarda categorías en el caché
 */
export async function cacheCategories(categories: Category | Category[]): Promise<void> {
  const database = await db;
  const items = Array.isArray(categories) ? categories : [categories];
  
  const tx = database.transaction('categories', 'readwrite');
  const timestamp = Date.now();
  
  for (const item of items) {
    const cachedItem: CachedCategory = {
      ...item,
      cachedAt: timestamp,
    };
    await tx.store.put(cachedItem);
  }
  
  await tx.done;
  console.log(`[IndexedDB] Cached ${items.length} categories`);
}

/**
 * Obtiene todas las categorías cacheadas
 */
export async function getCachedCategories(): Promise<CachedCategory[]> {
  const database = await db;
  return database.getAll('categories');
}

/**
 * Obtiene una categoría por ID
 */
export async function getCachedCategoryById(id: string): Promise<CachedCategory | undefined> {
  const database = await db;
  return database.get('categories', id);
}

/**
 * Obtiene una categoría por slug
 */
export async function getCachedCategoryBySlug(slug: string): Promise<CachedCategory | undefined> {
  const database = await db;
  const tx = database.transaction('categories', 'readonly');
  
  const allCategories = await tx.store.getAll();
  await tx.done;
  
  return allCategories.find(cat => cat.slug === slug);
}

// ============================================================================
// FUNCIONES CRUD - FAVORITOS (OFFLINE)
// ============================================================================

/**
 * Agrega un favorito en modo offline (sin sincronizar)
 */
export async function addToFavoritesOffline(
  favorite: Omit<Favorite, 'id' | 'createdAt'>
): Promise<CachedFavorite> {
  const database = await db;
  
  const id = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();
  
  const cachedFavorite: CachedFavorite = {
    ...favorite,
    id,
    synced: false,
    cachedAt: timestamp,
    createdAt: timestamp,
  };
  
  await database.put('favorites', cachedFavorite);
  console.log('[IndexedDB] Added offline favorite:', id);
  
  // Agregar a la cola de sincronización
  await addToSyncQueue({
    operation: 'create',
    entity: 'favorite',
    data: favorite,
  });
  
  return cachedFavorite;
}

/**
 * Obtiene todos los favoritos de un usuario
 */
export async function getCachedFavoritesByUser(userId: string): Promise<CachedFavorite[]> {
  const database = await db;
  return database.getAllFromIndex('favorites', 'by-user', userId);
}

/**
 * Obtiene favoritos no sincronizados
 */
export async function getUnsyncedFavorites(): Promise<CachedFavorite[]> {
  const database = await db;
  return database.getAllFromIndex('favorites', 'by-synced', 0);
}

/**
 * Marca un favorito como sincronizado
 */
export async function markFavoriteAsSynced(id: string): Promise<void> {
  const database = await db;
  const favorite = await database.get('favorites', id);
  
  if (favorite) {
    favorite.synced = true;
    await database.put('favorites', favorite);
    console.log('[IndexedDB] Marked favorite as synced:', id);
  }
}

/**
 * Elimina un favorito del caché
 */
export async function removeCachedFavorite(id: string): Promise<void> {
  const database = await db;
  await database.delete('favorites', id);
}

/**
 * Verifica si una noticia está en favoritos
 */
export async function isNewsFavorited(userId: string, newsId: string): Promise<boolean> {
  const database = await db;
  const tx = database.transaction('favorites', 'readonly');
  
  const allFavorites = await tx.store.index('by-user').getAll(userId);
  await tx.done;
  
  return allFavorites.some(fav => fav.newsId === newsId);
}

/**
 * Verifica si un jugador está en favoritos
 */
export async function isPlayerFavorited(userId: string, playerId: string): Promise<boolean> {
  const database = await db;
  const tx = database.transaction('favorites', 'readonly');
  
  const allFavorites = await tx.store.index('by-user').getAll(userId);
  await tx.done;
  
  return allFavorites.some(fav => fav.playerId === playerId);
}

// ============================================================================
// COLA DE SINCRONIZACIÓN
// ============================================================================

/**
 * Agrega una operación a la cola de sincronización
 */
export async function addToSyncQueue(
  item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>
): Promise<SyncQueueItem> {
  const database = await db;
  
  const queueItem: SyncQueueItem = {
    ...item,
    id: `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    retries: 0,
  };
  
  await database.put('sync-queue', queueItem);
  console.log('[IndexedDB] Added to sync queue:', queueItem.id);
  
  return queueItem;
}

/**
 * Obtiene todos los items pendientes de sincronización
 */
export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const database = await db;
  const tx = database.transaction('sync-queue', 'readonly');
  
  const items = await tx.store.index('by-timestamp').getAll();
  await tx.done;
  
  return items;
}

/**
 * Obtiene items de sincronización pendientes ordenados por reintentos
 */
export async function getSyncQueuePending(maxRetries = 5): Promise<SyncQueueItem[]> {
  const database = await db;
  const tx = database.transaction('sync-queue', 'readonly');
  
  const items = await tx.store.getAll();
  await tx.done;
  
  return items.filter(item => item.retries < maxRetries);
}

/**
 * Incrementa el contador de reintentos de un item
 */
export async function incrementSyncRetry(id: string): Promise<void> {
  const database = await db;
  const item = await database.get('sync-queue', id);
  
  if (item) {
    item.retries += 1;
    await database.put('sync-queue', item);
  }
}

/**
 * Elimina un item de la cola de sincronización
 */
export async function removeFromSyncQueue(id: string): Promise<void> {
  const database = await db;
  await database.delete('sync-queue', id);
  console.log('[IndexedDB] Removed from sync queue:', id);
}

/**
 * Limpia todos los items sincronizados de la cola
 */
export async function clearSyncQueue(): Promise<void> {
  const database = await db;
  const tx = database.transaction('sync-queue', 'readwrite');
  
  await tx.store.clear();
  await tx.done;
  
  console.log('[IndexedDB] Sync queue cleared');
}

// ============================================================================
// METADATA Y UTILIDADES
// ============================================================================

/**
 * Guarda un valor de metadata
 */
export async function setMetadata(key: string, value: unknown): Promise<void> {
  const database = await db;
  await database.put('metadata', {
    key,
    value,
    updatedAt: Date.now(),
  });
}

/**
 * Obtiene un valor de metadata
 */
export async function getMetadata<T>(key: string): Promise<T | undefined> {
  const database = await db;
  const item = await database.get('metadata', key);
  return item?.value as T;
}

/**
 * Obtiene estadísticas del caché
 */
export async function getCacheStats(): Promise<{
  newsCount: number;
  playersCount: number;
  categoriesCount: number;
  favoritesCount: number;
  syncQueueCount: number;
  oldestCache: number | null;
}> {
  const database = await db;
  
  const [news, players, categories, favorites, syncQueue] = await Promise.all([
    database.count('news'),
    database.count('players'),
    database.count('categories'),
    database.count('favorites'),
    database.count('sync-queue'),
  ]);
  
  // Encontrar el caché más antiguo
  const tx = database.transaction('news', 'readonly');
  const allNews = await tx.store.getAll();
  await tx.done;
  
  const oldestCache = allNews.length > 0
    ? Math.min(...allNews.map(item => item.cachedAt))
    : null;
  
  return {
    newsCount: news,
    playersCount: players,
    categoriesCount: categories,
    favoritesCount: favorites,
    syncQueueCount: syncQueue,
    oldestCache,
  };
}

/**
 * Limpia todo el caché (usar con precaución)
 */
export async function clearAllCache(): Promise<void> {
  const database = await db;
  
  const stores: Array<'news' | 'players' | 'categories' | 'favorites'> = [
    'news',
    'players',
    'categories',
    'favorites',
  ];
  
  for (const storeName of stores) {
    const tx = database.transaction(storeName, 'readwrite');
    await tx.store.clear();
    await tx.done;
  }
  
  console.log('[IndexedDB] All cache cleared');
}

/**
 * Verifica si IndexedDB está disponible
 */
export function isIndexedDBAvailable(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window;
}

/**
 * Inicializa la base de datos y verifica disponibilidad
 */
export async function initializeDB(): Promise<boolean> {
  if (!isIndexedDBAvailable()) {
    console.warn('[IndexedDB] Not available in this environment');
    return false;
  }
  
  try {
    const database = await db;
    console.log('[IndexedDB] Database initialized:', database.name, 'v' + database.version);
    return true;
  } catch (error) {
    console.error('[IndexedDB] Failed to initialize:', error);
    return false;
  }
}

export default db;
