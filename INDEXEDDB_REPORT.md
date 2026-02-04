# FCH Noticias - Sistema de Caché Offline con IndexedDB

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de caché offline utilizando IndexedDB para la aplicación FCH Noticias. El sistema permite almacenar hasta 50-100 noticias, jugadores y categorías localmente, sincronización bidireccional de favoritos, y limpieza automática de datos antiguos.

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| IndexedDB Wrapper | `idb` | ^8.0.0 |
| Cliente tRPC | `@trpc/react-query` | ^11.6.0 |
| Gestión de Estado | TanStack Query | ^5.90.2 |
| Lenguaje | TypeScript | 5.9.3 |

### Estructura de Archivos

```
client/src/
├── lib/
│   ├── db.ts          # Configuración IndexedDB + funciones CRUD
│   ├── sync.ts        # Lógica de sincronización bidireccional
│   └── cleanup.ts     # Limpieza automática de caché
├── hooks/
│   ├── useOfflineData.ts    # Hook de estado offline/sync
│   ├── useCachedNews.ts     # Hook para noticias cacheadas
│   └── useCachedPlayers.ts  # Hook para jugadores cacheados
```

## 🗄️ Schema de IndexedDB

### Database: `fch-noticias-db`

```typescript
Database: fch-noticias-db
Version: 1
Stores: 5 object stores + metadata
```

### Stores

#### 1. `news` - Noticias Cacheadas

```typescript
interface CachedNewsItem {
  id: string;                    // UUID
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  categoryId: string | null;
  authorId: string | null;
  publishedAt: Date | null;
  views: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
  cachedAt: number;              // Timestamp de caché
  category?: Category | null;
}

Indexes:
- by-date: publishedAt
- by-cached: cachedAt
- by-category: categoryId
- by-featured: featured
```

**Límites:**
- Máximo 100 noticias en caché
- Expiración: 7 días

#### 2. `players` - Jugadores Cacheados

```typescript
interface CachedPlayer {
  id: string;                    // UUID
  name: string;
  slug: string;
  position: string | null;
  team: string | null;
  nationality: string;
  age: number | null;
  height: number | null;
  weight: number | null;
  imageUrl: string | null;
  stats: PlayerStats;
  marketValue: number | null;
  createdAt: Date;
  cachedAt: number;              // Timestamp de caché
}

Indexes:
- by-name: name
- by-cached: cachedAt
- by-team: team
```

**Límites:**
- Máximo 50 jugadores en caché
- Expiración: 7 días

#### 3. `categories` - Categorías

```typescript
interface CachedCategory {
  id: string;                    // UUID
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  createdAt: Date;
  cachedAt: number;              // Timestamp de caché
}

Indexes:
- by-cached: cachedAt
```

#### 4. `favorites` - Favoritos Offline

```typescript
interface CachedFavorite {
  id: string;                    // UUID local
  userId: string;
  newsId: string | null;
  playerId: string | null;
  synced: boolean;               // Estado de sincronización
  cachedAt: number;
  createdAt: number;
}

Indexes:
- by-user: userId
- by-synced: synced
- by-news: newsId
- by-player: playerId
```

#### 5. `sync-queue` - Cola de Sincronización

```typescript
interface SyncQueueItem {
  id: string;                    // ID único de operación
  operation: 'create' | 'update' | 'delete';
  entity: 'favorite' | 'reading_history' | 'comment';
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;               // Contador de reintentos
}

Indexes:
- by-timestamp: timestamp
- by-retries: retries
```

**Límites:**
- Máximo 5 reintentos por operación
- Eliminación automática después de 30 días

#### 6. `metadata` - Metadatos del Sistema

```typescript
interface Metadata {
  key: string;
  value: unknown;
  updatedAt: number;
}
```

Almacena:
- `lastSync`: Timestamp última sincronización
- `lastCleanup`: Timestamp última limpieza
- `lastNewsSync`: Timestamp última sync de noticias
- `lastPlayersSync`: Timestamp última sync de jugadores

## 🔧 API de Funciones CRUD

### Noticias

```typescript
// Guardar noticias en caché
async function cacheNews(news: NewsItem | NewsItem[]): Promise<void>

// Obtener últimas noticias (ordenadas por fecha)
async function getCachedNews(limit = 50): Promise<CachedNewsItem[]>

// Obtener noticia por ID
async function getCachedNewsById(id: string): Promise<CachedNewsItem | undefined>

// Obtener noticia por slug
async function getCachedNewsBySlug(slug: string): Promise<CachedNewsItem | undefined>

// Obtener noticias destacadas
async function getCachedFeaturedNews(limit = 5): Promise<CachedNewsItem[]>

// Obtener noticias por categoría
async function getCachedNewsByCategory(categoryId: string, limit = 20): Promise<CachedNewsItem[]>

// Eliminar noticia del caché
async function removeCachedNews(id: string): Promise<void>
```

