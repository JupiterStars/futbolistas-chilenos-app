/**
 * FCH Noticias - Database Module
 * 
 * Punto de entrada único para todo lo relacionado con la base de datos.
 * Importar desde aquí en lugar de archivos individuales.
 * 
 * @example
 * ```typescript
 * import { db, categories, news, players, relations } from './server/db';
 * import type { Category, NewsItem, Player } from './server/db';
 * ```
 */

// ============================================================================
// EXPORTS DEL SCHEMA
// ============================================================================

export {
  // Enums
  playerPositionEnum,
  transferTypeEnum,
  transferStatusEnum,
  leaderboardTypeEnum,
  
  // Tablas
  categories,
  news,
  players,
  transfers,
  favorites,
  leaderboards,
  
  // Relaciones
  categoriesRelations,
  newsRelations,
  playersRelations,
  transfersRelations,
  favoritesRelations,
  leaderboardsRelations,
  
  // Helpers
  increment,
  now,
  
  // Tipos inferidos
  type Category,
  type InsertCategory,
  type NewsItem,
  type InsertNews,
  type Player,
  type InsertPlayer,
  type Transfer,
  type InsertTransfer,
  type Favorite,
  type InsertFavorite,
  type Leaderboard,
  type InsertLeaderboard,
} from './schema';

// ============================================================================
// EXPORTS DE RELACIONES
// ============================================================================

export {
  // Relaciones individuales
  categoriesRelations as categoriesRel,
  newsRelations as newsRel,
  playersRelations as playersRel,
  transfersRelations as transfersRel,
  favoritesRelations as favoritesRel,
  leaderboardsRelations as leaderboardsRel,
  
  // Objeto de relaciones completo
  schemaRelations as relations,
  
  // Tipos auxiliares
  type NewsWithRelations,
  type PlayerWithRelations,
  type TransferWithRelations,
  type FavoriteWithRelations,
} from './relations';

// ============================================================================
// EXPORTS DE CONSTANTES (re-export desde shared)
// ============================================================================

export {
  // Posiciones
  PLAYER_POSITIONS,
  POSITION_ABBREVIATIONS,
  POSITION_CATEGORIES,
  POSITION_CATEGORY_COLORS,
  type PlayerPosition,
  
  // Transferencias
  TRANSFER_TYPES,
  TRANSFER_STATUSES,
  TRANSFER_TYPE_LABELS,
  TRANSFER_TYPE_ICONS,
  TRANSFER_STATUS_LABELS,
  TRANSFER_STATUS_COLORS,
  type TransferType,
  type TransferStatus,
  
  // Leaderboards
  LEADERBOARD_TYPES,
  LEADERBOARD_TYPE_LABELS,
  LEADERBOARD_TYPE_ICONS,
  LEADERBOARD_TYPE_UNITS,
  type LeaderboardType,
  
  // Configuración
  PAGE_SIZE_OPTIONS,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZES,
  CURRENT_SEASON,
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  
  // Validación
  TEXT_LIMITS,
  NUMBER_RANGES,
  
  // Imágenes
  IMAGE_SIZES,
  IMAGE_PLACEHOLDERS,
  
  // SEO
  SEO_DEFAULTS,
  PAGE_TITLES,
  
  // Utilidades
  formatMarketValue,
  formatTransferFee,
  getPositionLabel,
  getPositionAbbreviation,
  getPositionCategory,
  slugify,
} from '../../shared/constants';

// ============================================================================
// EXPORTS DE TIPOS (re-export desde shared)
// ============================================================================

export type {
  // Tipos base
  NewsWithRelations,
  NewsSummary,
  PlayerWithRelations,
  PlayerSummary,
  PlayerStats,
  TransferWithDetails,
  TransferSummary,
  FavoriteWithDetails,
  LeaderboardEntry,
  LeaderboardWithData,
  
  // API/Respuestas
  PaginatedResponse,
  PaginatedNews,
  PaginatedPlayers,
  PaginatedTransfers,
  
  // Filtros
  NewsFilters,
  PlayerFilters,
  TransferFilters,
  
  // Usuario
  AuthUser,
  UserSession,
  
  // UX
  NewsViewMode,
  SortOrder,
  NewsSortBy,
  PlayerSortBy,
} from '../../shared/types';

// ============================================================================
// CONFIGURACIÓN DE BASE DE DATOS
// ============================================================================

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Cliente de base de datos (singleton)
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Obtiene o inicializa la conexión a la base de datos
 */
export function getDb(connectionString: string) {
  if (!db) {
    client = postgres(connectionString);
    db = drizzle(client, { schema });
  }
  return db;
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closeDb() {
  if (client) {
    await client.end();
    client = null;
    db = null;
  }
}

/**
 * Verifica la conexión a la base de datos
 */
export async function checkDbConnection(connectionString: string): Promise<boolean> {
  try {
    const testClient = postgres(connectionString, { max: 1 });
    await testClient`SELECT 1`;
    await testClient.end();
    return true;
  } catch {
    return false;
  }
}

// Export default del cliente db
export { db };
