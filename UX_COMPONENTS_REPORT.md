# UX Components Report - FCH Noticias

## Resumen

Se han creado 10 componentes de UX para mejorar la experiencia de usuario en FCH Noticias, incluyendo skeletons, infinite scroll, empty states, loading overlays y sistema de toasts.

---

## Componentes Creados

### 1. Skeleton Components (`client/src/components/skeletons/`)

#### NewsCardSkeleton
**Archivo:** `client/src/components/skeletons/NewsCardSkeleton.tsx`

Skeleton para tarjetas de noticias con 3 variantes:
- `default`: Tarjeta estándar con imagen, badge de categoría, título, excerpt y metadata
- `compact`: Versión compacta para listados densos
- `featured`: Versión destacada con más espacio visual

```tsx
<NewsCardSkeleton variant="default" />
<NewsCardSkeleton variant="compact" />
<NewsCardSkeleton variant="featured" />
```

#### PlayerCardSkeleton
**Archivo:** `client/src/components/skeletons/PlayerCardSkeleton.tsx`

Skeleton para tarjetas de jugadores:
- Avatar/Imagen shimmer
- Badge de rating circular
- Información de posición y equipo
- Grid de estadísticas (goles, asistencias, partidos)

```tsx
<PlayerCardSkeleton />
```

#### ListSkeleton
**Archivo:** `client/src/components/skeletons/ListSkeleton.tsx`

Skeleton para listas verticales con configuración flexible:
- `items`: Número de items (default: 5)
- `showAvatar`: Muestra avatar circular
- `showIcon`: Muestra icono cuadrado
- `linesPerItem`: Líneas de texto por item (1-3)

```tsx
<ListSkeleton items={8} showAvatar linesPerItem={2} />
<ListSkeleton items={5} showIcon linesPerItem={3} />
```

#### GridSkeleton
**Archivo:** `client/src/components/skeletons/GridSkeleton.tsx`

Skeleton para grids de cards:
- `columns`: 1-4 columnas responsive
- `items`: 4-12 items (default: 8)
- `itemHeight`: sm | md | lg
- `showImage`: Mostrar/ocultar imagen

```tsx
<GridSkeleton columns={4} items={8} itemHeight="md" />
<GridSkeleton columns={2} items={6} showImage={false} />
```

#### DetailSkeleton
**Archivo:** `client/src/components/skeletons/DetailSkeleton.tsx`

Skeleton para páginas de detalle con 3 variantes:
- `news`: Página de noticia con hero, título, contenido y comentarios
- `player`: Página de jugador con card lateral y tabs
- `generic`: Estructura genérica de detalle

```tsx
<DetailSkeleton variant="news" />
<DetailSkeleton variant="player" />
<DetailSkeleton variant="generic" />
```

#### Barrel Export
**Archivo:** `client/src/components/skeletons/index.ts`

```tsx
export { NewsCardSkeleton } from './NewsCardSkeleton';
export { PlayerCardSkeleton } from './PlayerCardSkeleton';
export { ListSkeleton } from './ListSkeleton';
export { GridSkeleton } from './GridSkeleton';
export { DetailSkeleton } from './DetailSkeleton';
```

---

### 2. InfiniteScroll Component
**Archivo:** `client/src/components/InfiniteScroll.tsx`

Implementación con Intersection Observer API para carga infinita:

**Props:**
```typescript
interface InfiniteScrollProps {
  onLoadMore: () => Promise<void>;  // Callback async para cargar más
  hasMore: boolean;                  // Indica si hay más contenido
  threshold?: number;                // Pixeles antes del final (default: 100)
  loader?: React.ReactNode;          // Loader personalizado
  children: React.ReactNode;         // Contenido a renderizar
  reverse?: boolean;                 // Soporte para scroll inverso
  debounceMs?: number;               // Debounce para evitar múltiples calls
}
```

**Uso:**
```tsx
<InfiniteScroll
  onLoadMore={loadMoreNews}
  hasMore={hasMoreNews}
  threshold={150}
>
  {news.map(item => <NewsCard key={item.id} {...item} />)}
</InfiniteScroll>
```

**Características:**
- ✓ Intersection Observer nativo
- ✓ Debounce configurable (default: 200ms)
- ✓ Soporte para scroll inverso (chat-style)
- ✓ ARIA labels para accesibilidad
- ✓ Indicador "No hay más contenido"

