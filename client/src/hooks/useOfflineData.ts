/**
 * FCH Noticias - Hook de Datos Offline
 * 
 * Hook para gestionar el estado de conexión, sincronización de datos
 * y limpieza automática del caché.
 * 
 * @module client/src/hooks/useOfflineData
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  initializeDB,
  getSyncQueuePending,
  removeFromSyncQueue,
  markFavoriteAsSynced,
  incrementSyncRetry,
  getCacheStats,
  setMetadata,
  getMetadata,
  CACHE_EXPIRY_MS,
  MAX_CACHED_NEWS,
  type CachedFavorite,
} from '../lib/db';
import { trpc } from '../lib/trpc';

// ============================================================================
// TIPOS
// ============================================================================

export interface OfflineDataState {
  isOnline: boolean;
  isInitialized: boolean;
  lastSync: Date | null;
  isSyncing: boolean;
  pendingSyncCount: number;
  cacheStats: {
    newsCount: number;
    playersCount: number;
    categoriesCount: number;
    favoritesCount: number;
  };
}

export interface OfflineDataActions {
  syncNow: () => Promise<void>;
  clearCache: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos
const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas
const BACKGROUND_SYNC_TAG = 'fch-sync-favorites';

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useOfflineData(): OfflineDataState & OfflineDataActions {
  // Estado de conexión
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  
  // Estado de inicialización
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Estado de sincronización
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  
  // Estadísticas del caché
  const [cacheStats, setCacheStats] = useState({
    newsCount: 0,
    playersCount: 0,
    categoriesCount: 0,
    favoritesCount: 0,
  });
  
  // Referencias para intervals
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // tRPC mutations para sincronización
  const toggleFavoriteNews = trpc.favorites.news.toggle.useMutation();
  const toggleFavoritePlayer = trpc.favorites.players.toggle.useMutation();
  
  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================
  
  useEffect(() => {
    const init = async () => {
      const initialized = await initializeDB();
      setIsInitialized(initialized);
      
      if (initialized) {
        // Cargar última sincronización
        const savedLastSync = await getMetadata<number>('lastSync');
        if (savedLastSync) {
          setLastSync(new Date(savedLastSync));
        }
        
        // Actualizar estadísticas
        await refreshStats();
        
        // Contar items pendientes
        await updatePendingCount();
      }
    };
    
    init();
  }, []);
  
  // ============================================================================
  // DETECCIÓN DE CONECTIVIDAD
  // ============================================================================
  
  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineData] Connection restored');
      setIsOnline(true);
      // Intentar sincronizar automáticamente
      syncNow();
    };
    
    const handleOffline = () => {
      console.log('[OfflineData] Connection lost');
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Verificar estado inicial
    setIsOnline(navigator.onLine);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // ============================================================================
  // SINCRONIZACIÓN AUTOMÁTICA
  // ============================================================================
  
  useEffect(() => {
    if (!isInitialized) return;
    
    // Sincronizar cada 5 minutos si hay conexión
    syncIntervalRef.current = setInterval(() => {
      if (navigator.onLine && pendingSyncCount > 0) {
        syncNow();
      }
    }, SYNC_INTERVAL_MS);
    
    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [isInitialized, pendingSyncCount]);
  
  // ============================================================================
  // LIMPIEZA AUTOMÁTICA
  // ============================================================================
  
  useEffect(() => {
    if (!isInitialized) return;
    
    // Limpiar caché cada 24 horas
    cleanupIntervalRef.current = setInterval(() => {
      cleanupOldCache();
    }, CLEANUP_INTERVAL_MS);
    
    // Limpiar al inicializar (pero no bloquear)
    cleanupOldCache();
    
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
    };
  }, [isInitialized]);
  
  // ============================================================================
  // BACKGROUND SYNC API
  // ============================================================================
  
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      console.log('[OfflineData] Background Sync not supported');
      return;
    }
    
    const registerBackgroundSync = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (registration as any).sync.register(BACKGROUND_SYNC_TAG);
        console.log('[OfflineData] Background sync registered');
      } catch (error) {
        console.error('[OfflineData] Background sync registration failed:', error);
      }
    };
    
    registerBackgroundSync();
  }, []);
  
  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================
  
  const updatePendingCount = async () => {
    const pending = await getSyncQueuePending();
    setPendingSyncCount(pending.length);
  };
  
  const refreshStats = async () => {
    const stats = await getCacheStats();
    setCacheStats({
      newsCount: stats.newsCount,
      playersCount: stats.playersCount,
      categoriesCount: stats.categoriesCount,
      favoritesCount: stats.favoritesCount,
    });
  };
  
  // ============================================================================
  // SINCRONIZACIÓN MANUAL
  // ============================================================================
  
  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      console.log('[OfflineData] Cannot sync: offline');
      return;
    }
    
    if (isSyncing) {
      console.log('[OfflineData] Sync already in progress');
      return;
    }
    
    setIsSyncing(true);
    console.log('[OfflineData] Starting sync...');
    
    try {
      const pendingItems = await getSyncQueuePending();
      
      if (pendingItems.length === 0) {
        console.log('[OfflineData] Nothing to sync');
        setIsSyncing(false);
        return;
      }
      
      console.log(`[OfflineData] Syncing ${pendingItems.length} items...`);
      
      for (const item of pendingItems) {
        try {
          await syncItem(item);
          await removeFromSyncQueue(item.id);
          
          // Si era un favorito, marcarlo como sincronizado
          if (item.entity === 'favorite' && item.data.id) {
            await markFavoriteAsSynced(item.data.id as string);
          }
        } catch (error) {
          console.error(`[OfflineData] Failed to sync item ${item.id}:`, error);
          await incrementSyncRetry(item.id);
        }
      }
      
      // Actualizar timestamp de última sincronización
      const now = Date.now();
      await setMetadata('lastSync', now);
      setLastSync(new Date(now));
      
      // Actualizar contadores
      await updatePendingCount();
      await refreshStats();
      
      console.log('[OfflineData] Sync completed');
    } catch (error) {
      console.error('[OfflineData] Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);
  
  // ============================================================================
  // SINCRONIZACIÓN DE ITEMS INDIVIDUALES
  // ============================================================================
  
  const syncItem = async (item: {
    operation: string;
    entity: string;
    data: Record<string, unknown>;
  }): Promise<void> => {
    if (item.entity === 'favorite') {
      const data = item.data as { newsId?: string; playerId?: string };
      
      if (data.newsId) {
        await toggleFavoriteNews.mutateAsync({ newsId: parseInt(data.newsId) });
      } else if (data.playerId) {
        await toggleFavoritePlayer.mutateAsync({ playerId: parseInt(data.playerId) });
      }
    }
    // Aquí se pueden agregar más entidades (reading_history, comments, etc.)
  };
  
  // ============================================================================
  // LIMPIEZA DE CACHÉ ANTIGUO
  // ============================================================================
  
  const cleanupOldCache = async () => {
    console.log('[OfflineData] Running cleanup...');
    
    try {
      const { cleanupExpiredCache, enforceMaxNewsLimit } = await import('../lib/cleanup');
      
      // Limpiar caché expirado (>7 días)
      const expiredCount = await cleanupExpiredCache();
      console.log(`[OfflineData] Removed ${expiredCount} expired items`);
      
      // Mantener máximo de noticias
      const excessCount = await enforceMaxNewsLimit(MAX_CACHED_NEWS);
      console.log(`[OfflineData] Removed ${excessCount} excess news items`);
      
      // Actualizar estadísticas
      await refreshStats();
      
      // Guardar timestamp de última limpieza
      await setMetadata('lastCleanup', Date.now());
    } catch (error) {
      console.error('[OfflineData] Cleanup failed:', error);
    }
  };
  
  // ============================================================================
  // LIMPIEZA TOTAL DEL CACHÉ
  // ============================================================================
  
  const clearCache = useCallback(async () => {
    try {
      const { clearAllCache } = await import('../lib/db');
      await clearAllCache();
      await refreshStats();
      console.log('[OfflineData] Cache cleared');
    } catch (error) {
      console.error('[OfflineData] Failed to clear cache:', error);
    }
  }, []);
  
  return {
    isOnline,
    isInitialized,
    lastSync,
    isSyncing,
    pendingSyncCount,
    cacheStats,
    syncNow,
    clearCache,
    refreshStats,
  };
}

// ============================================================================
// HOOK ADICIONAL: useNetworkStatus
// ============================================================================

export function useNetworkStatus(): { isOnline: boolean; type?: string } {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string | undefined>();
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Detectar tipo de conexión si está disponible
    const connection = (navigator as any).connection;
    if (connection) {
      setConnectionType(connection.effectiveType);
      connection.addEventListener('change', () => {
        setConnectionType(connection.effectiveType);
      });
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return { isOnline, type: connectionType };
}

// ============================================================================
// HOOK ADICIONAL: useBackgroundSync
// ============================================================================

export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'SyncManager' in window);
  }, []);
  
  const requestSync = useCallback(async (tag: string = 'fch-sync') => {
    if (!isSupported) {
      console.warn('[BackgroundSync] Not supported');
      return false;
    }
    
    try {
      const registration = await navigator.serviceWorker.ready;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (registration as any).sync.register(tag);
      return true;
    } catch (error) {
      console.error('[BackgroundSync] Registration failed:', error);
      return false;
    }
  }, [isSupported]);
  
  return { isSupported, requestSync };
}

export default useOfflineData;