### Jugadores

```typescript
// Guardar jugadores en caché
async function cachePlayer(player: Player | Player[]): Promise<void>

// Obtener jugadores cacheados
async function getCachedPlayers(limit = 50): Promise<CachedPlayer[]>

// Obtener jugador por ID
async function getCachedPlayerById(id: string): Promise<CachedPlayer | undefined>

// Obtener jugador por slug
async function getCachedPlayerBySlug(slug: string): Promise<CachedPlayer | undefined>

// Obtener jugadores por equipo
async function getCachedPlayersByTeam(team: string): Promise<CachedPlayer[]>
```

### Categorías

```typescript
// Guardar categorías
async function cacheCategories(categories: Category | Category[]): Promise<void>

// Obtener todas las categorías
async function getCachedCategories(): Promise<CachedCategory[]>
```

### Favoritos Offline

```typescript
// Agregar favorito en modo offline
async function addToFavoritesOffline(favorite: Omit<Favorite, 'id' | 'createdAt'>): Promise<CachedFavorite>

// Obtener favoritos de un usuario
async function getCachedFavoritesByUser(userId: string): Promise<CachedFavorite[]>

// Obtener favoritos no sincronizados
async function getUnsyncedFavorites(): Promise<CachedFavorite[]>

// Marcar favorito como sincronizado
async function markFavoriteAsSynced(id: string): Promise<void>

// Verificar si noticia está en favoritos
async function isNewsFavorited(userId: string, newsId: string): Promise<boolean>

// Verificar si jugador está en favoritos
async function isPlayerFavorited(userId: string, playerId: string): Promise<boolean>
```

### Cola de Sincronización

```typescript
// Agregar a cola de sync
async function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): Promise<SyncQueueItem>

// Obtener items pendientes
async function getSyncQueuePending(maxRetries = 5): Promise<SyncQueueItem[]>

// Incrementar contador de reintentos
async function incrementSyncRetry(id: string): Promise<void>

// Eliminar de cola
async function removeFromSyncQueue(id: string): Promise<void>
```

### Utilidades

```typescript
// Obtener estadísticas del caché
async function getCacheStats(): Promise<{
  newsCount: number;
  playersCount: number;
  categoriesCount: number;
  favoritesCount: number;
  syncQueueCount: number;
  oldestCache: number | null;
}>

// Guardar metadata
async function setMetadata(key: string, value: unknown): Promise<void>

// Obtener metadata
async function getMetadata<T>(key: string): Promise<T | undefined>

// Verificar disponibilidad de IndexedDB
function isIndexedDBAvailable(): boolean

// Inicializar base de datos
async function initializeDB(): Promise<boolean>
```

## 🎣 Hooks React

### useOfflineData

Hook principal para gestionar el estado offline y sincronización.

```typescript
function useOfflineData(): {
  // Estado
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
  
  // Acciones
  syncNow: () => Promise<void>;
  clearCache: () => Promise<void>;
  refreshStats: () => Promise<void>;
}
```

**Características:**
- Detecta cambios de conectividad (online/offline)
- Sincroniza automáticamente cuando vuelve la conexión
- Limpieza automática cada 24 horas
- Soporta Background Sync API

**Ejemplo de uso:**

```tsx
import { useOfflineData } from '@/hooks';

function App() {
  const { isOnline, isSyncing, pendingSyncCount, syncNow } = useOfflineData();
  
  return (
    <div>
      {!isOnline && <Banner>Modo offline - Datos cacheados</Banner>}
      {pendingSyncCount > 0 && (
        <Button onClick={syncNow}>
          Sincronizar {pendingSyncCount} cambios
        </Button>
      )}
    </div>
  );
}
```

### useCachedNews

Hook para obtener noticias con soporte offline.

```typescript
function useCachedNews(options?: {
  enabled?: boolean;
  limit?: number;
  categoryId?: string;
  featured?: boolean;
  autoRefresh?: boolean;
}): {
  data: CachedNewsItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  isFromCache: boolean;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  invalidate: () => Promise<void>;
}
```

**Variantes:**
- `useCachedNewsById(newsId)` - Obtener noticia por ID
- `useCachedNewsBySlug(slug)` - Obtener noticia por slug

**Ejemplo de uso:**

