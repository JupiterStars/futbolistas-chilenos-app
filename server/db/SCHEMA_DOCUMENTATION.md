# FCH Noticias - Documentación del Schema de Base de Datos

## Índice

1. [Visión General](#visión-general)
2. [Tablas](#tablas)
3. [Relaciones](#relaciones)
4. [Índices](#índices)
5. [Enums](#enums)
6. [Diagrama ER](#diagrama-er)
7. [Convenciones](#convenciones)

---

## Visión General

El schema de base de datos de FCH Noticias está diseñado para soportar un portal de noticias de fútbol chileno con las siguientes características:

- **6 tablas principales**: categories, news, players, transfers, favorites, leaderboards
- **UUIDs** como claves primarias para escalabilidad y seguridad
- **Índices estratégicos** para optimización de queries frecuentes
- **Relaciones FK** con cascada configurada apropiadamente
- **Campos JSONB** para datos flexibles (stats, leaderboard data)

**Tecnología**: Drizzle ORM 0.44 + PostgreSQL (Vercel Postgres)

---

## Tablas

### 1. categories

Almacena las categorías para clasificar las noticias.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | uuid | NO | random() | PK - Identificador único |
| name | varchar(100) | NO | - | Nombre de la categoría |
| slug | varchar(100) | NO | - | URL-friendly identifier (unique) |
| description | text | YES | - | Descripción opcional |
| color | varchar(7) | YES | - | Color HEX para UI (#FF5733) |
| icon | varchar(50) | YES | - | Nombre del icono (Lucide) |
| createdAt | timestamp | NO | now() | Fecha de creación |

**Ejemplos**: "Primera División", "Selección Nacional", "Mercado de Pases", "Copas"

---

### 2. news

Almacena las noticias/artículos del portal.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | uuid | NO | random() | PK - Identificador único |
| title | varchar(255) | NO | - | Título de la noticia |
| slug | varchar(255) | NO | - | URL-friendly (unique) |
| excerpt | text | NO | - | Resumen/copete |
| content | text | NO | - | Contenido HTML/Markdown |
| imageUrl | varchar(500) | YES | - | URL de imagen principal |
| categoryId | uuid | YES | - | FK → categories.id |
| authorId | varchar(100) | YES | - | OAuth user ID del autor |
| publishedAt | timestamp | YES | - | Fecha de publicación |
| views | integer | NO | 0 | Contador de visitas |
| featured | boolean | NO | false | Destacada en home |
| createdAt | timestamp | NO | now() | Fecha de creación |
| updatedAt | timestamp | NO | now() | Última actualización |

**Restricciones**:
- FK a categories con ON DELETE SET NULL
- Índice único en slug
- Índices en categoryId, publishedAt, featured

---

### 3. players

Almacena información y estadísticas de jugadores.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | uuid | NO | random() | PK - Identificador único |
| name | varchar(100) | NO | - | Nombre completo |
| slug | varchar(100) | NO | - | URL-friendly (unique) |
| position | varchar(50) | YES | - | Posición en el campo |
| team | varchar(100) | YES | - | Equipo actual |
| nationality | varchar(50) | NO | 'Chile' | Nacionalidad |
| age | integer | YES | - | Edad en años |
| height | integer | YES | - | Altura en cm |
| weight | integer | YES | - | Peso en kg |
| imageUrl | varchar(500) | YES | - | Foto del jugador |
| stats | jsonb | YES | {} | Estadísticas {goals, assists, ...} |
| marketValue | integer | YES | - | Valor en euros |
| createdAt | timestamp | NO | now() | Fecha de creación |

**Estructura de stats (JSONB)**:
```json
{
  "goals": 15,
  "assists": 8,
  "matches": 32,
  "minutes": 2780,
  "yellowCards": 5,
  "redCards": 0,
  "cleanSheets": null,
  "saves": null
}
```

---

### 4. transfers

Registra transferencias y movimientos de jugadores.

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | uuid | NO | random() | PK - Identificador único |
| playerId | uuid | NO | - | FK → players.id |
| fromTeam | varchar(100) | YES | - | Equipo origen |
| toTeam | varchar(100) | YES | - | Equipo destino |
| date | timestamp | YES | - | Fecha del movimiento |
| fee | varchar(50) | YES | - | Monto ("€5M", "Free", "Loan") |
| type | varchar(20) | YES | 'transfer' | Tipo: transfer, loan, free |
| status | varchar(20) | YES | 'rumor' | Estado: confirmed, rumor |
| createdAt | timestamp | NO | now() | Fecha de creación |

**Restricciones**:
- FK a players con ON DELETE CASCADE
- Índices en playerId, status, date

---

### 5. favorites

Favoritos de usuarios (noticias y jugadores).

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | uuid | NO | random() | PK - Identificador único |
| userId | varchar(100) | NO | - | OAuth user ID |
| newsId | uuid | YES | - | FK → news.id |
| playerId | uuid | YES | - | FK → players.id |
| createdAt | timestamp | NO | now() | Fecha de creación |

**Restricciones**:
- CHECK: newsId IS NOT NULL OR playerId IS NOT NULL
- FK a news con ON DELETE CASCADE
- FK a players con ON DELETE CASCADE
- Índices únicos compuestos: (userId, newsId), (userId, playerId)

**Nota**: Implementa una relación polimórfica donde el favorito puede ser:
- Una noticia (newsId !== null, playerId === null)
- Un jugador (playerId !== null, newsId === null)

---

### 6. leaderboards

Tablas de clasificación (goleadores, asistencias, MVPs).

| Campo | Tipo | Nullable | Default | Descripción |
|-------|------|----------|---------|-------------|
| id | uuid | NO | random() | PK - Identificador único |
| type | varchar(50) | NO | - | Tipo: goals, assists, mvps... |
| data | jsonb | NO | - | Array de entradas |
| season | varchar(20) | YES | '2024-25' | Temporada |
| updatedAt | timestamp | NO | now() | Última actualización |

**Estructura de data (JSONB)**:
```json
[
  {
    "playerId": "uuid",
    "playerName": "Alexis Sánchez",
    "playerSlug": "alexis-sanchez",
    "team": "Inter",
    "imageUrl": "...",
    "value": 15,
    "rank": 1
  }
]
```

---

## Relaciones

```
┌─────────────┐       ┌─────────────┐
│  categories │◄──────┤    news     │
│  (1)        │       │  (many)     │
└─────────────┘       └──────┬──────┘
                             │
                             │
┌─────────────┐       ┌──────┴──────┐       ┌─────────────┐
│   players   │◄──────┤  transfers  │       │  favorites  │
│  (1)        │       │  (many)     │       │  (many)     │
└──────┬──────┘       └─────────────┘       └──────┬──────┘
       │                                           │
       │                                           │
       └───────────────────────────────────────────┘
              favorites.playerId → players.id
              favorites.newsId → news.id
```

### Detalle de Relaciones

| Tabla | Relación | Tabla Relacionada | Tipo | ON DELETE |
|-------|----------|-------------------|------|-----------|
| categories | 1:N | news | categories → news.id | - |
| news | N:1 | categories | news.categoryId → categories.id | SET NULL |
| news | 1:N | favorites | news.id → favorites.newsId | CASCADE |
| players | 1:N | transfers | players.id → transfers.playerId | CASCADE |
| players | 1:N | favorites | players.id → favorites.playerId | CASCADE |
| transfers | N:1 | players | transfers.playerId → players.id | CASCADE |
| favorites | N:1 | news | favorites.newsId → news.id | CASCADE |
| favorites | N:1 | players | favorites.playerId → players.id | CASCADE |

---

## Índices

### categories
- `categories_slug_idx` en slug (unique)
- `categories_name_idx` en name

### news
- `news_slug_idx` en slug (unique)
- `news_category_idx` en categoryId
- `news_published_idx` en publishedAt
- `news_featured_idx` en featured
- `news_author_idx` en authorId
- `news_published_at_idx` en publishedAt DESC

### players
- `players_slug_idx` en slug (unique)
- `players_name_idx` en name
- `players_team_idx` en team
- `players_position_idx` en position
- `players_name_search_idx` en name ASC

### transfers
- `transfers_player_idx` en playerId
- `transfers_status_idx` en status
- `transfers_date_idx` en date
- `transfers_player_date_idx` en (playerId, date DESC)

### favorites
- `favorites_user_idx` en userId
- `favorites_news_idx` en newsId
- `favorites_player_idx` en playerId
- `favorites_user_news_unique_idx` en (userId, newsId) - único
- `favorites_user_player_unique_idx` en (userId, playerId) - único

### leaderboards
- `leaderboards_type_idx` en type
- `leaderboards_updated_idx` en updatedAt
- `leaderboards_type_season_idx` en (type, season)

---

## Enums

### player_position (PostgreSQL ENUM)
- 'Portero'
- 'Defensa Central'
- 'Lateral Izquierdo'
- 'Lateral Derecho'
- 'Mediocampista Defensivo'
- 'Mediocampista Central'
- 'Mediocampista Ofensivo'
- 'Extremo Izquierdo'
- 'Extremo Derecho'
- 'Delantero Centro'
- 'Segundo Delantero'

### transfer_type (PostgreSQL ENUM)
- 'transfer' - Transferencia permanente
- 'loan' - Préstamo
- 'free' - Libre/agente libre
- 'return' - Regreso de préstamo

### transfer_status (PostgreSQL ENUM)
- 'confirmed' - Confirmada
- 'rumor' - Rumor
- 'pending' - Pendiente

### leaderboard_type (PostgreSQL ENUM)
- 'goals' - Goleadores
- 'assists' - Asistencias
- 'mvps' - MVPs
- 'matches' - Partidos jugados
- 'minutes' - Minutos jugados

---

## Diagrama ER

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            FCH NOTICIAS - SCHEMA                             │
└─────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐
  │   categories    │
  ├─────────────────┤
  │ id (PK, uuid)   │
  │ name            │
  │ slug (unique)   │
  │ description     │
  │ color           │
  │ icon            │
  │ createdAt       │
  └────────┬────────┘
           │ 1:N
           │
           ▼
  ┌─────────────────┐         ┌─────────────────┐
  │      news       │◄────────┤    favorites    │
  ├─────────────────┤   N:1   ├─────────────────┤
  │ id (PK, uuid)   │         │ id (PK, uuid)   │
  │ title           │         │ userId          │
  │ slug (unique)   │         │ newsId (FK)     │◄──────┐
  │ excerpt         │         │ playerId (FK)   │◄───┐  │
  │ content         │         │ createdAt       │    │  │
  │ imageUrl        │         └─────────────────┘    │  │
  │ categoryId (FK) │◄────────┐                      │  │
  │ authorId        │         │                      │  │
  │ publishedAt     │         │                      │  │
  │ views           │         │                      │  │
  │ featured        │         │                      │  │
  │ createdAt       │         │                      │  │
  │ updatedAt       │         │                      │  │
  └─────────────────┘         │                      │  │
                              │                      │  │
                              │                      │  │
  ┌─────────────────┐         │         ┌─────────────────┐
  │    players      │◄────────┘         │   favorites     │
  ├─────────────────┤                   │ (player FK)     │
  │ id (PK, uuid)   │◄──────────────────┘                 │
  │ name            │                                     │
  │ slug (unique)   │                                     │
  │ position        │         ┌─────────────────┐         │
  │ team            │         │    transfers    │         │
  │ nationality     │         ├─────────────────┤         │
  │ age             │         │ id (PK, uuid)   │         │
  │ height          │         │ playerId (FK)   │◄────────┘
  │ weight          │         │ fromTeam        │
  │ imageUrl        │         │ toTeam          │
  │ stats (jsonb)   │         │ date            │
  │ marketValue     │         │ fee             │
  │ createdAt       │         │ type            │
  └─────────────────┘         │ status          │
                              │ createdAt       │
                              └─────────────────┘
```

---

## Convenciones

### Nomenclatura
- **Tablas**: lowercase, plural, snake_case (categories, news, players)
- **Columnas**: camelCase en TypeScript, snake_case en PostgreSQL
- **Claves primarias**: `id` (uuid)
- **Foreign keys**: `[table]Id` (ej: categoryId, playerId)
- **Timestamps**: createdAt, updatedAt, publishedAt, deletedAt

### Tipos de Datos
- **IDs**: `uuid` con defaultRandom()
- **Texto corto**: `varchar(n)` con límite explícito
- **Texto largo**: `text`
- **Números enteros**: `integer`
- **Booleanos**: `boolean` con default
- **JSON**: `jsonb` para máxima flexibilidad
- **Fechas**: `timestamp with time zone`

### Índices
- Índice automático en todas las PK
- Índice unique en todos los campos slug
- Índice en todas las FK
- Índice en campos de búsqueda frecuente
- Índices compuestos para queries comunes

### Constraints
- NOT NULL por defecto en campos obligatorios
- CHECK constraints para validación de datos
- Foreign keys con ON DELETE apropiado:
  - CASCADE: Cuando el hijo no tiene sentido sin el padre
  - SET NULL: Cuando el hijo puede existir independientemente

---

## Migraciones

### Generar migración
```bash
npm run db:generate
```

### Aplicar migración
```bash
npm run db:migrate
```

### Push directo (desarrollo)
```bash
npm run db:push
```

---

## Queries Comunes

### Noticias por categoría
```typescript
const newsList = await db.select()
  .from(news)
  .where(eq(news.categoryId, categoryId))
  .orderBy(desc(news.publishedAt));
```

### Jugador con transferencias
```typescript
const player = await db.query.players.findFirst({
  where: eq(players.id, playerId),
  with: {
    transfers: true,
  },
});
```

### Favoritos de usuario
```typescript
const userFavs = await db.select({
  favorite: favorites,
  news: news,
  player: players,
})
.from(favorites)
.leftJoin(news, eq(favorites.newsId, news.id))
.leftJoin(players, eq(favorites.playerId, players.id))
.where(eq(favorites.userId, userId));
```

---

*Última actualización: Febrero 2026*
*Versión del schema: 1.0.0*
