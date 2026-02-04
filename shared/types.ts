/**
 * FCH Noticias - Tipos TypeScript Compartidos
 * 
 * Este archivo define las interfaces TypeScript utilizadas tanto en el frontend
 * como en el backend. Mantiene la consistencia de tipos entre cliente y servidor.
 */

// Re-exportar tipos desde Drizzle schema para mantener compatibilidad
export type {
  Category,
  InsertCategory,
  NewsItem,
  InsertNews,
  Player,
  InsertPlayer,
  Transfer,
  InsertTransfer,
  Favorite,
  InsertFavorite,
  Leaderboard,
  InsertLeaderboard,
} from '../server/db/schema';

// ============================================================================
// TIPOS DE ENUNMS/CONSTANTES
// ============================================================================

/** Posiciones de jugadores disponibles */
export type PlayerPosition =
  | 'Portero'
  | 'Defensa Central'
  | 'Lateral Izquierdo'
  | 'Lateral Derecho'
  | 'Mediocampista Defensivo'
  | 'Mediocampista Central'
  | 'Mediocampista Ofensivo'
  | 'Extremo Izquierdo'
  | 'Extremo Derecho'
  | 'Delantero Centro'
  | 'Segundo Delantero';

/** Tipos de transferencia */
export type TransferType = 'transfer' | 'loan' | 'free' | 'return';

/** Estados de transferencia */
export type TransferStatus = 'confirmed' | 'rumor' | 'pending';

/** Tipos de leaderboard/tablas de clasificación */
export type LeaderboardType = 'goals' | 'assists' | 'mvps' | 'matches' | 'minutes';

// ============================================================================
// INTERFACES EXTENDIDAS PARA FRONTEND
// ============================================================================

/**
 * Noticia completa con relaciones
 * Usado en páginas de detalle de noticias
 */
export interface NewsWithRelations {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  categoryId: string | null;
  category: Category | null;
  authorId: string | null;
  publishedAt: Date | null;
  views: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Noticia resumida para listados
 * Usado en cards y listas de noticias
 */
export interface NewsSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
    slug: string;
    color: string | null;
  } | null;
  publishedAt: Date | null;
  views: number;
  featured: boolean;
}

/**
 * Jugador completo con relaciones
 * Usado en páginas de detalle de jugador
 */
export interface PlayerWithRelations {
  id: string;
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
  transfers: TransferWithDetails[];
  createdAt: Date;
}

/**
 * Estadísticas de jugador
 */
export interface PlayerStats {
  goals?: number;
  assists?: number;
  matches?: number;
  minutes?: number;
  yellowCards?: number;
  redCards?: number;
  cleanSheets?: number;
  saves?: number;
}

/**
 * Jugador resumido para listados
 */
export interface PlayerSummary {
  id: string;
  name: string;
  slug: string;
  position: string | null;
  team: string | null;
  nationality: string;
  age: number | null;
  imageUrl: string | null;
  stats: PlayerStats;
  marketValue: number | null;
}

/**
 * Transferencia con detalles del jugador
 */
export interface TransferWithDetails {
  id: string;
  playerId: string;
  player: PlayerSummary;
  fromTeam: string | null;
  toTeam: string | null;
  date: Date | null;
  fee: string | null;
  type: TransferType;
  status: TransferStatus;
  createdAt: Date;
}

/**
 * Transferencia resumida
 */
export interface TransferSummary {
  id: string;
  playerId: string;
  playerName: string;
  playerSlug: string;
  playerImageUrl: string | null;
  fromTeam: string | null;
  toTeam: string | null;
  date: Date | null;
  fee: string | null;
  type: TransferType;
  status: TransferStatus;
}

/**
 * Favorito con detalles (noticia o jugador)
 */
export interface FavoriteWithDetails {
  id: string;
  userId: string;
  news: NewsSummary | null;
  player: PlayerSummary | null;
  createdAt: Date;
}

/**
 * Entrada de leaderboard/tabla de clasificación
 */
export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  playerSlug: string;
  team: string;
  imageUrl?: string;
  value: number;
  rank: number;
}

/**
 * Leaderboard completo con metadata
 */
export interface LeaderboardWithData {
  id: string;
  type: LeaderboardType;
  data: LeaderboardEntry[];
  season: string;
  updatedAt: Date;
}

// ============================================================================
// INTERFACES DE API/RESPUESTAS
// ============================================================================

/**
 * Respuesta paginada estándar
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Respuesta de noticias paginada
 */
export type PaginatedNews = PaginatedResponse<NewsSummary>;

/**
 * Respuesta de jugadores paginada
 */
export type PaginatedPlayers = PaginatedResponse<PlayerSummary>;

/**
 * Respuesta de transferencias paginada
 */
export type PaginatedTransfers = PaginatedResponse<TransferSummary>;

/**
 * Filtros para búsqueda de noticias
 */
export interface NewsFilters {
  categoryId?: string;
  featured?: boolean;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Filtros para búsqueda de jugadores
 */
export interface PlayerFilters {
  position?: string;
  team?: string;
  search?: string;
  minAge?: number;
  maxAge?: number;
}

/**
 * Filtros para búsqueda de transferencias
 */
export interface TransferFilters {
  status?: TransferStatus;
  type?: TransferType;
  playerId?: string;
  search?: string;
}

// ============================================================================
// TIPOS DE USUARIO (OAuth)
// ============================================================================

/**
 * Usuario autenticado (del OAuth provider)
 */
export interface AuthUser {
  id: string; // OAuth user ID
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'github' | 'discord';
}

/**
 * Sesión de usuario
 */
export interface UserSession {
  user: AuthUser;
  expiresAt: Date;
}

// ============================================================================
// TIPOS DE COMPONENTES/UX
// ============================================================================

/**
 * Configuración de vista para grids de noticias
 */
export type NewsViewMode = 'grid' | 'list' | 'compact';

/**
 * Ordenamiento disponible para listados
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Opciones de ordenamiento para noticias
 */
export type NewsSortBy = 'publishedAt' | 'views' | 'createdAt';

/**
 * Opciones de ordenamiento para jugadores
 */
export type PlayerSortBy = 'name' | 'goals' | 'assists' | 'marketValue' | 'age';

// ============================================================================
// RE-EXPORTS DE ERRORES
// ============================================================================

export * from './_core/errors';
