# 🔌 API Documentation

Documentación completa de la API RESTful/tRPC de Chilenos Young.

## Overview

La API utiliza **tRPC** para type-safe end-to-end communication entre el cliente y el servidor.

```typescript
// Cliente
const { data } = trpc.news.list.useQuery({ limit: 10 });
// TypeScript infiere automáticamente el tipo de retorno
```

## Routers Disponibles

| Router | Descripción | Auth |
|--------|-------------|------|
| `news` | Gestión de noticias | Público/Admin |
| `players` | Gestión de jugadores | Público/Admin |
| `categories` | Categorías de noticias | Público/Admin |
| `transfers` | Transferencias de jugadores | Público/Admin |
| `favorites` | Favoritos de usuarios | Protegido |
| `leaderboards` | Tablas de clasificación | Público |

---

## News Router

### `news.list`
Lista noticias con paginación y filtros.

**Input:**
```typescript
{
  categoryId?: string;      // UUID de categoría
  categorySlug?: string;    // Slug de categoría
  limit?: number;           // Default: 20, Max: 100
  offset?: number;          // Default: 0
  featured?: boolean;       // Solo destacadas
  search?: string;          // Búsqueda full-text
  orderBy?: 'publishedAt' | 'views' | 'createdAt';
  order?: 'asc' | 'desc';
}
```

