/**
 * FCH Noticias - Database Schema
 * Drizzle ORM 0.44 + PostgreSQL
 * 
 * Este archivo define el schema completo de la base de datos con 6 tablas principales:
 * - categories: Categorías de noticias
 * - news: Noticias/artículos
 * - players: Jugadores de fútbol
 * - transfers: Transferencias de jugadores
 * - favorites: Favoritos de usuarios (noticias y jugadores)
 * - leaderboards: Tablas de clasificación
 */

import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  timestamp, 
  integer, 
  boolean, 
  jsonb, 
  index,
  check,
  pgEnum,
  sql
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// ENUMS
// ============================================================================

export const playerPositionEnum = pgEnum('player_position', [
  'Portero',
  'Defensa Central',
  'Lateral Izquierdo',
  'Lateral Derecho',
  'Mediocampista Defensivo',
  'Mediocampista Central',
  'Mediocampista Ofensivo',
  'Extremo Izquierdo',
  'Extremo Derecho',
  'Delantero Centro',
  'Segundo Delantero'
]);

export const transferTypeEnum = pgEnum('transfer_type', [
  'transfer',
  'loan',
  'free',
  'return'
]);

export const transferStatusEnum = pgEnum('transfer_status', [
  'confirmed',
  'rumor',
  'pending'
]);

export const leaderboardTypeEnum = pgEnum('leaderboard_type', [
  'goals',
  'assists',
  'mvps',
  'matches',
  'minutes'
]);

// ============================================================================
// TABLA: CATEGORIES
// ============================================================================

/**
 * Tabla de categorías para clasificar las noticias
 * Ejemplos: "Primera División", "Selección Nacional", "Copas", "Mercado"
 */
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 7 }), // Hex color (#FF5733)
  icon: varchar('icon', { length: 50 }), // Nombre del icono de Lucide
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('categories_slug_idx').on(table.slug),
  nameIdx: index('categories_name_idx').on(table.name),
}));

// ============================================================================
// TABLA: NEWS
// ============================================================================

/**
 * Tabla de noticias/artículos del portal
 * Contiene el contenido principal del sitio
 */
export const news = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  imageUrl: varchar('image_url', { length: 500 }),
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  authorId: varchar('author_id', { length: 100 }), // OAuth user ID
  publishedAt: timestamp('published_at', { withTimezone: true }),
  views: integer('views').default(0).notNull(),
  featured: boolean('featured').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('news_slug_idx').on(table.slug),
  categoryIdx: index('news_category_idx').on(table.categoryId),
  publishedIdx: index('news_published_idx').on(table.publishedAt),
  featuredIdx: index('news_featured_idx').on(table.featured),
  authorIdx: index('news_author_idx').on(table.authorId),
  // Índice compuesto para queries de noticias publicadas ordenadas
  publishedAtIdx: index('news_published_at_idx').on(table.publishedAt.desc()),
}));

// ============================================================================
// TABLA: PLAYERS
// ============================================================================

/**
 * Tabla de jugadores de fútbol chilenos
 * Almacena información y estadísticas de los jugadores
 */
export const players = pgTable('players', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  position: varchar('position', { length: 50 }), // Delantero, Mediocampista, etc
  team: varchar('team', { length: 100 }), // Equipo actual
  nationality: varchar('nationality', { length: 50 }).default('Chile').notNull(),
  age: integer('age'),
  height: integer('height'), // cm
  weight: integer('weight'), // kg
  imageUrl: varchar('image_url', { length: 500 }),
  stats: jsonb('stats').$type<{
    goals?: number;
    assists?: number;
    matches?: number;
    minutes?: number;
    yellowCards?: number;
    redCards?: number;
    cleanSheets?: number;
    saves?: number;
  }>().default({}),
  marketValue: integer('market_value'), // euros
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('players_slug_idx').on(table.slug),
  nameIdx: index('players_name_idx').on(table.name),
  teamIdx: index('players_team_idx').on(table.team),
  positionIdx: index('players_position_idx').on(table.position),
  // Índice para búsquedas por nombre
  nameSearchIdx: index('players_name_search_idx').on(table.name.asc()),
}));

// ============================================================================
// TABLA: TRANSFERS
// ============================================================================

/**
 * Tabla de transferencias de jugadores
 * Registra movimientos entre equipos (transferencias, préstamos, etc)
 */
