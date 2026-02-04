# 🏗️ Architecture Documentation

Documentación de la arquitectura técnica de Chilenos Young.

## Tabla de Contenidos

- [Diagrama de Arquitectura](#diagrama-de-arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Flujo de Datos](#flujo-de-datos)
- [Seguridad](#seguridad)

---

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Navegador)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │     PWA      │  │  IndexedDB   │  │  Service Worker      │  │
│  │  (Install)   │  │  (Cache)     │  │  (Background Sync)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │   Static Files   │  │  API Routes      │  │  Functions   │  │
│  │   (CDN Cache)    │  │  (Serverless)    │  │  (tRPC)      │  │
│  └──────────────────┘  └──────────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     POSTGRESQL DATABASE                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   News      │  │   Players   │  │   Favorites/Transfers   │ │
│  │   System    │  │   Profiles  │  │   Leaderboards          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ OAuth
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Manus OAuth │  │    AWS S3    │  │  Google Fonts/CDN    │  │
│  │  (Auth)      │  │  (Images)    │  │  (Assets)            │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack Tecnológico

### Frontend

| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **React 19** | 19.2 | Última versión con mejoras de performance |
| **TypeScript** | 5.9 | Type safety en todo el codebase |
| **Vite** | 7 | Build tool rápido con HMR instantáneo |
| **Tailwind CSS** | 4 | Styling utility-first, bundle pequeño |
| **Wouter** | 3.3 | Router ligero (~2KB) para React |
| **TanStack Query** | 5.90 | Caching, refetching, optimistic updates |
| **tRPC** | 11.6 | Type-safe API calls end-to-end |
| **Framer Motion** | 12 | Animaciones declarativas y performantes |
| **shadcn/ui** | latest | Componentes accesibles y personalizables |
| **Radix UI** | latest | Primitives sin estilos, accesibilidad |

### Backend

| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **Express** | 4.21 | HTTP server probado y estable |
| **tRPC** | 11.6 | Procedures type-safe |
| **Drizzle ORM** | 0.44 | SQL-like, type-safe, bundle pequeño |
| **PostgreSQL** | 15 | Base de datos relacional robusta |
| **Zod** | 4.1 | Validación de schemas |
| **jose** | 6.1 | JWT tokens (moderno, edge-compatible) |

### DevOps & Deploy

| Tecnología | Uso |
|------------|-----|
| **Vercel** | Hosting serverless, edge network |
| **Drizzle Kit** | Migrations y schema management |
| **GitHub Actions** | CI/CD pipelines |

---

## Decisiones Técnicas

### 1. Monorepo Structure

```
┌─────────────────────────────────────┐
│          MONOREPO ROOT              │
│  ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ client/ │ │ server/ │ │ shared/││
│  │  (Vite) │ │ (Express│ │ (Types)││
│  └─────────┘ └─────────┘ └────────┘│
└─────────────────────────────────────┘
```

**Por qué:**
- ✅ Código compartido entre frontend/backend (types, schemas)
- ✅ Despliegue coordinado
- ✅ Single source of truth
- ✅ Menor complejidad que workspaces separados

### 2. tRPC sobre REST

**Comparación:**

| Aspecto | tRPC | REST |
|---------|------|------|
| Type Safety | ✅ End-to-end | ⚠️ Manual (OpenAPI) |
| Bundle Size | ✅ Tree-shakeable | N/A |
| Caching | ✅ TanStack Query | Manual |
| Learning Curve | ⚠️ Nueva sintaxis | ✅ Familiar |
| Tooling | ✅ Generación automática | Swagger/manual |

**Decisión:** tRPC para type safety sin código boilerplate.

### 3. Drizzle sobre Prisma/TypeORM

| Aspecto | Drizzle | Prisma | TypeORM |
|---------|---------|--------|---------|
| SQL-like | ✅ | ❌ (DSL) | ⚠️ |
| Bundle Size | ✅ ~10KB | ❌ ~15MB | ❌ ~500KB |
| Migrations | ✅ SQL puro | ⚠️ Generado | ⚠️ |
| Performance | ✅ | ✅ | ⚠️ |
| Edge Support | ✅ | ❌ | ❌ |

**Decisión:** Drizzle por bundle size y edge compatibility.

### 4. PostgreSQL sobre MySQL/MongoDB

| Aspecto | PostgreSQL | MySQL | MongoDB |
|---------|------------|-------|---------|
| JSON Support | ✅ JSONB | ⚠️ | ✅ Nativo |
| Relations | ✅ Full | ✅ | ⚠️ |
| Transactions | ✅ ACID | ✅ | ⚠️ |
| Vercel Integration | ✅ Native | ❌ | ❌ |
| Full-text Search | ✅ | ⚠️ | ✅ |

**Decisión:** PostgreSQL por integración con Vercel y features avanzadas.

### 5. PWA con Workbox

**Estrategias de Cache:**

| Recurso | Estrategia | TTL |
|---------|------------|-----|
| API tRPC | NetworkFirst | 24h |
| Imágenes | CacheFirst | 30 días |
| JS/CSS | StaleWhileRevalidate | 24h |
| Páginas HTML | NetworkFirst | 24h |

**Por qué:**
- ✅ Experiencia offline completa
- ✅ Instalable en móviles
- ✅ Sincronización background
- ✅ IndexedDB para datos dinámicos

### 6. OAuth con Manus

**Flujo de Autenticación:**

```
Usuario ──► [Login] ──► Manus OAuth ──► Callback ──► JWT Cookie
                              │
                              ▼
                        User Profile
                        (Email, Name, Avatar)
```

**Por qué:**
- ✅ Sin gestión de contraseñas
- ✅ Seguridad delegada a expertos
- ✅ UX simple (un click)
- ✅ Perfiles verificados

### 7. Code Splitting Strategy

**Manual Chunks:**

```javascript
// vite.config.ts
manualChunks: {
  'vendor-core': ['react', 'react-dom', 'wouter'],
  'vendor-data': ['@tanstack/react-query', '@trpc/client'],
  'vendor-radix': ['@radix-ui/react-*'],
  // ... más chunks
}
```

**Resultado:**
- vendor-core: ~150KB (carga primero)
- vendor-data: ~80KB (lazy)
- vendor-radix: ~120KB (lazy)
- Páginas: ~20-50KB cada una

---

## Estructura de Carpetas

```
chilenos-young/
│
├── 📁 client/                      # Frontend React
│   ├── 📁 src/
│   │   ├── 📁 components/          # Componentes React
│   │   │   ├── 📁 ui/              # shadcn/ui components
│   │   │   ├── OptimizedImage.tsx  # Imágenes optimizadas
│   │   │   ├── InfiniteScroll.tsx  # Scroll infinito
│   │   │   └── EmptyState.tsx      # Estados vacíos
│   │   │
│   │   ├── 📁 pages/               # Rutas/Páginas
│   │   │   ├── Home.tsx            # Página principal
│   │   │   ├── NewsDetail.tsx      # Detalle noticia
│   │   │   └── PlayerDetail.tsx    # Perfil jugador
│   │   │
│   │   ├── 📁 hooks/               # Custom hooks
│   │   │   ├── useCachedNews.ts    # Cache de noticias
│   │   │   ├── useOfflineData.ts   # Offline/Sync
│   │   │   └── usePWA.ts           # PWA features
│   │   │
│   │   ├── 📁 lib/                 # Utilidades
│   │   │   ├── trpc.ts             # Cliente tRPC
│   │   │   ├── db.ts               # IndexedDB
│   │   │   └── utils.ts            # Helpers
│   │   │
│   │   └── 📁 types/               # Tipos TypeScript
│   │
│   ├── 📁 public/                  # Assets estáticos
│   │   ├── manifest.json           # PWA manifest
│   │   ├── offline.html            # Página offline
│   │   └── icons/                  # Iconos PWA
│   │
│   └── index.html                  # Entry point
│
├── 📁 server/                      # Backend Express
│   ├── 📁 _core/                   # Configuración core
│   │   ├── trpc.ts                 # Router tRPC
│   │   ├── context.ts              # Contexto tRPC
│   │   ├── oauth.ts                # OAuth handlers
│   │   └── index.ts                # Entry point
│   │
│   ├── 📁 routers/                 # tRPC routers
│   │   ├── news.ts                 # API de noticias
│   │   ├── players.ts              # API de jugadores
│   │   └── favorites.ts            # API de favoritos
│   │
│   ├── 📁 db/                      # Database
│   │   ├── schema.ts               # Schema Drizzle
│   │   ├── connection.ts           # Conexión PG
│   │   └── seed.ts                 # Datos de prueba
│   │
│   └── vercel.ts                   # Adapter para Vercel
│
├── 📁 shared/                      # Código compartido
│   └── const.ts                    # Constantes
│
├── 📁 drizzle/                     # Migraciones
│   ├── 0000_initial.sql
│   └── meta/
│
├── 📁 api/                         # Vercel Functions
│   └── index.js                    # Bundle generado
│
├── 📁 dist/                        # Build output
│
├── vite.config.ts                  # Configuración Vite
├── drizzle.config.ts               # Configuración Drizzle
└── package.json
```

### Convenciones de Nomenclatura

| Tipo | Convención | Ejemplo |
|------|------------|---------|
| Componentes | PascalCase | `OptimizedImage.tsx` |
| Hooks | camelCase, prefijo use | `useCachedNews.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constantes | UPPER_SNAKE_CASE | `API_ENDPOINTS` |
| Types | PascalCase, prefijo Type | `NewsItem` |
| Props | PascalCase + Props | `EmptyStateProps` |

---

## Flujo de Datos

### 1. Carga de Noticias (Con Cache)

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐
│ Componente      │     │  useCachedNews    │     │  IndexedDB  │     │ Server  │
└─────────┘     └──────────────┘     └─────────────┘     └─────────┘
     │                   │                   │                 │
     │  useCachedNews()  │                   │                 │
     │──────────────────>│                   │                 │
     │                   │                   │                 │
     │                   │  getCachedNews()  │                 │
     │                   │──────────────────>│                 │
     │                   │                   │                 │
     │                   │  cached data      │                 │
     │                   │<──────────────────│                 │
     │                   │                   │                 │
     │  {data, isLoading}│                   │                 │
     │<──────────────────│                   │                 │
     │                   │                   │                 │
     │                   │                   │                 │
     │                   │      trpc.news.list()               │
     │                   │─────────────────────────────────────>│
     │                   │                   │                 │
     │                   │      fresh data   │                 │
     │                   │<─────────────────────────────────────│
     │                   │                   │                 │
     │                   │  cacheNews()      │                 │
     │                   │──────────────────>│                 │
     │                   │                   │                 │
     │  {data, isFromCache: false}            │                 │
     │<──────────────────│                   │                 │
```

### 2. Autenticación OAuth

```
┌─────────┐     ┌─────────┐     ┌───────────────┐     ┌─────────────┐
│  User   │     │  Client │     │  Server/API   │     │ Manus OAuth │
└─────────┘     └─────────┘     └───────────────┘     └─────────────┘
     │               │               │                     │
     │  Click Login  │               │                     │
     │──────────────>│               │                     │
     │               │               │                     │
     │               │  /api/oauth/login                     │
     │               │──────────────>│                     │
     │               │               │                     │
     │               │  Redirect to Manus                    │
     │               │<──────────────│                     │
     │               │               │                     │
     │  Redirect     │               │                     │
     │<──────────────│               │                     │
     │               │               │                     │
     │  Auth in Manus│               │                     │
     │─────────────────────────────────────────────────────>│
     │               │               │                     │
     │  Callback     │               │                     │
     │  /api/oauth/callback?code=xxx                     │
     │─────────────────────────────────────────────────────>│
     │               │               │                     │
     │               │               │  Exchange code      │
     │               │               │  for tokens         │
     │               │               │────────────────────>│
     │               │               │                     │
     │               │               │  {access_token,     │
     │               │               │   refresh_token}    │
     │               │               │<────────────────────│
     │               │               │                     │
     │               │               │  Create JWT cookie  │
     │               │               │  Set session        │
     │               │               │                     │
     │  Redirect to  │               │                     │
     │  /profile     │               │                     │
     │<─────────────────────────────────────────────────────│
```

### 3. Sincronización Offline

```
┌─────────┐     ┌──────────────┐     ┌─────────────┐     ┌─────────┐
│ Service Worker  │     │  useOfflineData   │     │  IndexedDB  │     │ Server  │
└─────────┘     └──────────────┘     └─────────────┘     └─────────┘
     │                   │                   │                 │
     │  User offline     │                   │                 │
     │  addFavorite()    │                   │                 │
     │──────────────────>│                   │                 │
     │                   │                   │                 │
     │                   │  save to DB       │                 │
     │                   │  add to syncQueue │                 │
     │                   │──────────────────>│                 │
     │                   │                   │                 │
     │                   │                   │                 │
     │  User comes online                      │                 │
     │  'online' event   │                   │                 │
     │──────────────────>│                   │                 │
     │                   │                   │                 │
     │                   │  getSyncQueue()   │                 │
     │                   │──────────────────>│                 │
     │                   │                   │                 │
     │                   │  sync queue items                   │
     │                   │─────────────────────────────────────>│
     │                   │                   │                 │
     │                   │  mark as synced   │                 │
     │                   │──────────────────>│                 │
```

---

## Seguridad

### Autenticación

```
┌─────────────────────────────────────────────────────────┐
│                    JWT TOKEN FLOW                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Login ──► JWT (jose) ──► HttpOnly Cookie ──► API Auth  │
│                                                          │
│  Payload: { sub: userId, role: 'user'|'admin', exp }    │
│                                                          │
│  Expiración: 7 días (configurable)                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Protección de Rutas tRPC

```typescript
// server/_core/trpc.ts

// Público - No requiere auth
publicProcedure

// Protegido - Requiere usuario autenticado
protectedProcedure

// Admin - Requiere rol admin
adminProcedure
```

### Headers de Seguridad

```typescript
// server/middleware/security.ts
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': 'default-src \'self\'...'
}
```

### Validación de Input

```typescript
// Todas las entradas validadas con Zod
const inputSchema = z.object({
  id: z.number().positive(),
  slug: z.string().min(1).max(255),
});

