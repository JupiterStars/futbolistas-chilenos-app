# FCH Noticias - Backend Implementation

## 📁 Estructura del Backend

```
server/
├── db/
│   ├── schema.ts          # Schema de Drizzle ORM (6 tablas)
│   ├── relations.ts       # Relaciones entre tablas
│   ├── index.ts           # Exports principales
│   ├── connection.ts      # Conexión a Vercel Postgres
│   └── seed.ts            # Seeds con datos reales
├── routers/
│   ├── news.ts            # CRUD Noticias
│   ├── categories.ts      # CRUD Categorías
│   ├── players.ts         # CRUD Jugadores
│   ├── transfers.ts       # CRUD Transferencias
│   └── index.ts           # Exports
├── middleware/
│   └── security.ts        # CORS, Rate Limit, Helmet, Compression
├── _core/
│   ├── trpc.ts            # Configuración tRPC
│   ├── context.ts         # Contexto de requests
│   ├── index.ts           # Express app con middleware
│   └── ...
└── routers.ts             # Router principal de tRPC
```

## 🗄️ Base de Datos

### Conexión
- **Proveedor:** Vercel Postgres
- **ORM:** Drizzle ORM 0.44
- **Archivo:** `server/db/connection.ts`

### Tablas
1. **categories** - Categorías de noticias
2. **news** - Noticias/artículos
3. **players** - Jugadores de fútbol
4. **transfers** - Transferencias de jugadores
5. **favorites** - Favoritos de usuarios
6. **leaderboards** - Tablas de clasificación

### Seeds
El archivo `server/db/seed.ts` contiene:
- ✅ 9 Categorías con colores e iconos
- ✅ 30 Jugadores reales de fútbol chileno
- ✅ 50 Noticias distribuidas en categorías
- ✅ 15 Transferencias (confirmadas y rumores)

## 🔌 API tRPC

### Endpoints

#### News Router (`news.`)
```typescript
news.list(input: {
  categoryId?: string,
  categorySlug?: string,
  limit?: number,
  offset?: number,
  featured?: boolean,
  search?: string,
  orderBy?: 'publishedAt' | 'views' | 'createdAt',
  order?: 'asc' | 'desc'
}) => PaginatedNews

news.featured(input: { limit?: number }) => NewsItem[]
news.getById(input: { id: string }) => NewsItem
news.getBySlug(input: { slug: string }) => NewsItem
news.create(input: CreateNewsInput) => NewsItem
news.update(input: UpdateNewsInput) => NewsItem
news.delete(input: { id: string }) => { success: boolean }
news.incrementViews(input: { id: string }) => { success: boolean }
news.search(input: { query: string, limit?: number }) => NewsItem[]
news.related(input: { newsId: string, limit?: number }) => NewsItem[]
news.stats() => { total, featured, totalViews }
```

#### Categories Router (`categories.`)
```typescript
categories.list(input: { limit?, offset?, search? }) => PaginatedCategories
categories.all() => Category[]
categories.getById(input: { id: string }) => Category
categories.getBySlug(input: { slug: string, newsLimit?, newsOffset? }) => CategoryWithNews
categories.create(input: CreateCategoryInput) => Category
categories.update(input: UpdateCategoryInput) => Category
categories.delete(input: { id: string }) => { success: boolean }
categories.stats() => { total }
```

#### Players Router (`players.`)
```typescript
players.list(input: {
  limit?: number,
  offset?: number,
  position?: string,
  team?: string,
  minAge?: number,
  maxAge?: number,
  search?: string,
  orderBy?: 'name' | 'age' | 'marketValue' | 'createdAt',
  order?: 'asc' | 'desc'
}) => PaginatedPlayers

players.getById(input: { id: string }) => Player
players.getBySlug(input: { slug: string }) => PlayerWithTransfers
players.search(input: { query: string, limit?: number }) => Player[]
players.create(input: CreatePlayerInput) => Player
players.update(input: UpdatePlayerInput) => Player
players.delete(input: { id: string }) => { success: boolean }
players.positions() => string[]
players.teams() => string[]
players.featured(input: { limit?: number }) => Player[]
players.prospects(input: { limit?: number }) => Player[]
players.stats() => { total, averageAge, totalMarketValue, playingAbroad }
```

