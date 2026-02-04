/**
 * Service Worker para FCH Noticias PWA
 * Implementado con Workbox para estrategias avanzadas de caché
 * 
 * @see https://developer.chrome.com/docs/workbox/
 */

/// <reference lib="webworker" />

// =============================================================================
// DECLARACIONES DE TIPOS
// =============================================================================

declare const self: ServiceWorkerGlobalScope;

// Background Sync Event
type SyncEvent = Event & {
  tag: string;
  lastChance?: boolean;
  waitUntil(promise: Promise<void>): void;
};

// Periodic Sync Event (experimental)
type PeriodicSyncEvent = Event & {
  tag: string;
  waitUntil(promise: Promise<void>): void;
};

// Declare workbox namespace para TypeScript
declare global {
  const workbox: {
    core: {
      clientsClaim(): void;
      skipWaiting(): void;
    };
    routing: {
      registerRoute(route: unknown, strategy: unknown): void;
    };
    strategies: Record<string, unknown>;
  };
}

// =============================================================================
// CONFIGURACIÓN
// =============================================================================

const SW_VERSION = '1.0.0';
const CACHE_PREFIX = 'fch-noticias';

console.log(`[SW] FCH Noticias Service Worker v${SW_VERSION}`);

// =============================================================================
// EVENTOS DEL SERVICE WORKER
// =============================================================================

/**
 * Evento de instalación
 * Precachea recursos esenciales para funcionamiento offline
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  // Saltar la espera para activar inmediatamente
  self.skipWaiting();
  
  // Precacheo se maneja por Workbox durante build
});

/**
 * Evento de activación
 * Limpia cachés antiguas y toma control de clientes
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguas
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Mantener solo cachés actuales del prefijo
              return cacheName.startsWith(CACHE_PREFIX) && 
                     !cacheName.includes('workbox');
            })
            .map((cacheName) => {
              console.log('[SW] Eliminando caché antigua:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      // Tomar control de todos los clientes inmediatamente
      self.clients.claim(),
    ])
  );
});

// =============================================================================
// BACKGROUND SYNC
// =============================================================================

/**
 * Cola de sincronización para operaciones offline
 * Usada principalmente para favoritos
 */
interface SyncQueueItem {
  id: string;
  type: 'add-favorite' | 'remove-favorite';
  data: {
    newsId?: string;
    timestamp: number;
  };
  retries: number;
}

const SYNC_QUEUE_KEY = 'fch-sync-queue';
const MAX_RETRIES = 3;

/**
 * Evento de sincronización en background
 * Se dispara cuando el dispositivo vuelve a tener conexión
 */
self.addEventListener('sync', ((event: SyncEvent) => {
  console.log('[SW] Evento de sync recibido:', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
}) as EventListener);

/**
 * Sincroniza favoritos pendientes con el servidor
 */
async function syncFavorites(): Promise<void> {
  try {
    // Obtener cola de sincronización
    const queue = await getSyncQueue();
    
    if (queue.length === 0) {
      console.log('[SW] No hay favoritos pendientes para sincronizar');
      return;
    }
    
    console.log(`[SW] Sincronizando ${queue.length} favoritos pendientes`);
    
    const failedItems: SyncQueueItem[] = [];
    
    for (const item of queue) {
      try {
        const success = await sendFavoriteToServer(item);
        
        if (!success && item.retries < MAX_RETRIES) {
          item.retries++;
          failedItems.push(item);
        }
      } catch (error) {
        console.error('[SW] Error sincronizando favorito:', error);
        if (item.retries < MAX_RETRIES) {
          item.retries++;
          failedItems.push(item);
        }
      }
    }
    
    // Guardar items que fallaron para reintentar
    await saveSyncQueue(failedItems);
    
    // Notificar a los clientes sobre la sincronización
    if (queue.length > failedItems.length) {
      await notifyClients('favorites-synced', {
        synced: queue.length - failedItems.length,
        pending: failedItems.length,
      });
    }
    
  } catch (error) {
    console.error('[SW] Error en syncFavorites:', error);
  }
}

/**
 * Envía un favorito al servidor
 */
async function sendFavoriteToServer(item: SyncQueueItem): Promise<boolean> {
  try {
    const response = await fetch('/api/trpc/favorites.sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: item.type,
        newsId: item.data.newsId,
        timestamp: item.data.timestamp,
      }),
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Obtiene la cola de sincronización del IndexedDB
 */
async function getSyncQueue(): Promise<SyncQueueItem[]> {
  // Usar IndexedDB para persistencia
  return new Promise((resolve) => {
    const request = indexedDB.open('fch-pwa-db', 1);
    
    request.onerror = () => resolve([]);
    
    request.onsuccess = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('syncQueue')) {
        resolve([]);
        return;
      }
      
      const transaction = db.transaction(['syncQueue'], 'readonly');
      const store = transaction.objectStore('syncQueue');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result || []);
      getAll.onerror = () => resolve([]);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    };
  });
}

/**
 * Guarda la cola de sincronización en IndexedDB
 */
async function saveSyncQueue(queue: SyncQueueItem[]): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.open('fch-pwa-db', 1);
    
    request.onerror = () => resolve();
    
    request.onsuccess = () => {
      const db = request.result;
      
      if (!db.objectStoreNames.contains('syncQueue')) {
        resolve();
        return;
      }
      
      const transaction = db.transaction(['syncQueue'], 'readwrite');
      const store = transaction.objectStore('syncQueue');
      
      // Limpiar y guardar nueva cola
      store.clear();
      
      for (const item of queue) {
        store.put(item);
      }
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve();
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id' });
      }
    };
  });
}