publicProcedure
  .input(inputSchema)
  .query(({ input }) => { ... });
```

### CSRF Protection

```typescript
// Cookies configuradas:
{
  httpOnly: true,    // No accesible desde JS
  secure: true,      // Solo HTTPS
  sameSite: 'lax',   // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000
}
```

---

## Performance

### Optimizaciones Implementadas

| Técnica | Implementación | Impacto |
|---------|---------------|---------|
| **Code Splitting** | Manual chunks en Vite | ~40% reduction |
| **Lazy Loading** | React.lazy + dynamic imports | Faster FCP |
| **Image Optimization** | WebP/AVIF + lazy loading | ~60% smaller |
| **PWA Caching** | Workbox runtime caching | Offline capable |
| **Prefetching** | TanStack Query staleTime | Less API calls |
| **Memoization** | React.memo + useMemo | Less re-renders |

### Métricas Objetivo

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| First Contentful Paint | < 1.5s | ~1.2s |
| Time to Interactive | < 3.5s | ~2.8s |
| Lighthouse Score | > 90 | 94 |
| Bundle Size (gzipped) | < 200KB | ~180KB |

---

## Escalabilidad

### Horizontal Scaling

- ✅ Serverless functions (Vercel)
- ✅ Stateless backend
- ✅ PostgreSQL con connection pooling
- ✅ CDN para assets estáticos

### Caching Strategy

| Capa | Tecnología | TTL |
|------|------------|-----|
| Browser | Service Worker | Configurable |
| CDN | Vercel Edge | 1h (estático) |
| API | TanStack Query | 5m (datos) |
| DB | PostgreSQL cache | N/A |

### Database Scaling

- ✅ Índices optimizados
- ✅ Queries paginadas
- ✅ Connection pooling (pgBouncer)
- ✅ Read replicas (si es necesario)
