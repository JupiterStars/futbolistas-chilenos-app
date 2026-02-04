/**
 * FCH Noticias - Relaciones Drizzle ORM
 * 
 * Este archivo exporta todas las relaciones entre tablas para usar con
 * Drizzle ORM's query API. Las relaciones permiten hacer consultas
 * con joins automáticos y type-safe.
 * 
 * @example
 * ```typescript
 * import { db } from './schema';
 * import { withRelations } from './relations';
 * 
 * // Consultar noticias con su categoría
 * const newsWithCategory = await db.query.news.findMany({
 *   with: {
 *     category: true,
 *   },
 * });
 * ```
 */

import { relations } from 'drizzle-orm';
import {
  categories,
  news,
  players,
  transfers,
  favorites,
  leaderboards,
} from './schema';

// ============================================================================
// RELACIONES DE CATEGORIES
// ============================================================================

/**
 * Relaciones de la tabla categories
 * - Una categoría tiene muchas noticias
 */
export const categoriesRelations = relations(categories, ({ many }) => ({
  /**
   * Noticias asociadas a esta categoría
   */
  news: many(news),
}));

// ============================================================================
// RELACIONES DE NEWS
// ============================================================================

/**
 * Relaciones de la tabla news
 * - Una noticia pertenece a una categoría (opcional)
 * - Una noticia puede estar en favoritos de muchos usuarios
 */
export const newsRelations = relations(news, ({ one, many }) => ({
  /**
   * Categoría a la que pertenece la noticia
   */
  category: one(categories, {
    fields: [news.categoryId],
    references: [categories.id],
  }),
  
  /**
   * Favoritos que incluyen esta noticia
   */
  favorites: many(favorites),
}));

// ============================================================================
// RELACIONES DE PLAYERS
// ============================================================================

/**
 * Relaciones de la tabla players
 * - Un jugador tiene muchas transferencias
 * - Un jugador puede estar en favoritos de muchos usuarios
 */
export const playersRelations = relations(players, ({ many }) => ({
  /**
   * Transferencias en las que ha participado el jugador
   */
  transfers: many(transfers),
  
  /**
   * Favoritos que incluyen este jugador
   */
  favorites: many(favorites),
}));

// ============================================================================
// RELACIONES DE TRANSFERS
// ============================================================================

/**
 * Relaciones de la tabla transfers
 * - Una transferencia pertenece a un jugador
 */
export const transfersRelations = relations(transfers, ({ one }) => ({
  /**
   * Jugador involucrado en la transferencia
   */
  player: one(players, {
    fields: [transfers.playerId],
    references: [players.id],
  }),
}));

// ============================================================================
// RELACIONES DE FAVORITES
// ============================================================================

/**
 * Relaciones de la tabla favorites
 * - Un favorito puede ser una noticia (opcional)
 * - Un favorito puede ser un jugador (opcional)
 * 
 * Nota: favorites implementa una relación polimórfica donde
 * exactamente uno de newsId o playerId debe ser no-null.
 */
export const favoritesRelations = relations(favorites, ({ one }) => ({
  /**
   * Noticia favorita (si el favorito es de tipo noticia)
   */
  news: one(news, {
    fields: [favorites.newsId],
    references: [news.id],
  }),
  
  /**
   * Jugador favorito (si el favorito es de tipo jugador)
   */
  player: one(players, {
    fields: [favorites.playerId],
    references: [players.id],
  }),
}));

// ============================================================================
// RELACIONES DE LEADERBOARDS
// ============================================================================

/**
 * Relaciones de la tabla leaderboards
 * - Los leaderboards no tienen relaciones directas con otras tablas
 * - Los datos de jugadores están embebidos en el campo JSON 'data'
 */
export const leaderboardsRelations = relations(leaderboards, ({}) => ({
  // No direct relations - player data is embedded in JSON
}));

// ============================================================================
// CONFIGURACIÓN DE QUERY API
// ============================================================================

/**
 * Configuración de relaciones para usar con db.query
 * Este objeto puede ser usado para configurar el query builder de Drizzle
 */
export const schemaRelations = {
  categories: categoriesRelations,
  news: newsRelations,
  players: playersRelations,
  transfers: transfersRelations,
  favorites: favoritesRelations,
  leaderboards: leaderboardsRelations,
} as const;

// ============================================================================
// TIPOS AUXILIARES PARA CONSULTAS
// ============================================================================

/**
 * Tipo para consultar noticias con relaciones
 */
export type NewsWithRelations = {
  category: typeof categories.$inferSelect | null;
} & typeof news.$inferSelect;

/**
 * Tipo para consultar jugadores con relaciones
 */
export type PlayerWithRelations = {
  transfers: (typeof transfers.$inferSelect)[];
} & typeof players.$inferSelect;

/**
 * Tipo para consultar transferencias con relaciones
 */
export type TransferWithRelations = {
  player: typeof players.$inferSelect;
} & typeof transfers.$inferSelect;

/**
 * Tipo para consultar favoritos con relaciones
 */
export type FavoriteWithRelations = {
  news: typeof news.$inferSelect | null;
  player: typeof players.$inferSelect | null;
} & typeof favorites.$inferSelect;

// ============================================================================
// EJEMPLOS DE USO
// ============================================================================

/**
 * Ejemplo 1: Obtener noticias con categoría
 * ```typescript
 * const result = await db.select({
 *   news: news,
 *   category: categories,
 * }).from(news)
 *   .leftJoin(categories, eq(news.categoryId, categories.id));
 * ```
 */

/**
 * Ejemplo 2: Obtener jugador con sus transferencias
 * ```typescript
 * const player = await db.query.players.findFirst({
 *   where: eq(players.id, playerId),
 *   with: {
 *     transfers: true,
 *   },
 * });
 * ```
 */

/**
 * Ejemplo 3: Obtener favoritos de un usuario con detalles
 * ```typescript
 * const userFavorites = await db.select({
 *   favorite: favorites,
 *   news: news,
 *   player: players,
 * }).from(favorites)
 *   .leftJoin(news, eq(favorites.newsId, news.id))
 *   .leftJoin(players, eq(favorites.playerId, players.id))
 *   .where(eq(favorites.userId, userId));
 * ```
 */

/**
 * Ejemplo 4: Obtener transferencias con info del jugador
 * ```typescript
 * const transfersWithPlayers = await db.select({
 *   transfer: transfers,
 *   player: players,
 * }).from(transfers)
 *   .innerJoin(players, eq(transfers.playerId, players.id))
 *   .where(eq(transfers.status, 'confirmed'));
 * ```
 */