---

### 3. EmptyState Component
**Archivo:** `client/src/components/EmptyState.tsx`

Componente para estados vacíos con ilustraciones y animaciones:

**Props:**
```typescript
interface EmptyStateProps {
  type?: "search" | "empty" | "error" | "offline" | "favorites" | "notFound" | "news" | "players";
  icon?: LucideIcon;           // Icono personalizado
  title?: string;              // Título personalizado
  description?: string;        // Descripción personalizada
  action?: React.ReactNode;    // Acción personalizada
  actionLabel?: string;        // Label del botón
  onAction?: () => void;       // Handler del botón
  compact?: boolean;           // Versión compacta
}
```

**Tipos Predefinidos:**
| Tipo | Icono | Título | Descripción |
|------|-------|--------|-------------|
| `search` | Search | No se encontraron resultados | Intenta con otros términos... |
| `empty` | PackageOpen | No hay contenido disponible | Parece que aún no hay nada... |
| `error` | AlertCircle | Algo salió mal | Hubo un error al cargar... |
| `offline` | CloudOff | Sin conexión | Verifica tu conexión... |
| `favorites` | Heart | No tienes favoritos | Guarda tus noticias y jugadores... |
| `notFound` | FileX | Página no encontrada | El contenido no existe... |
| `news` | Newspaper | No hay noticias | Aún no hay noticias... |
| `players` | Users | No se encontraron jugadores | Intenta ajustar los filtros... |

**Uso:**
```tsx
// Con tipo predefinido
<EmptyState type="search" />

// Con acción
<EmptyState 
  type="error" 
  actionLabel="Reintentar"
  onAction={refetch}
/>

// Personalizado
<EmptyState
  icon={CustomIcon}
  title="Título personalizado"
  description="Descripción personalizada"
/>

// Versión compacta
<EmptyState type="empty" compact />
```

**Helpers Exportados:**
```tsx
<SearchEmptyState onAction={handleRetry} />
<ErrorEmptyState onAction={refetch} />
<OfflineEmptyState />
<FavoritesEmptyState />
```

---

### 4. LoadingOverlay Component
**Archivo:** `client/src/components/LoadingOverlay.tsx`

Tres variantes de loading overlays:

#### LoadingOverlay
Overlay para contenedores específicos:

```tsx
<LoadingOverlay isLoading={isSaving} text="Guardando...">
  <FormContent />
</LoadingOverlay>
```

**Props:**
- `isLoading`: Estado de carga
- `text`: Texto opcional (default: "Cargando...")
- `blur`: Añade backdrop blur
- `preventInteraction`: Bloquea interacción (default: true)

#### FullScreenLoading
Overlay de pantalla completa:

```tsx
<FullScreenLoading isLoading={isInitializing} text="Iniciando app..." />
```

#### ButtonLoading
Estado de carga para botones:

```tsx
<ButtonLoading isLoading={isSubmitting} loadingText="Enviando...">
  <Button>Enviar</Button>
</ButtonLoading>
```

**Características:**
- ✓ Animaciones suaves con Framer Motion
- ✓ ARIA labels para accesibilidad
- ✓ Backdrop opcional con blur
- ✓ Spinner de shadcn/ui

---

### 5. Toast Helper
**Archivo:** `client/src/lib/toast.ts`

Sistema de notificaciones basado en Sonner con configuraciones FCH:

#### Funciones Principales
```typescript
toast.success(message, options?)
toast.error(message, options?)
toast.info(message, options?)
toast.warning(message, options?)
toast.loading(message, options?)
toast.promise(promise, messages, options?)
toast.dismiss(toastId?)
toast.update(toastId, message, options?)
```

#### Opciones
```typescript
interface ToastOptions {
  duration?: number;      // ms (default: 4000)
  position?: string;      // bottom-right | top-center | etc
  description?: string;   // Texto secundario
  action?: { label: string; onClick: () => void }
  onDismiss?: () => void
  onAutoClose?: () => void
}
```

#### Posición Responsive
- Desktop: `bottom-right`
- Mobile: `top-center`

#### Mensajes Predefinidos
```typescript
import { toastMessages } from '@/lib/toast';

toast.success(toastMessages.favorites.added("Jugador"));
toast.error(toastMessages.network.error);
toast.success(toastMessages.sync.success);
```

