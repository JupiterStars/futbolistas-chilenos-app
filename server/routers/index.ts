/**
 * FCH Noticias - Routers Index
 * Exporta todos los routers de tRPC
 */

export { newsRouter } from './news';
export { categoriesRouter } from './categories';
export { playersRouter } from './players';
export { transfersRouter } from './transfers';

// Re-export types
export type { NewsRouter } from './news';
export type { CategoriesRouter } from './categories';
export type { PlayersRouter } from './players';
export type { TransfersRouter } from './transfers';