export const transfers = pgTable('transfers', {
  id: uuid('id').primaryKey().defaultRandom(),
  playerId: uuid('player_id').references(() => players.id, { onDelete: 'cascade' }).notNull(),
  fromTeam: varchar('from_team', { length: 100 }),
  toTeam: varchar('to_team', { length: 100 }),
  date: timestamp('date', { withTimezone: true }),
  fee: varchar('fee', { length: 50 }), // "€5M", "Free", "Loan"
  type: varchar('type', { length: 20 }).default('transfer'), // transfer, loan, free
  status: varchar('status', { length: 20 }).default('rumor'), // confirmed, rumor
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  playerIdx: index('transfers_player_idx').on(table.playerId),
  statusIdx: index('transfers_status_idx').on(table.status),
  dateIdx: index('transfers_date_idx').on(table.date),
  // Índice compuesto para transferencias por jugador ordenadas por fecha
  playerDateIdx: index('transfers_player_date_idx').on(table.playerId, table.date.desc()),
}));

// ============================================================================
// TABLA: FAVORITES
// ============================================================================

/**
 * Tabla de favoritos de usuarios
 * Permite a los usuarios guardar noticias y jugadores favoritos
 * Implementa una relación polimórfica: newsId O playerId debe ser no null
 */
export const favorites = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 100 }).notNull(), // OAuth user ID
  newsId: uuid('news_id').references(() => news.id, { onDelete: 'cascade' }),
  playerId: uuid('player_id').references(() => players.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('favorites_user_idx').on(table.userId),
  newsIdx: index('favorites_news_idx').on(table.newsId),
  playerIdx: index('favorites_player_idx').on(table.playerId),
  // Índice único compuesto para evitar duplicados
  userNewsUniqueIdx: index('favorites_user_news_unique_idx').on(table.userId, table.newsId),
  userPlayerUniqueIdx: index('favorites_user_player_unique_idx').on(table.userId, table.playerId),
  // Constraint check: al menos uno de newsId o playerId debe ser no null
  checkConstraint: check('favorites_check_type', 
    sql`${table.newsId} IS NOT NULL OR ${table.playerId} IS NOT NULL`
  ),
}));

// ============================================================================
// TABLA: LEADERBOARDS
// ============================================================================

/**
 * Tabla de tablas de clasificación (goleadores, asistencias, MVPs)
 * Almacena snapshots de rankings con datos en formato JSON
 */
export const leaderboards = pgTable('leaderboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: varchar('type', { length: 50 }).notNull(), // goals, assists, mvps, matches, minutes
  data: jsonb('data').$type<Array<{
    playerId: string;
    playerName: string;
    playerSlug: string;
    team: string;
    imageUrl?: string;
    value: number;
    rank: number;
  }>>().notNull(),
  season: varchar('season', { length: 20 }).default('2024-25'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  typeIdx: index('leaderboards_type_idx').on(table.type),
  updatedIdx: index('leaderboards_updated_idx').on(table.updatedAt),
  // Índice compuesto para buscar leaderboard por tipo y temporada
  typeSeasonIdx: index('leaderboards_type_season_idx').on(table.type, table.season),
}));

// ============================================================================
// RELACIONES
// ============================================================================

// Relaciones de Categories
export const categoriesRelations = relations(categories, ({ many }) => ({
  news: many(news),
}));

// Relaciones de News
export const newsRelations = relations(news, ({ one, many }) => ({
  category: one(categories, {
    fields: [news.categoryId],
    references: [categories.id],
  }),
  favorites: many(favorites),
}));

// Relaciones de Players
export const playersRelations = relations(players, ({ many }) => ({
  transfers: many(transfers),
  favorites: many(favorites),
}));

// Relaciones de Transfers
export const transfersRelations = relations(transfers, ({ one }) => ({
  player: one(players, {
    fields: [transfers.playerId],
    references: [players.id],
  }),
}));

// Relaciones de Favorites
export const favoritesRelations = relations(favorites, ({ one }) => ({
  news: one(news, {
    fields: [favorites.newsId],
    references: [news.id],
  }),
  player: one(players, {
    fields: [favorites.playerId],
    references: [players.id],
  }),
}));

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

export type NewsItem = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = typeof transfers.$inferInsert;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

export type Leaderboard = typeof leaderboards.$inferSelect;
export type InsertLeaderboard = typeof leaderboards.$inferInsert;

// ============================================================================
// HELPERS SQL
// ============================================================================

/**
 * Helper para incrementar contadores (views, etc)
 */
export const increment = (column: any, value: number = 1) => {
  return sql`${column} + ${value}`;
};

/**
 * Helper para obtener timestamp actual
 */
export const now = () => sql`now()`;
