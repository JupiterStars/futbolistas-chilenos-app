/**
 * FCH Noticias - Constantes y Enums Compartidos
 * 
 * Este archivo define constantes, enums y configuraciones utilizadas
 * tanto en el frontend como en el backend.
 */

// ============================================================================
// POSICIONES DE JUGADORES
// ============================================================================

/**
 * Posiciones de jugadores de fútbol
 * Ordenadas de defensa a ataque
 */
export const PLAYER_POSITIONS = [
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
  'Segundo Delantero',
] as const;

/** Tipo derivado de las posiciones */
export type PlayerPosition = typeof PLAYER_POSITIONS[number];

/**
 * Mapeo de posiciones a abreviaturas cortas
 * Usado para mostrar badges y filtros compactos
 */
export const POSITION_ABBREVIATIONS: Record<PlayerPosition, string> = {
  'Portero': 'POR',
  'Defensa Central': 'CT',
  'Lateral Izquierdo': 'LI',
  'Lateral Derecho': 'LD',
  'Mediocampista Defensivo': 'MCD',
  'Mediocampista Central': 'MC',
  'Mediocampista Ofensivo': 'MCO',
  'Extremo Izquierdo': 'EI',
  'Extremo Derecho': 'ED',
  'Delantero Centro': 'DC',
  'Segundo Delantero': 'SD',
};

/**
 * Mapeo de posiciones a categorías de campo
 */
export const POSITION_CATEGORIES: Record<PlayerPosition, 'goalkeeper' | 'defense' | 'midfield' | 'attack'> = {
  'Portero': 'goalkeeper',
  'Defensa Central': 'defense',
  'Lateral Izquierdo': 'defense',
  'Lateral Derecho': 'defense',
  'Mediocampista Defensivo': 'midfield',
  'Mediocampista Central': 'midfield',
  'Mediocampista Ofensivo': 'midfield',
  'Extremo Izquierdo': 'attack',
  'Extremo Derecho': 'attack',
  'Delantero Centro': 'attack',
  'Segundo Delantero': 'attack',
};

/**
 * Colores asociados a cada categoría de posición
 */
export const POSITION_CATEGORY_COLORS = {
  goalkeeper: '#F59E0B', // amber-500
  defense: '#3B82F6',    // blue-500
  midfield: '#10B981',   // emerald-500
  attack: '#EF4444',     // red-500
};

// ============================================================================
// TIPOS DE TRANSFERENCIA
// ============================================================================

/**
 * Tipos de transferencia de jugadores
 */
export const TRANSFER_TYPES = [
  'transfer',
  'loan',
  'free',
  'return',
] as const;

/** Tipo derivado de tipos de transferencia */
export type TransferType = typeof TRANSFER_TYPES[number];

/**
 * Labels en español para tipos de transferencia
 */
export const TRANSFER_TYPE_LABELS: Record<TransferType, string> = {
  'transfer': 'Transferencia',
  'loan': 'Préstamo',
  'free': 'Libre',
  'return': 'Regreso',
};

/**
 * Iconos asociados a tipos de transferencia (nombres de Lucide)
 */
export const TRANSFER_TYPE_ICONS: Record<TransferType, string> = {
  'transfer': 'ArrowRightLeft',
  'loan': 'Clock',
  'free': 'Unlock',
  'return': 'Undo2',
};

// ============================================================================
// ESTADOS DE TRANSFERENCIA
// ============================================================================

/**
 * Estados posibles de una transferencia
 */
export const TRANSFER_STATUSES = [
  'confirmed',
  'rumor',
  'pending',
] as const;

/** Tipo derivado de estados de transferencia */
export type TransferStatus = typeof TRANSFER_STATUSES[number];

/**
 * Labels en español para estados de transferencia
 */
export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  'confirmed': 'Confirmado',
  'rumor': 'Rumor',
  'pending': 'Pendiente',
};

/**
 * Colores para estados de transferencia (Tailwind classes)
 */
