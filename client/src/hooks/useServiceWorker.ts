/**
 * useServiceWorker Hook
 * 
 * Hook para gestionar el Service Worker con Workbox
 * Incluye:
 * - Registro del SW con actualizaciones
 * - Comunicación bidireccional con el SW
 * - Background sync para favoritos
 * - Manejo de actualizaciones
 * 
 * @example
 * ```tsx
 * const { isOnline, isUpdated, updateApp, syncFavorites } = useServiceWorker();
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// =============================================================================
// TYPES
// =============================================================================

interface ServiceWorkerState {
  /** Indica si el SW está registrado */
  isRegistered: boolean;
  /** Indica si hay una actualización disponible */
  isUpdated: boolean;
  /** Indica si hay una actualización en progreso */
  isUpdating: boolean;
  /** Indica si el dispositivo está online */
  isOnline: boolean;
  /** Indica si hay sincronización pendiente */
  hasPendingSync: boolean;
  /** Error si ocurrió alguno */
  error: string | null;
}

interface ServiceWorkerActions {
  /** Fuerza la actualización de la aplicación */
  updateApp: () => void;
  /** Omite la espera del SW y activa inmediatamente */
  skipWaiting: () => void;
  /** Solicita sincronización de favoritos */
  syncFavorites: () => Promise<boolean>;
  /** Comprueba manualmente actualizaciones */
  checkForUpdates: () => Promise<void>;
  /** Obtiene el tamaño de la caché */
  getCacheSize: () => Promise<number>;
  /** Limpia todas las cachés */
  clearCache: () => Promise<void>;
  /** Envía mensaje al SW */
  sendMessage: (type: string, payload?: unknown) => Promise<unknown>;
}

type ServiceWorkerReturn = ServiceWorkerState & ServiceWorkerActions;

// =============================================================================
// CONSTANTS
// =============================================================================

const SW_PATH = '/sw.js';
const SYNC_TAG = 'sync-favorites';

// =============================================================================
// HOOK
// =============================================================================