```tsx
import { useCachedNews } from '@/hooks';

function NewsList() {
  const { data, isLoading, isFromCache, lastUpdated } = useCachedNews({
    limit: 20,
    featured: true,
  });
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      {isFromCache && (
        <Badge>Offline - {lastUpdated?.toLocaleString()}</Badge>
      )}
      {data.map(news => <NewsCard key={news.id} {...news} />)}
    </div>
  );
}
```

### useCachedPlayers

Hook para obtener jugadores con soporte offline.

```typescript
function useCachedPlayers(options?: {
  enabled?: boolean;
  limit?: number;
  position?: string;
  team?: string;
  autoRefresh?: boolean;
}): {
  data: CachedPlayer[];
  isLoading: boolean;
  isFromCache: boolean;
  // ... otros campos
}
```

**Variantes:**
- `useCachedPlayerById(playerId)` - Obtener jugador por ID
- `useCachedPlayerBySlug(slug)` - Obtener jugador por slug
- `useCachedPlayersByTeam(team)` - Obtener jugadores por equipo

### useNetworkStatus

Hook simple para detectar estado de red.

```typescript
function useNetworkStatus(): {
  isOnline: boolean;
  type?: string;  // '4g', '3g', '2g', 'slow-2g'
}
```

### useBackgroundSync

Hook para usar la Background Sync API.

```typescript
function useBackgroundSync(): {
  isSupported: boolean;
  requestSync: (tag?: string) => Promise<boolean>;
}
```

## 🔄 Sincronización

### Estrategia de Sincronización

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Cliente       │────▶│   Cola Local    │────▶│   Servidor      │
│   (Offline)     │     │   (IndexedDB)   │     │   (tRPC)        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         │              │  Sync Queue     │              │
         └─────────────▶│  (FIFO + Retry) │◀─────────────┘
                        └─────────────────┘
```

### Flujo de Sincronización

1. **Usuario agrega favorito offline**
   - Guardar en `favorites` store (synced: false)
   - Agregar a `sync-queue`

2. **Detección de conexión restaurada**
   - Event `online` dispara `syncNow()`
   - O Background Sync API si disponible

3. **Procesamiento de cola**
   - Obtener items pendientes de `sync-queue`
   - Ejecutar mutations de tRPC
   - Marcar como sincronizados

4. **Manejo de errores**
   - Incrementar contador de reintentos
   - Backoff exponencial: `delay = 2^retries * 1000ms`
   - Máximo 5 reintentos
   - Eliminar después de 30 días

### Configuración de Backoff

```typescript
const MAX_RETRY_ATTEMPTS = 5;
const BASE_RETRY_DELAY = 1000;  // 1 segundo
const MAX_RETRY_DELAY = 60000;  // 60 segundos

// Fórmula: delay = min(2^attempts * baseDelay + jitter, maxDelay)
```

## 🧹 Limpieza de Caché

### Rutinas Automáticas

| Rutina | Frecuencia | Descripción |
|--------|-----------|-------------|
| Expired Cleanup | 24 horas | Elimina items con >7 días de antigüedad |
| Limit Enforcement | 24 horas | Mantiene máximo 100 noticias, 50 jugadores |
| Orphaned Images | 24 horas | Elimina imágenes no referenciadas |
| Failed Sync Cleanup | 24 horas | Elimina items con >5 reintentos fallidos |

### Funciones de Limpieza

```typescript
// Limpiar items expirados (>7 días)
async function cleanupExpiredCache(): Promise<number>

// Mantener límite de noticias
async function enforceMaxNewsLimit(maxNews = 100): Promise<number>

// Mantener límite de jugadores
async function enforceMaxPlayersLimit(maxPlayers = 50): Promise<number>

// Limpiar imágenes huérfanas
async function cleanupOrphanedImages(): Promise<number>

// Limpiar items de sync fallidos
async function cleanupFailedSyncItems(maxRetries = 5): Promise<number>