export const TRANSFER_STATUS_COLORS: Record<TransferStatus, { bg: string; text: string; border: string }> = {
  'confirmed': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  'rumor': {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  'pending': {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
};

// ============================================================================
// TIPOS DE LEADERBOARD
// ============================================================================

/**
 * Tipos de tablas de clasificación disponibles
 */
export const LEADERBOARD_TYPES = [
  'goals',
  'assists',
  'mvps',
  'matches',
  'minutes',
] as const;

/** Tipo derivado de tipos de leaderboard */
export type LeaderboardType = typeof LEADERBOARD_TYPES[number];

/**
 * Labels en español para tipos de leaderboard
 */
export const LEADERBOARD_TYPE_LABELS: Record<LeaderboardType, string> = {
  'goals': 'Goleadores',
  'assists': 'Asistencias',
  'mvps': 'MVPs',
  'matches': 'Partidos Jugados',
  'minutes': 'Minutos Jugados',
};

/**
 * Iconos para tipos de leaderboard (Lucide)
 */
export const LEADERBOARD_TYPE_ICONS: Record<LeaderboardType, string> = {
  'goals': 'Target',
  'assists': 'HandHelping',
  'mvps': 'Trophy',
  'matches': 'Calendar',
  'minutes': 'Clock',
};

/**
 * Unidades para valores de leaderboard
 */
export const LEADERBOARD_TYPE_UNITS: Record<LeaderboardType, string> = {
  'goals': 'goles',
  'assists': 'asistencias',
  'mvps': 'veces',
  'matches': 'partidos',
  'minutes': 'minutos',
};

// ============================================================================
// COLORES DE CATEGORÍAS PREDEFINIDAS
// ============================================================================

/**
 * Colores predefinidos para categorías de noticias
 */
export const CATEGORY_PRESET_COLORS = [
  '#EF4444', // Rojo
  '#F97316', // Naranja
  '#F59E0B', // Ámbar
  '#84CC16', // Lima
  '#10B981', // Esmeralda
  '#06B6D4', // Cyan
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Violeta
  '#D946EF', // Fucsia
  '#F43F5E', // Rosa
  '#71717A', // Zinc
] as const;

/**
 * Iconos predefinidos para categorías (Lucide)
 */
export const CATEGORY_PRESET_ICONS = [
  'Newspaper',
  'Trophy',
  'Shield',
  'Users',
  'TrendingUp',
  'Calendar',
  'MapPin',
  'Star',
  'Flame',
  'Zap',
] as const;

// ============================================================================
// CONFIGURACIÓN DE PAGINACIÓN
// ============================================================================

/**
 * Opciones de tamaño de página
 */
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

/**
 * Tamaño de página por defecto
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * Límites máximos de items por endpoint
 */
export const MAX_PAGE_SIZES = {
  news: 100,
  players: 100,
  transfers: 50,
  favorites: 100,
} as const;

// ============================================================================
// CONFIGURACIÓN DE FECHAS
// ============================================================================

/**
 * Temporada actual
 */
export const CURRENT_SEASON = '2024-25';

/**
 * Formato de fecha por defecto
 */
export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy';

/**
 * Formato de fecha y hora
 */
export const DEFAULT_DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';

// ============================================================================
// CONSTANTES DE VALIDACIÓN
// ============================================================================

/**
 * Límites de longitud para campos de texto
 */
export const TEXT_LIMITS = {
  category: {
    name: { min: 2, max: 100 },
    slug: { min: 2, max: 100 },
    description: { max: 500 },
  },
  news: {
    title: { min: 5, max: 255 },
    slug: { min: 5, max: 255 },
    excerpt: { min: 10, max: 500 },
    content: { min: 50 },
    imageUrl: { max: 500 },
  },
  player: {
    name: { min: 2, max: 100 },
    slug: { min: 2, max: 100 },
    team: { max: 100 },
    nationality: { max: 50 },
    imageUrl: { max: 500 },
  },
  transfer: {
    fromTeam: { max: 100 },
    toTeam: { max: 100 },
    fee: { max: 50 },
  },
} as const;

/**
 * Rangos numéricos válidos
 */
export const NUMBER_RANGES = {
  player: {
    age: { min: 15, max: 50 },
    height: { min: 140, max: 220 }, // cm
    weight: { min: 50, max: 120 }, // kg
    marketValue: { min: 0, max: 999_999_999 }, // euros
  },
  stats: {
    goals: { min: 0, max: 1000 },
    assists: { min: 0, max: 1000 },
    matches: { min: 0, max: 1000 },
    minutes: { min: 0, max: 50_000 },
    yellowCards: { min: 0, max: 100 },
    redCards: { min: 0, max: 20 },
  },
} as const;

// ============================================================================
// CONFIGURACIÓN DE IMÁGENES
// ============================================================================

/**
 * Tamaños de imágenes para diferentes usos
 */
export const IMAGE_SIZES = {
  news: {
    thumbnail: { width: 400, height: 225 },
    card: { width: 800, height: 450 },
    featured: { width: 1200, height: 675 },
    full: { width: 1920, height: 1080 },
  },
  player: {
    avatar: { width: 200, height: 200 },
    card: { width: 400, height: 400 },
    full: { width: 800, height: 800 },
  },
} as const;

/**
 * Placeholders para imágenes faltantes
 */
export const IMAGE_PLACEHOLDERS = {
  news: '/images/placeholder-news.jpg',
  player: '/images/placeholder-player.jpg',
} as const;

// ============================================================================
// CONFIGURACIÓN DE SEO/METADATA
// ============================================================================

/**
 * Configuración de SEO por defecto
 */
export const SEO_DEFAULTS = {
  title: 'FCH Noticias',
  description: 'El mejor portal de noticias de fútbol chileno. Noticias, transferencias, estadísticas y más.',
  keywords: ['fútbol chileno', 'noticias', 'transferencias', 'goleadores', 'chile'],
  ogImage: '/images/og-default.jpg',
  twitterHandle: '@fchnoticias',
} as const;

/**
 * Títulos de página por sección
 */
export const PAGE_TITLES = {
  home: 'Inicio',
  news: 'Noticias',
  players: 'Jugadores',
  transfers: 'Transferencias',
  leaderboards: 'Tablas de Clasificación',
  favorites: 'Mis Favoritos',
  search: 'Búsqueda',
} as const;

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Función para formatear valor de mercado
 */
export function formatMarketValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/D';
  
  if (value >= 1_000_000_000) {
    return `€${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `€${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `€${(value / 1_000).toFixed(0)}K`;
  }
  return `€${value}`;
}

/**
 * Función para formatear fee de transferencia
 */
export function formatTransferFee(fee: string | null | undefined): string {
  if (!fee) return 'No revelado';
  if (fee.toLowerCase() === 'free') return 'Libre';
  if (fee.toLowerCase() === 'loan') return 'Préstamo';
  return fee;
}

/**
 * Obtener label de posición
 */
export function getPositionLabel(position: string | null): string {
  if (!position) return 'Desconocida';
  return position;
}

/**
 * Obtener abreviatura de posición
 */
export function getPositionAbbreviation(position: string | null): string {
  if (!position || !(position in POSITION_ABBREVIATIONS)) return 'N/D';
  return POSITION_ABBREVIATIONS[position as PlayerPosition];
}

/**
 * Obtener categoría de posición
 */
export function getPositionCategory(position: string | null): 'goalkeeper' | 'defense' | 'midfield' | 'attack' | 'unknown' {
  if (!position || !(position in POSITION_CATEGORIES)) return 'unknown';
  return POSITION_CATEGORIES[position as PlayerPosition];
}

/**
 * Slugify - convertir texto a slug URL-friendly
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}