export function useServiceWorker(): ServiceWorkerReturn {
  // Estado
  const [state, setState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isUpdated: false,
    isUpdating: false,
    isOnline: navigator.onLine,
    hasPendingSync: false,
    error: null,
  });

  // Refs
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const messageChannelRef = useRef<MessageChannel | null>(null);

  // =============================================================================
  // REGISTRO DEL SERVICE WORKER
  // =============================================================================

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('[SW] Service Worker no soportado');
      return;
    }

    let isMounted = true;

    const registerSW = async () => {
      try {
        // Registrar el Service Worker
        const registration = await navigator.serviceWorker.register(SW_PATH, {
          scope: '/',
          updateViaCache: 'imports',
        });

        if (!isMounted) return;

        registrationRef.current = registration;
        setState(prev => ({ ...prev, isRegistered: true }));

        console.log('[SW] Registrado correctamente:', registration.scope);

        // Escuchar nuevas actualizaciones
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nueva actualización disponible
                  console.log('[SW] Nueva versión disponible');
                  setState(prev => ({ ...prev, isUpdated: true }));
                } else {
                  // Primera instalación
                  console.log('[SW] App lista para uso offline');
                }
              }
            });
          }
        });

        // Comprobar si ya hay un SW esperando
        if (registration.waiting) {
          setState(prev => ({ ...prev, isUpdated: true }));
        }

        // Configurar canal de mensajes
        setupMessageChannel();

        // Comprobar sincronización pendiente (si soportado)
        if ('sync' in registration) {
          checkPendingSync(registration);
        }

      } catch (error) {
        console.error('[SW] Error registrando:', error);
        if (isMounted) {
          setState(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error.message : 'Error desconocido' 
          }));
        }
      }
    };

    // Esperar a que la página esté cargada
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
    }

    // Cleanup
    return () => {
      isMounted = false;
      window.removeEventListener('load', registerSW);
    };
  }, []);

  // =============================================================================
  // ESCUCHAR MENSAJES DEL SW
  // =============================================================================

  const setupMessageChannel = useCallback(() => {
    const channel = new MessageChannel();
    messageChannelRef.current = channel;

    channel.port1.onmessage = (event) => {
      const { type, payload } = event.data || {};

      switch (type) {
        case 'favorites-synced':
          console.log('[SW] Favoritos sincronizados:', payload);
          setState(prev => ({ ...prev, hasPendingSync: payload.pending > 0 }));
          break;

        case 'news-updated':
          console.log('[SW] Noticias actualizadas:', payload);
          break;

        case 'version':
          console.log('[SW] Versión:', payload);
          break;

        default:
          console.log('[SW] Mensaje recibido:', type, payload);
      }
    };

    // Enviar puerto al SW
    navigator.serviceWorker.ready.then(registration => {
      registration.active?.postMessage(
        { type: 'INIT_PORT' },
        [channel.port2]
      );
    });
  }, []);

  // =============================================================================
  // EVENTOS ONLINE/OFFLINE
  // =============================================================================

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      
      // Intentar sincronizar cuando vuelve la conexión
      if (registrationRef.current) {
        const swReg = registrationRef.current as ServiceWorkerRegistration & {
          sync?: { register(tag: string): Promise<void> };
        };
        swReg.sync?.register(SYNC_TAG);
      }
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // =============================================================================
  // ACCIONES
  // =============================================================================

  /**
   * Actualiza la aplicación a la nueva versión
   */
  const updateApp = useCallback(() => {
    if (!registrationRef.current?.waiting) {
      console.log('[SW] No hay SW esperando');
      return;
    }

    setState(prev => ({ ...prev, isUpdating: true }));

    // Enviar mensaje para activar el nuevo SW
    registrationRef.current.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Escuchar el controllerchange para recargar
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('[SW] Nuevo controlador, recargando...');
      window.location.reload();
    });
  }, []);

  /**
   * Omite la espera del SW (alias de updateApp)
   */
  const skipWaiting = useCallback(() => {
    updateApp();
  }, [updateApp]);

  /**
   * Solicita sincronización de favoritos
   */
  const syncFavorites = useCallback(async (): Promise<boolean> => {
    try {
      const registration = registrationRef.current || await navigator.serviceWorker.ready;

      // Type assertion para Background Sync API (experimental)
      const swReg = registration as ServiceWorkerRegistration & {
        sync?: { register(tag: string): Promise<void> };
      };

      if (swReg.sync) {
        await swReg.sync.register(SYNC_TAG);
        console.log('[SW] Sync registrado');
        return true;
      } else {
        // Fallback para navegadores sin Background Sync
        console.log('[SW] Background Sync no soportado, enviando mensaje directo');
        await sendMessage('SYNC_FAVORITES');
        return true;
      }
    } catch (error) {
      console.error('[SW] Error registrando sync:', error);
      return false;
    }
  }, []);

  /**
   * Comprueba manualmente si hay actualizaciones
   */
  const checkForUpdates = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('[SW] Actualización comprobada');
    } catch (error) {
      console.error('[SW] Error comprobando actualizaciones:', error);
    }
  }, []);

  /**
   * Envía mensaje al Service Worker
   */
  const sendMessage = useCallback(async (type: string, payload?: unknown): Promise<unknown> => {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage(
          { type, payload },
          [channel.port2]
        );
      });

      // Timeout por si el SW no responde
      setTimeout(() => resolve(null), 5000);
    });
  }, []);

  /**
   * Obtiene el tamaño total de la caché
   */
  const getCacheSize = useCallback(async (): Promise<number> => {
    const result = await sendMessage('GET_CACHE_SIZE') as { size?: number };
    return result?.size || 0;
  }, [sendMessage]);

  /**
   * Limpia todas las cachés
   */
  const clearCache = useCallback(async () => {
    await sendMessage('CLEAR_CACHE');
  }, [sendMessage]);

  // =============================================================================
  // UTILS
  // =============================================================================

  /**
   * Comprueba si hay sincronización pendiente
   */
  const checkPendingSync = async (registration: ServiceWorkerRegistration) => {
    // Nota: La API de Tags no está disponible en todos los navegadores
    // Usamos IndexedDB para trackear esto en el SW
    try {
      const result = await sendMessage('CHECK_PENDING_SYNC') as { hasPending?: boolean };
      setState(prev => ({ ...prev, hasPendingSync: result?.hasPending || false }));
    } catch {
      // Ignorar errores
    }
  };

  return {
    ...state,
    updateApp,
    skipWaiting,
    syncFavorites,
    checkForUpdates,
    getCacheSize,
    clearCache,
    sendMessage,
  };
}

// =============================================================================
// FUNCIONES UTILITARIAS
// =============================================================================

/**
 * Registra el Service Worker (función standalone)
 * Útil para llamar en main.tsx sin usar el hook
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(SW_PATH);
    console.log('[SW] Registrado:', registration.scope);
  } catch (error) {
    console.error('[SW] Error:', error);
  }
}

/**
 * Desregistra el Service Worker (útil para debugging)
 */
export async function unregisterServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  await registration.unregister();
  console.log('[SW] Desregistrado');
}

/**
 * Solicita permiso para notificaciones push
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('[SW] Notificaciones no soportadas');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Suscribe a notificaciones push
 */
export async function subscribeToPush(
  publicVapidKey: string
): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: toBufferSource(urlBase64ToUint8Array(publicVapidKey)),
    });

    console.log('[SW] Suscrito a push:', subscription);
    return subscription;
  } catch (error) {
    console.error('[SW] Error suscribiendo a push:', error);
    return null;
  }
}

/**
 * Cancela suscripción a notificaciones push
 */
export async function unsubscribeFromPush(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      await subscription.unsubscribe();
      console.log('[SW] Desuscrito de push');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[SW] Error desuscribiendo:', error);
    return false;
  }
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Convierte base64 a Uint8Array para VAPID key
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

/**
 * Convierte Uint8Array a ArrayBuffer para PushSubscriptionOptionsInit
 */
function toBufferSource(arr: Uint8Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { ServiceWorkerState, ServiceWorkerActions };
export default useServiceWorker;
