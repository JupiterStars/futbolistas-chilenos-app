# 🗄️ Database Documentation

Documentación completa del esquema de base de datos de Chilenos Young.

## Tabla de Contenidos

- [Schema Overview](#schema-overview)
- [Tablas](#tablas)
- [Relaciones](#relaciones)
- [Migraciones](#migraciones)
- [Seeds](#seeds)
- [Backups](#backups)

---

## Schema Overview

Base de datos PostgreSQL con 6 tablas principales gestionadas con Drizzle ORM.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   categories    │────<│      news       │>────│    favorites    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │                       │
                               │                       │
                               v                       v
                        ┌─────────────────┐     ┌─────────────────┐
                        │     players     │────<│    favorites    │
                        └─────────────────┘     └─────────────────┘
                               │
                               v
                        ┌─────────────────┐
                        │   transfers     │
                        └─────────────────┘

┌─────────────────┐
│  leaderboards   │
└─────────────────┘
```

---

## Tablas

### 1. Categories

Almacena las categorías para clasificar noticias.

```typescript
{
  id: uuid (PK, auto)
  name: varchar(100) - Nombre de la categoría
  slug: varchar(100) - URL-friendly identifier
  description: text - Descripción opcional
  color: varchar(7) - Color hex (#RRGGBB)
  icon: varchar(50) - Nombre del icono Lucide
  createdAt: timestamp - Fecha de creación
}
```

**Ejemplos:**
- Primera División, Selección Nacional, Copas, Mercado de Pases

**Índices:**
- `categories_slug_idx` - Búsqueda por slug
- `categories_name_idx` - Búsqueda por nombre

---

### 2. News

Tabla principal de noticias/artículos.

```typescript
{
  id: uuid (PK, auto)
  title: varchar(255) - Título de la noticia
  slug: varchar(255) - URL-friendly identifier
  excerpt: text - Resumen breve
  content: text - Contenido HTML/Markdown
  imageUrl: varchar(500) - URL de imagen principal
  categoryId: uuid (FK) - Referencia a categories
  authorId: varchar(100) - ID del autor (OAuth)
  publishedAt: timestamp - Fecha de publicación
  views: integer (default: 0) - Contador de vistas
  featured: boolean (default: false) - Destacado en home
  createdAt: timestamp - Fecha de creación
  updatedAt: timestamp - Última actualización
}
```

**Índices:**
- `news_slug_idx` - Búsqueda por slug
- `news_category_idx` - Filtrar por categoría
- `news_published_idx` - Noticias publicadas
- `news_featured_idx` - Noticias destacadas
- `news_author_idx` - Noticias por autor
- `news_published_at_idx` - Ordenar por fecha

---

### 3. Players

Perfiles de jugadores de fútbol.

```typescript
{
  id: uuid (PK, auto)
  name: varchar(100) - Nombre completo
  slug: varchar(100) - URL-friendly identifier
  position: varchar(50) - Posición en el campo
  team: varchar(100) - Equipo actual
  nationality: varchar(50) (default: 'Chile')
  age: integer - Edad
  height: integer - Altura en cm
  weight: integer - Peso en kg
  imageUrl: varchar(500) - Foto del jugador
  stats: jsonb - Estadísticas (goles, asistencias, etc)
  marketValue: integer - Valor de mercado en euros
  createdAt: timestamp - Fecha de creación
}
```

**Stats JSON Schema:**
```json
{
  "goals": 15,
  "assists": 8,
  "matches": 32,
  "minutes": 2880,
  "yellowCards": 5,
  "redCards": 0,
  "cleanSheets": null,
  "saves": null
}
```

**Índices:**
- `players_slug_idx` - Búsqueda por slug
- `players_name_idx` - Búsqueda por nombre
- `players_team_idx` - Filtrar por equipo
- `players_position_idx` - Filtrar por posición

---

### 4. Transfers

Registro de transferencias de jugadores.

```typescript
{
  id: uuid (PK, auto)
  playerId: uuid (FK) - Referencia a players
  fromTeam: varchar(100) - Equipo origen
  toTeam: varchar(100) - Equipo destino
  date: timestamp - Fecha del movimiento
  fee: varchar(50) - Monto (ej: "€5M", "Free", "Loan")
  type: varchar(20) - Tipo: transfer, loan, free
  status: varchar(20) - Estado: confirmed, rumor, pending
  createdAt: timestamp - Fecha de registro
}
```

**Types:**
- `transfer` - Transferencia permanente
- `loan` - Préstamo
- `free` - Agente libre

**Status:**
- `confirmed` - Confirmada oficialmente
- `rumor` - Rumor de mercado
- `pending` - Negociación en curso

**Índices:**
- `transfers_player_idx` - Transferencias por jugador
- `transfers_status_idx` - Filtrar por estado
- `transfers_date_idx` - Ordenar por fecha
- `transfers_player_date_idx` - Historial por jugador

---

### 5. Favorites

Sistema de favoritos de usuarios (relación polimórfica).

```typescript
{
  id: uuid (PK, auto)
  userId: varchar(100) - ID del usuario (OAuth)
  newsId: uuid (FK, nullable) - Referencia a news
  playerId: uuid (FK, nullable) - Referencia a players
  createdAt: timestamp - Fecha de guardado
}
```

**Constraint:** Al menos uno de `newsId` o `playerId` debe ser no null.

**Índices:**
- `favorites_user_idx` - Favoritos por usuario
- `favorites_news_idx` - Favoritos de noticias
- `favorites_player_idx` - Favoritos de jugadores
- `favorites_user_news_unique_idx` - Evitar duplicados (news)
- `favorites_user_player_unique_idx` - Evitar duplicados (player)

---

### 6. Leaderboards

Tablas de clasificación (goleadores, asistencias, etc).

```typescript
{
  id: uuid (PK, auto)
  type: varchar(50) - Tipo de clasificación
  data: jsonb - Array de rankings
  season: varchar(20) (default: '2024-25')
  updatedAt: timestamp - Última actualización
}
```

**Types:**
- `goals` - Goleadores
- `assists` - Asistencias
- `mvps` - Jugadores MVP
- `matches` - Partidos jugados
- `minutes` - Minutos jugados

**Data JSON Schema:**
```json
[
  {
    "playerId": "uuid",
    "playerName": "Nombre Jugador",
    "playerSlug": "nombre-jugador",
    "team": "Nombre Equipo",
    "imageUrl": "https://...",
    "value": 15,
    "rank": 1
  }
]
```

**Índices:**
- `leaderboards_type_idx` - Buscar por tipo
- `leaderboards_updated_idx` - Ordenar por actualización
- `leaderboards_type_season_idx` - Buscar por tipo y temporada

---

## Relaciones

```
categories ||--o{ news : "has many"
news ||--o{ favorites : "has many"
players ||--o{ favorites : "has many"
players ||--o{ transfers : "has many"
news ||--o| categories : "belongs to"
transfers }o--|| players : "belongs to"
favorites }o--o| news : "references"
favorites }o--o| players : "references"
```

### Diagrama de Relaciones

| Tabla | Relación | Tabla | Tipo |
|-------|----------|-------|------|
| categories | 1:N | news | Categoría tiene muchas noticias |
| news | N:1 | categories | Noticia pertenece a categoría |
| players | 1:N | transfers | Jugador tiene muchas transferencias |
| transfers | N:1 | players | Transferencia pertenece a jugador |
| news | 1:N | favorites | Noticia puede ser favorita |
| players | 1:N | favorites | Jugador puede ser favorito |

---

## Migraciones

### Comandos Disponibles

```bash
# Generar migraciones desde schema
pnpm db:generate

# Aplicar migraciones pendientes
pnpm db:migrate

# Generar y aplicar (combinado)
pnpm db:push

# Abrir Drizzle Studio (GUI)
pnpm db:studio
```

### Flujo de Migración

1. **Modificar schema** (`server/db/schema.ts`)
2. **Generar migración**:
   ```bash
   pnpm db:generate
   ```
   Esto crea archivos en `drizzle/` con timestamp.

3. **Aplicar migración**:
   ```bash
   pnpm db:migrate
   ```

4. **Verificar** en Drizzle Studio:
   ```bash
   pnpm db:studio
   ```

### Estructura de Migraciones

```
drizzle/
├── 0000_initial.sql          # Migración inicial
├── 0001_add_indexes.sql      # Migración posterior
├── 0002_add_leaderboards.sql # Otra migración
└── meta/
    ├── 0000_snapshot.json    # Snapshot del schema
    └── _journal.json         # Historial de migraciones
```

### Rollback

Drizzle Kit no soporta rollback automático. Para revertir:

```bash
# Crear migración de reversión manual
# 1. Revertir cambios en schema.ts
# 2. Generar nueva migración
pnpm db:generate

# O restaurar desde backup
pg_restore -d fch_noticias backup.sql
```

---

## Seeds

### Comandos

```bash
# Cargar datos de prueba
pnpm db:seed

# Resetear y recargar
pnpm db:reset
```

### Datos Incluidos

El seed (`server/db/seed.ts`) crea:

- **Categorías**: 5 categorías de ejemplo
- **Noticias**: 20 noticias de prueba
- **Jugadores**: 15 jugadores jóvenes chilenos
- **Transferencias**: 10 movimientos de mercado
- **Leaderboards**: 3 tablas (goles, asistencias, partidos)

### Seed Personalizado

```typescript
// server/db/seed.ts
export async function seed() {
  // Categorías
  await db.insert(categories).values([
    { name: 'Primera División', slug: 'primera-division', color: '#E30613' },
    { name: 'Selección', slug: 'seleccion', color: '#0039A6' },
  ]);
  
  // Más datos...
}
```

---

## Backups

### Backup Manual

```bash
# Backup completo
pg_dump -h localhost -U postgres -d fch_noticias > backup_$(date +%Y%m%d).sql

# Solo schema
pg_dump -h localhost -U postgres -d fch_noticias --schema-only > schema.sql

# Solo datos
pg_dump -h localhost -U postgres -d fch_noticias --data-only > data.sql
```

### Restore

```bash
# Restaurar backup
psql -h localhost -U postgres -d fch_noticias < backup_20240115.sql

# O con pg_restore (si es formato custom)
pg_restore -h localhost -U postgres -d fch_noticias backup.dump
```

### Backup Automático (Vercel)

Si usas Vercel Postgres:
1. Ve a **Storage > tu-bd > Backups**
2. Configura backups automáticos diarios
3. Descarga backups manuales cuando necesites

---

## Optimización

### Índices Creados Automáticamente

Todos los campos `slug` tienen índices únicos para búsquedas rápidas.

### Índices Compuestos

| Índice | Tablas | Uso |
|--------|--------|-----|
| `news_published_at_idx` | news | Home feed ordenado |
| `transfers_player_date_idx` | transfers | Historial del jugador |
| `leaderboards_type_season_idx` | leaderboards | Filtrar por temporada |
| `favorites_user_news_unique_idx` | favorites | Evitar duplicados |

### Queries Comunes

```sql
-- Noticias más recientes
SELECT * FROM news 
WHERE published_at IS NOT NULL 
ORDER BY published_at DESC 
LIMIT 20;

-- Noticias por categoría
SELECT n.* FROM news n
JOIN categories c ON n.category_id = c.id
WHERE c.slug = 'primera-division'
ORDER BY n.published_at DESC;

-- Jugadores con más goles
SELECT name, stats->>'goals' as goals 
FROM players 
ORDER BY (stats->>'goals')::int DESC 
LIMIT 10;

-- Favoritos de un usuario
SELECT * FROM favorites 
WHERE user_id = 'user_oauth_id';
```

---

## Troubleshooting

### Error: "relation does not exist"

```bash
# Las tablas no existen - ejecutar migraciones
pnpm db:push
```

### Error: "unique constraint violated"

**Causa:** Intentando insertar duplicados

**Solución:**
```typescript
// Usar onConflictDoNothing
await db.insert(news).values(data).onConflictDoNothing();

// O upsert
await db.insert(news).values(data)
  .onConflictDoUpdate({
    target: news.slug,
    set: { updatedAt: new Date() }
  });
```

### Error de conexión

```bash
# Verificar conexión
psql $DATABASE_URL -c "SELECT 1"

# Si falla, verificar:
# - URL correcta
# - PostgreSQL corriendo
# - Firewall/permisos
```

---

## Referencia Rápida

| Comando | Descripción |
|---------|-------------|
| `pnpm db:generate` | Generar migraciones |
| `pnpm db:migrate` | Aplicar migraciones |
| `pnpm db:push` | Generar + aplicar |
| `pnpm db:seed` | Cargar datos de prueba |
| `pnpm db:reset` | Resetear y seedear |
| `pnpm db:studio` | Abrir Drizzle Studio |