#### Transfers Router (`transfers.`)
```typescript
transfers.list(input: {
  limit?: number,
  offset?: number,
  playerId?: string,
  status?: 'confirmed' | 'rumor' | 'pending',
  type?: 'transfer' | 'loan' | 'free' | 'return',
  search?: string
}) => PaginatedTransfers

transfers.getById(input: { id: string }) => Transfer
transfers.recent(input: { limit?: number, status? }) => Transfer[]
transfers.byPlayer(input: { playerId: string, limit?: number }) => Transfer[]
transfers.create(input: CreateTransferInput) => Transfer
transfers.update(input: UpdateTransferInput) => Transfer
transfers.delete(input: { id: string }) => { success: boolean }
transfers.updateStatus(input: { id: string, status }) => Transfer
transfers.stats() => { total, confirmed, rumors, byType }
```

## 🛡️ Seguridad

### Middleware Implementado
1. **CORS** - Configurado para Vercel y desarrollo local
2. **Rate Limiting** - 100 requests/minuto por IP
3. **Helmet** - Security headers (CSP, HSTS, etc.)
4. **Compression** - Gzip compression
5. **Request Logger** - Logging de requests

### Configuración CORS
- Orígenes permitidos: `localhost`, `vercel.app`, `fchnoticias.cl`
- Métodos: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Credentials: Habilitado
- Headers expuestos: `X-Total-Count`, `X-Page-Count`

## 📝 Scripts NPM

```bash
# Base de datos
npm run db:generate     # Generar migraciones
npm run db:migrate      # Ejecutar migraciones
npm run db:push         # Generar + Migrar
npm run db:seed         # Ejecutar seeds
npm run db:reset        # Limpiar y seedear
npm run db:studio       # Drizzle Studio

# Desarrollo
npm run dev             # Servidor de desarrollo
npm run build           # Build para producción
npm run check           # TypeScript check
```

## 🚀 Uso

### Desarrollo
```bash
# 1. Configurar variables de entorno
cp .env.example .env
# Editar DATABASE_URL

# 2. Ejecutar seeds
npm run db:seed

# 3. Iniciar servidor
npm run dev
```

### Producción (Vercel)
```bash
# Build y deploy
npm run build
npm run deploy:vercel:prod
```

## 📊 Datos de Seeds

### Categorías
| Nombre | Slug | Color |
|--------|------|-------|
| La Roja | la-roja | #E30613 |
| Extranjero | extranjero | #FFA500 |
| Sub-20 | sub-20 | #3B82F6 |
| Sub-18 | sub-18 | #10B981 |
| Sub-17 | sub-17 | #8B5CF6 |
| Sub-16 | sub-16 | #F59E0B |
| Sub-15 | sub-15 | #EC4899 |
| Entrevistas | entrevistas | #14B8A6 |
| Mercado de Pases | mercado-de-pases | #F97316 |

### Jugadores (30)
- Alexis Sánchez, Arturo Vidal, Claudio Bravo, Gary Medel
- Erick Pulgar, Paulo Díaz, Eduardo Vargas
- Ben Brereton Díaz, Víctor Dávila, Darío Osorio
- Marcelino Núñez, Alexander Aravena, Bruno Barticciotto
- Y 17 jugadores más...

### Noticias (50)
- 10 La Roja (convocatorias, partidos)
- 10 Extranjero (chilenos en Europa)
- 5 Sub-20, 5 Sub-18, 5 Sub-17, 5 Sub-16, 5 Sub-15
- 5 Entrevistas
- 5 Mercado de Pases

## 🔧 Integración Frontend

El router principal (`routers.ts`) incluye tanto los nuevos routers basados en Drizzle como los legacy para mantener compatibilidad durante la migración:

- `news` → Nuevo router con Drizzle (UUIDs)
- `newsLegacy` → Router anterior (IDs numéricos)
- `categories` → Nuevo router
- `categoriesLegacy` → Router anterior
- etc.

Para migrar completamente, el frontend debe actualizarse para usar UUIDs en lugar de IDs numéricos.