**Output:**
```typescript
{
  items: NewsItem[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

**Ejemplo:**
```typescript
const { data } = trpc.news.list.useQuery({
  categorySlug: 'primera-division',
  limit: 10,
  featured: true
});
```

---

### `news.getById`
Obtiene una noticia por su ID.

**Input:** `{ id: string }`

**Output:** `NewsItem`

---

### `news.getBySlug`
Obtiene una noticia por su slug (URL-friendly).

**Input:** `{ slug: string }`

**Output:** `NewsItem`

---

### `news.featured`
Lista noticias destacadas.

**Input:** `{ limit?: number }` (default: 5)

**Output:** `NewsItem[]`

---

### `news.search`
Búsqueda full-text de noticias.

**Input:** `{ query: string, limit?: number }`

**Output:** `NewsItem[]`

---

### `news.create` (Admin only)
Crea una nueva noticia.

**Input:**
```typescript
{
  title: string;        // Min 5, Max 255 chars
  slug: string;         // Min 5, Max 255 chars
  excerpt: string;      // Min 10, Max 500 chars
  content: string;      // Min 50 chars
  imageUrl?: string;    // URL válida
  categoryId?: string;  // UUID
  featured?: boolean;   // Default: false
  publishedAt?: Date;   // Opcional
}
```

**Output:** `NewsItem`

---

### `news.update` (Admin only)
Actualiza una noticia existente.

**Input:** `CreateNewsInput + { id: string }`

**Output:** `NewsItem`

---

### `news.delete` (Admin only)
Elimina una noticia.

**Input:** `{ id: string }`

**Output:** `{ success: boolean, id: string }`

---

### `news.incrementViews`
Incrementa el contador de vistas.

**Input:** `{ id: string }`

**Output:** `{ success: boolean }`

---

### `news.related`
Obtiene noticias relacionadas (misma categoría).

**Input:** `{ newsId: string, limit?: number }`

**Output:** `NewsItem[]`

---

### `news.stats`
Estadísticas de noticias.

**Output:**
```typescript
{
  total: number;
  featured: number;
  totalViews: number;
}
```

---

## Players Router

### `players.list`
Lista jugadores con paginación y filtros.

**Input:**
```typescript
{
  limit?: number;       // Default: 20
  offset?: number;      // Default: 0
  position?: string;    // Filtrar por posición
  team?: string;        // Filtrar por equipo
  minAge?: number;      // Edad mínima
  maxAge?: number;      // Edad máxima
  search?: string;      // Búsqueda por nombre/equipo
  orderBy?: 'name' | 'age' | 'marketValue' | 'createdAt';
  order?: 'asc' | 'desc';
}
```

**Output:**
```typescript
{
  items: Player[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

---

### `players.getById`
Obtiene un jugador por ID.

**Input:** `{ id: string }`

**Output:** `Player`

---

### `players.getBySlug`
Obtiene un jugador por slug con sus transferencias.

**Input:** `{ slug: string }`

**Output:** `Player & { transfers: Transfer[] }`

---

### `players.search`
Busca jugadores por nombre, equipo o posición.

**Input:** `{ query: string, limit?: number }`

**Output:** `Player[]`

---

### `players.featured`
Jugadores destacados (por valor de mercado).

**Input:** `{ limit?: number }`

**Output:** `Player[]`

---

### `players.prospects`
Jóvenes promesas (Sub-23 con valor > €1M).

**Input:** `{ limit?: number }`

**Output:** `Player[]`

---

### `players.positions`
Lista todas las posiciones disponibles.

**Output:** `string[]`

---

### `players.teams`
Lista todos los equipos.

**Output:** `string[]`

---

### `players.create` (Admin only)
Crea un nuevo jugador.

**Input:**
```typescript
{
  name: string;         // Min 2, Max 100
  slug: string;         // Min 2, Max 100
  position?: string;    // Max 50
  team?: string;        // Max 100
  nationality?: string; // Default: 'Chile'
  age?: number;         // 15-50
  height?: number;      // cm
  weight?: number;      // kg
  imageUrl?: string;
  stats?: {
    goals?: number;
    assists?: number;
    matches?: number;
    minutes?: number;
    yellowCards?: number;
    redCards?: number;
    cleanSheets?: number;
    saves?: number;
  };
  marketValue?: number; // euros
}
```

**Output:** `Player`

---

### `players.update` (Admin only)
Actualiza un jugador.

**Input:** `Partial<CreatePlayerInput> & { id: string }`

**Output:** `Player`

---

### `players.delete` (Admin only)
Elimina un jugador.

**Input:** `{ id: string }`

**Output:** `{ success: boolean, id: string }`

---

### `players.stats`
Estadísticas de jugadores.

**Output:**
```typescript
{
  total: number;
  averageAge: number;
  totalMarketValue: number;
  playingAbroad: number;
}
```

---

## Categories Router

### `categories.list`
Lista todas las categorías.

**Output:** `Category[]`

---

### `categories.getById`
Obtiene categoría por ID.

**Input:** `{ id: string }`

**Output:** `Category`

---

### `categories.getBySlug`
Obtiene categoría por slug.

**Input:** `{ slug: string }`

**Output:** `Category`

---

### `categories.create` (Admin only)
Crea categoría.

**Input:** `{ name: string, slug: string, description?: string, color?: string, icon?: string }`

**Output:** `Category`

---

### `categories.update` (Admin only)
Actualiza categoría.

**Input:** `Partial<CreateCategoryInput> & { id: string }`

**Output:** `Category`

---

### `categories.delete` (Admin only)
Elimina categoría.

**Input:** `{ id: string }`

**Output:** `{ success: boolean, id: string }`

---

## Transfers Router

### `transfers.list`
Lista transferencias.

**Input:** `{ status?: 'confirmed' | 'rumor' | 'pending', limit?: number }`

**Output:** `Transfer[]`

---

### `transfers.getByPlayer`
Transferencias de un jugador.

**Input:** `{ playerId: string }`

**Output:** `Transfer[]`

---

### `transfers.create` (Admin only)
Crea transferencia.

**Input:**
```typescript
{
  playerId: string;
  fromTeam?: string;
  toTeam?: string;
  date?: Date;
  fee?: string;        // "€5M", "Free", "Loan"
  type?: 'transfer' | 'loan' | 'free';
  status?: 'confirmed' | 'rumor' | 'pending';
}
```

**Output:** `Transfer`

---

## Favorites Router

### `favorites.list`
Lista favoritos del usuario autenticado.

**Input:** `{ type?: 'news' | 'players' }`

**Output:** `Favorite[]`

---

### `favorites.toggle`
Agrega o quita un favorito.

**Input:** `{ newsId?: string, playerId?: string }` (uno requerido)

**Output:** `{ isFavorited: boolean }`

---

### `favorites.check`
Verifica si una entidad está en favoritos.

**Input:** `{ newsId?: string, playerId?: string }`

**Output:** `{ isFavorited: boolean }`

---

## Leaderboards Router

### `leaderboards.getByType`
Obtiene tabla de clasificación.

**Input:** `{ type: 'goals' | 'assists' | 'mvps' | 'matches' | 'minutes', season?: string }`

**Output:**
```typescript
{
  type: string;
  season: string;
  data: Array<{
    playerId: string;
    playerName: string;
    playerSlug: string;
    team: string;
    imageUrl?: string;
    value: number;
    rank: number;
  }>;
  updatedAt: Date;
}
```

---

### `leaderboards.update` (Admin only)
Actualiza tabla de clasificación.

**Input:** `{ type: string, season?: string, data: LeaderboardEntry[] }`

**Output:** `Leaderboard`

---

## Tipos de Datos

### NewsItem
```typescript
interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  categoryId?: string;
  category?: Category;
  authorId?: string;
  publishedAt?: Date;
  views: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Player
```typescript
interface Player {
  id: string;
  name: string;
  slug: string;
  position?: string;
  team?: string;
  nationality: string;
  age?: number;
  height?: number;
  weight?: number;
  imageUrl?: string;
  stats: {
    goals?: number;
    assists?: number;
    matches?: number;
    minutes?: number;
    yellowCards?: number;
    redCards?: number;
    cleanSheets?: number;
    saves?: number;
  };
  marketValue?: number;
  createdAt: Date;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
}
```

### Transfer
```typescript
interface Transfer {
  id: string;
  playerId: string;
  fromTeam?: string;
  toTeam?: string;
  date?: Date;
  fee?: string;
  type: string;
  status: string;
  createdAt: Date;
}
```

### Favorite
```typescript
interface Favorite {
  id: string;
  userId: string;
  newsId?: string;
  playerId?: string;
  news?: NewsItem;
  player?: Player;
  createdAt: Date;
}
```

---

## Autenticación

La API usa **JWT tokens** en cookies HttpOnly.

### Obtener sesión
```typescript
// Login con OAuth redirige a /api/oauth/callback
// El servidor setea la cookie automáticamente
```

### Verificar autenticación
```typescript
const { data: user } = trpc.auth.getSession.useQuery();
```

### Cerrar sesión
```typescript
const logout = trpc.auth.logout.useMutation();
logout.mutate();
```

### Niveles de Autorización

| Nivel | Descripción |
|-------|-------------|
| `publicProcedure` | Sin autenticación requerida |
| `protectedProcedure` | Usuario autenticado |
| `adminProcedure` | Usuario con rol admin |

---

## Manejo de Errores

Los errores de tRPC incluyen código y mensaje:

```typescript
try {
  await trpc.news.create.mutate(data);
} catch (error) {
  if (error.code === 'UNAUTHORIZED') {
    // Redirigir a login
  } else if (error.code === 'NOT_FOUND') {
    // Mostrar 404
  }
}
```

### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `BAD_REQUEST` | Input inválido |
| `UNAUTHORIZED` | No autenticado |
| `FORBIDDEN` | No tiene permisos |
| `NOT_FOUND` | Recurso no existe |
| `CONFLICT` | Conflicto (ej: slug duplicado) |
| `INTERNAL_SERVER_ERROR` | Error interno |

---

## Rate Limiting

Para proteger la API:

- **Público**: 100 requests/minuto por IP
- **Autenticado**: 1000 requests/minuto por usuario
- **Admin**: Sin límite

Headers de respuesta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```

---

## Testing

### Usar con fetch (sin tRPC)

```bash
# Listar noticias
curl https://api.tudominio.com/api/trpc/news.list?input=%7B%22json%22%3A%7B%22limit%22%3A10%7D%7D

# Obtener noticia
curl https://api.tudominio.com/api/trpc/news.getBySlug?input=%7B%22json%22%3A%7B%22slug%22%3A%22noticia-ejemplo%22%7D%7D
```

### Usar con tRPC Client

```typescript
import { trpc } from './lib/trpc';

// Query
const { data, isLoading } = trpc.news.list.useQuery({ limit: 10 });

// Mutation
const create = trpc.news.create.useMutation({
  onSuccess: () => {
    // Invalidar cache
    trpc.news.list.invalidate();
  }
});

// Infinite Query (para scroll infinito)
const { data, fetchNextPage } = trpc.news.list.useInfiniteQuery(
  { limit: 10 },
  {
    getNextPageParam: (lastPage) => 
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined
  }
);
```

---

## Versionado

La API sigue el versionado del proyecto. Cambios breaking se anuncian con 30 días de anticipación.

Versión actual: **v1.0.0**