#### Hook useFCHToasts
```typescript
import { useFCHToasts } from '@/lib/toast';

function MyComponent() {
  const { favoriteAdded, networkError, commentPosted } = useFCHToasts();
  
  const handleFavorite = () => {
    addFavorite.mutate(data, {
      onSuccess: () => favoriteAdded(player.name),
      onError: () => networkError()
    });
  };
}
```

**Mensajes Incluidos:**
- Favorites: added, removed, error
- Network: error, offline, online
- Sync: success, error, inProgress
- Auth: loginSuccess, loginError, logoutSuccess, sessionExpired
- Comments: posted, deleted, error
- Share: copied, error

---

## Integración con Componentes Existentes

### Ejemplo: Home.tsx con nuevos Skeletons

```tsx
import { NewsCardSkeleton, GridSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';

// Reemplazar el loading actual:
{isLoading ? (
  <GridSkeleton columns={4} items={8} itemHeight="md" />
) : newsList?.length > 0 ? (
  <div className="grid...">
    {newsList.map(...)}
  </div>
) : (
  <EmptyState type="news" />
)}
```

### Ejemplo: NewsDetail.tsx con DetailSkeleton

```tsx
import { DetailSkeleton } from '@/components/skeletons';

if (isLoading) {
  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <DetailSkeleton variant="news" />
      </div>
    </Layout>
  );
}
```

### Ejemplo: Players.tsx con InfiniteScroll

```tsx
import { InfiniteScroll } from '@/components/InfiniteScroll';
import { PlayerCardSkeleton } from '@/components/skeletons';
import { EmptyState } from '@/components/EmptyState';

// En el componente:
const [page, setPage] = useState(1);
const [allPlayers, setAllPlayers] = useState([]);

const loadMore = async () => {
  const nextPage = page + 1;
  const result = await fetchPlayers(nextPage);
  setAllPlayers(prev => [...prev, ...result]);
  setPage(nextPage);
};

// Render:
{isLoading && page === 1 ? (
  <div className="grid...">
    {Array.from({ length: 8 }).map((_, i) => (
      <PlayerCardSkeleton key={i} />
    ))}
  </div>
) : allPlayers.length > 0 ? (
  <InfiniteScroll
    onLoadMore={loadMore}
    hasMore={hasMore}
    threshold={200}
  >
    <div className="grid...">
      {allPlayers.map(...)}
    </div>
  </InfiniteScroll>
) : (
  <EmptyState type="players" />
)}
```

---

## Testing de Componentes

Para probar los componentes, se recomienda:

1. **Skeletons**: Verificar consistencia visual con los componentes reales
2. **InfiniteScroll**: Probar con throttling de red lento
3. **EmptyState**: Verificar animaciones y accesibilidad
4. **LoadingOverlay**: Probar interacción bloqueada
5. **Toast**: Verificar posición responsive y duraciones

---

## Archivos Creados

```
client/src/
├── components/
│   ├── skeletons/
│   │   ├── NewsCardSkeleton.tsx
│   │   ├── PlayerCardSkeleton.tsx
│   │   ├── ListSkeleton.tsx
│   │   ├── GridSkeleton.tsx
│   │   ├── DetailSkeleton.tsx
│   │   └── index.ts
│   ├── InfiniteScroll.tsx
│   ├── EmptyState.tsx
│   └── LoadingOverlay.tsx
├── lib/
│   └── toast.ts
└── UX_COMPONENTS_REPORT.md
```

---

## Dependencias Utilizadas

- `sonner`: Toasts (ya instalado)
- `framer-motion`: Animaciones
- `lucide-react`: Iconos
- `@/components/ui/skeleton`: Base skeleton
- `@/components/ui/spinner`: Spinner de carga
- `@/components/ui/button`: Botones
- `@/lib/utils`: Utilidad cn()

---

## Notas de Implementación

1. **Accesibilidad**: Todos los componentes incluyen ARIA labels y roles apropiados
2. **Responsive**: Los componentes se adaptan a mobile/desktop
3. **Tema**: Soporte completo para dark mode
4. **TypeScript**: Tipado estricto en todos los componentes
5. **Performance**: Animaciones optimizadas con Framer Motion