// Ejecutar todas las rutinas
async function runFullCleanup(): Promise<CleanupResults>
```

### Estadísticas de Almacenamiento

```typescript
async function getStorageStats(): Promise<{
  usage: number | null;      // Bytes usados
  quota: number | null;      // Cuota total
  usageDetails?: Record<string, number>;
}>;
```

## 🔒 Persistencia de Almacenamiento

El sistema intenta solicitar almacenamiento persistente para evitar que el navegador borre datos:

```typescript
async function requestPersistentStorage(): Promise<boolean>
```

Esto es especialmente importante en dispositivos móviles donde el sistema puede liberar almacenamiento.

## 📊 Monitoreo y Debugging

### Consola del Navegador

Todos los módulos logean información útil:

```
[IndexedDB] Database initialized: fch-noticias-db v1
[IndexedDB] Cached 50 news items
[IndexedDB] Added offline favorite: offline-1234567890-abc123
[IndexedDB] Added to sync queue: sync-1234567890-def456
[Sync] Starting sync for 3 favorites...
[Sync] Favorites sync completed: 3 synced, 0 failed
[Cleanup] Removed 5 expired items
[OfflineData] Connection restored, refreshing...
```

### Inspección de IndexedDB

1. Abrir DevTools (F12)
2. Ir a "Application" → "IndexedDB"
3. Seleccionar `fch-noticias-db`
4. Explorar object stores

### Métricas

```typescript
// Obtener estadísticas completas
const stats = await getCacheStats();
console.log(stats);
// {
//   newsCount: 45,
//   playersCount: 23,
//   categoriesCount: 8,
//   favoritesCount: 12,
//   syncQueueCount: 3,
//   oldestCache: 1704067200000
// }
```

## 🚀 Integración con tRPC

### Intercepción de Queries

Los hooks `useCachedNews` y `useCachedPlayers` interceptan automáticamente:

1. **Online**: Usan tRPC + cachean resultado en IndexedDB
2. **Offline**: Sirven desde IndexedDB directamente
3. **Reconexión**: Refetch automático + actualización de UI

### Ejemplo de Flujo Completo

```tsx
function NewsPage() {
  // Este hook maneja automáticamente:
  // - Carga desde caché mientras fetch del servidor
  // - Servir desde caché si está offline
  // - Auto-refresh cuando vuelve conexión
  const { data, isLoading, isFromCache } = useCachedNews({ limit: 20 });
  
  // Este hook maneja sincronización y estado de conexión
  const { isOnline, pendingSyncCount, syncNow } = useOfflineData();
  
  return (
    <div>
      <StatusBar 
        isOnline={isOnline} 
        isFromCache={isFromCache}
        pendingSync={pendingSyncCount}
        onSync={syncNow}
      />
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <NewsGrid news={data} />
      )}
    </div>
  );
}
```

## 📝 Notas de Implementación

### Limitaciones Conocidas

1. **IDs del Servidor vs Cliente**: Los routers de tRPC usan `z.number()` pero el schema usa UUIDs. Se hace conversión automática donde es necesario.

2. **Background Sync**: Requiere Service Worker configurado. Si no está disponible, se usa polling cada 5 minutos.

3. **Storage Quota**: Los navegadores pueden limitar el almacenamiento. Se implementa detección de cuota crítica.

4. **iOS Safari**: Tiene limitaciones con IndexedDB en modo privado. Se debe verificar disponibilidad.

### Próximas Mejoras

- [ ] Sincronización de reading history
- [ ] Soporte para comentarios offline
- [ ] Compresión de datos antes de almacenar
- [ ] Sincronización diferencial (solo cambios)
- [ ] Conflicto de resolución UI (manual merge)

## 📈 Performance

### Métricas Esperadas

| Operación | Tiempo Estimado |
|-----------|----------------|
| Inicialización DB | < 100ms |
| Lectura caché (50 items) | < 50ms |
| Escritura caché (50 items) | < 200ms |
| Sincronización favoritos | < 500ms |
| Limpieza completa | < 1000ms |

### Tamaño de Almacenamiento

| Entidad | Tamaño Aproximado |
|---------|------------------|
| Noticia (con contenido) | 2-10 KB |
| Jugador (con stats) | 1-3 KB |
| Categoría | 0.5 KB |
| Favorito | 0.2 KB |
| **Total (máximo)** | **~1 MB** |

## 🔧 Troubleshooting

### Problema: IndexedDB no disponible

```typescript
if (!isIndexedDBAvailable()) {
  // Fallback: usar localStorage para datos críticos
  // o mostrar mensaje de error
}
```

### Problema: Quota excedida

```typescript
const isCritical = await isStorageCritical(90);
if (isCritical) {
  await runFullCleanup();
}
```

### Problema: Sincronización fallida

```typescript
const { pendingSyncCount, syncNow } = useOfflineData();

// Mostrar UI de reintentos
if (pendingSyncCount > 0) {
  // Botón para reintentar manualmente
  <Button onClick={syncNow}>
    Reintentar ({pendingSyncCount} pendientes)
  </Button>
}
```

## 📚 Referencias

- [IndexedDB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [idb library - GitHub](https://github.com/jakearchibald/idb)
- [Background Sync API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Background_Sync_API)
- [Storage API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API)

---

**Documentación generada:** 2026-02-03  
**Versión del sistema:** 1.0.0  
**Autor:** IndexedDB Manager Agent