// =============================================================================
// PUSH NOTIFICATIONS
// =============================================================================

/**
 * Evento de push notification
 * Muestra notificación cuando llega un push del servidor
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push recibido:', event);
  
  let data: { title?: string; body?: string; url?: string; icon?: string } = {};
  
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data = {
      title: 'FCH Noticias',
      body: event.data?.text() || 'Nueva noticia disponible',
    };
  }
  
  const title = data.title || 'FCH Noticias';
  // Usar type assertion para actions (soportado en Chrome/Edge)
  const options = {
    body: data.body || 'Nueva noticia del fútbol chileno',
    icon: data.icon || '/logo-192x192.png',
    badge: '/logo-192x192.png',
    tag: 'fch-notification',
    requireInteraction: false,
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Ver noticia',
      },
      {
        action: 'close',
        title: 'Cerrar',
      },
    ],
    vibrate: [100, 50, 100],
  } as NotificationOptions & { actions: Array<{ action: string; title: string }> };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Evento de click en notificación
 * Abre la URL asociada cuando el usuario toca la notificación
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificación clickeada:', event.action);
  
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  if (event.action === 'close') {
    return;
  }
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no, abrir nueva ventana
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

/**
 * Evento de cierre de notificación
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notificación cerrada:', event);
});

// =============================================================================
// PERIODIC BACKGROUND SYNC (experimental)
// =============================================================================

/**
 * Sincronización periódica en background
 * Actualiza noticias cuando el dispositivo está en reposo
 */
self.addEventListener('periodicsync', ((event: PeriodicSyncEvent) => {
  console.log('[SW] Periodic sync:', event.tag);
  
  if (event.tag === 'news-update') {
    event.waitUntil(updateNewsCache());
  }
}) as EventListener);

/**
 * Actualiza el caché de noticias en background
 */
async function updateNewsCache(): Promise<void> {
  try {
    // Obtener últimas noticias
    const response = await fetch('/api/trpc/news.getLatest?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22limit%22%3A10%7D%7D%7D');
    
    if (response.ok) {
      // Cachear la respuesta
      const cache = await caches.open('api-cache-v1');
      await cache.put('/api/trpc/news.getLatest', response.clone());
      
      // Notificar a clientes sobre nuevas noticias
      const data = await response.json();
      if (data.result?.data?.json?.length > 0) {
        await notifyClients('news-updated', { count: data.result.data.json.length });
      }
    }
  } catch (error) {
    console.error('[SW] Error actualizando noticias:', error);
  }
}

// =============================================================================
// MENSAJES CON CLIENTES
// =============================================================================

/**
 * Escucha mensajes desde la aplicación (cliente)
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Mensaje recibido:', event.data);
  
  const { type, payload } = event.data || {};
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0]?.postMessage({ version: SW_VERSION });
      break;
      
    case 'CACHE_FAVORITE':
      // Cachear noticia específica para offline
      if (payload?.url) {
        cacheUrlForOffline(payload.url);
      }
      break;
      
    case 'SYNC_FAVORITES':
      // Solicitar sincronización de favoritos
      event.waitUntil(syncFavorites());
      break;
      
    case 'CLEAR_CACHE':
      // Limpiar todas las cachés
      event.waitUntil(clearAllCaches());
      break;
      
    case 'GET_CACHE_SIZE':
      // Obtener tamaño de caché
      event.waitUntil(
        getCacheSize().then(size => {
          event.ports[0]?.postMessage({ size });
        })
      );
      break;
      
    default:
      console.log('[SW] Mensaje desconocido:', type);
  }
});

/**
 * Cachea una URL específica para uso offline
 */
async function cacheUrlForOffline(url: string): Promise<void> {
  try {
    const cache = await caches.open('user-favorites-cache-v1');
    const response = await fetch(url);
    
    if (response.ok) {
      await cache.put(url, response);
      console.log('[SW] URL cacheada para offline:', url);
    }
  } catch (error) {
    console.error('[SW] Error cacheando URL:', error);
  }
}

/**
 * Limpia todas las cachés
 */
async function clearAllCaches(): Promise<void> {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(name => caches.delete(name))
  );
  console.log('[SW] Todas las cachés limpiadas');
}

/**
 * Obtiene el tamaño total de las cachés
 */
async function getCacheSize(): Promise<number> {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }
  
  return totalSize;
}

/**
 * Notifica a todos los clientes (pestañas) conectados
 */
async function notifyClients(type: string, payload: unknown): Promise<void> {
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  
  for (const client of clients) {
    client.postMessage({
      type,
      payload,
      from: 'service-worker',
    });
  }
}

// =============================================================================
// FETCH HANDLER (Workbox maneja la mayoría, esto es para casos especiales)
// =============================================================================

/**
 * Intercepta peticiones fetch para casos especiales
 * Workbox maneja la mayoría de las estrategias de caché
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests (manejados por Workbox)
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip requests with 'no-cors' mode (CORS preflight)
  if (event.request.mode === 'no-cors') {
    return;
  }
  
  // El resto de estrategias son manejadas por Workbox
});

// =============================================================================
// EXPORTS (para testing)
// =============================================================================

export {
  SW_VERSION,
  syncFavorites,
  updateNewsCache,
  getCacheSize,
  clearAllCaches,
};

export type { SyncQueueItem };
