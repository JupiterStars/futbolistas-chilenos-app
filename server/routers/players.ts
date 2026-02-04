/**
 * FCH Noticias - Players Router
 * CRUD completo para jugadores con paginación y filtros
 */

import { z } from 'zod';
import { eq, desc, asc, sql, like, and, or, gte, lte } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../_core/trpc';
import { db } from '../db/connection';
import { players, transfers, favorites, type Player } from '../db/schema';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const PlayerListInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  position: z.string().optional(),
  team: z.string().optional(),
  minAge: z.number().min(15).max(50).optional(),
  maxAge: z.number().min(15).max(50).optional(),
  search: z.string().optional(),
  orderBy: z.enum(['name', 'age', 'marketValue', 'createdAt']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
});

const PlayerBySlugInput = z.object({
  slug: z.string(),
});

const PlayerByIdInput = z.object({
  id: z.string().uuid(),
});

const CreatePlayerInput = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  position: z.string().max(50).optional(),
  team: z.string().max(100).optional(),
  nationality: z.string().max(50).default('Chile'),
  age: z.number().min(15).max(50).optional(),
  height: z.number().min(140).max(220).optional(),
  weight: z.number().min(50).max(120).optional(),
  imageUrl: z.string().url().max(500).optional(),
  stats: z.object({
    goals: z.number().optional(),
    assists: z.number().optional(),
    matches: z.number().optional(),
    minutes: z.number().optional(),
    yellowCards: z.number().optional(),
    redCards: z.number().optional(),
    cleanSheets: z.number().optional(),
    saves: z.number().optional(),
  }).default({}),
  marketValue: z.number().min(0).optional(),
});

const UpdatePlayerInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  position: z.string().max(50).optional().nullable(),
  team: z.string().max(100).optional().nullable(),
  nationality: z.string().max(50).optional(),
  age: z.number().min(15).max(50).optional().nullable(),
  height: z.number().min(140).max(220).optional().nullable(),
  weight: z.number().min(50).max(120).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable(),
  stats: z.object({
    goals: z.number().optional(),
    assists: z.number().optional(),
    matches: z.number().optional(),
    minutes: z.number().optional(),
    yellowCards: z.number().optional(),
    redCards: z.number().optional(),
    cleanSheets: z.number().optional(),
    saves: z.number().optional(),
  }).optional(),
  marketValue: z.number().min(0).optional().nullable(),
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Construye el order by dinámicamente
 */
function buildOrderBy(orderBy: string, order: 'asc' | 'desc') {
  const columnMap: Record<string, any> = {
    name: players.name,
    age: players.age,
    marketValue: players.marketValue,
    createdAt: players.createdAt,
  };

  const column = columnMap[orderBy] || players.name;
  return order === 'desc' ? desc(column) : asc(column);
}

/**
 * Construye los filtros WHERE dinámicamente
 */
function buildWhereClause(
  position?: string,
  team?: string,
  minAge?: number,
  maxAge?: number,
  search?: string
) {
  const conditions = [];

  if (position) {
    conditions.push(eq(players.position, position));
  }

  if (team) {
    conditions.push(eq(players.team, team));
  }

  if (minAge !== undefined) {
    conditions.push(gte(players.age, minAge));
  }

  if (maxAge !== undefined) {
    conditions.push(lte(players.age, maxAge));
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        like(players.name, searchTerm),
        like(players.team, searchTerm),
        like(players.position, searchTerm)
      )
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ============================================================================
// ROUTER
// ============================================================================

export const playersRouter = router({
  // ========================================================================
  // LISTAR JUGADORES (con paginación y filtros)
  // ========================================================================
  list: publicProcedure
    .input(PlayerListInput)
    .query(async ({ input }) => {
      const {
        limit,
        offset,
        position,
        team,
        minAge,
        maxAge,
        search,
        orderBy,
        order,
      } = input;

      // Construir filtros
      const where = buildWhereClause(position, team, minAge, maxAge, search);

      // Contar total
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(players)
        .where(where || sql`1=1`);
      
      const total = countResult[0]?.count || 0;

      // Obtener jugadores
      const items = await db.query.players.findMany({
        where,
        limit,
        offset,
        orderBy: [buildOrderBy(orderBy, order)],
      });

      return {
        items,
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      };
    }),

  // ========================================================================
  // OBTENER JUGADOR POR ID
  // ========================================================================
  getById: publicProcedure
    .input(PlayerByIdInput)
    .query(async ({ input }) => {
      const { id } = input;

      const item = await db.query.players.findFirst({
        where: eq(players.id, id),
      });

      if (!item) {
        throw new Error('Jugador no encontrado');
      }

      return item;
    }),

  // ========================================================================
  // OBTENER JUGADOR POR SLUG (con transferencias)
  // ========================================================================
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
    }))
    .query(async ({ input }) => {
      const { slug } = input;

      const player = await db.query.players.findFirst({
        where: eq(players.slug, slug),
      });

      if (!player) {
        throw new Error('Jugador no encontrado');
      }

      // Obtener transferencias del jugador
      const transfersList = await db.query.transfers.findMany({
        where: eq(transfers.playerId, player.id),
        orderBy: [desc(transfers.date)],
      });

      return {
        ...player,
        transfers: transfersList,
      };
    }),

  // ========================================================================
  // BUSCAR JUGADORES
  // ========================================================================
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const { query, limit } = input;
      const searchTerm = `%${query}%`;

      const items = await db.query.players.findMany({
        where: or(
          like(players.name, searchTerm),
          like(players.team, searchTerm),
          like(players.position, searchTerm)
        ),
        limit,
        orderBy: [asc(players.name)],
      });

      return items;
    }),

  // ========================================================================
  // CREAR JUGADOR
  // ========================================================================
  create: adminProcedure
    .input(CreatePlayerInput)
    .mutation(async ({ input }) => {
      // Verificar que el slug no exista
      const existing = await db.query.players.findFirst({
        where: eq(players.slug, input.slug),
      });

      if (existing) {
        throw new Error('Ya existe un jugador con ese slug');
      }

      const [item] = await db
        .insert(players)
        .values({
          ...input,
          createdAt: new Date(),
        })
        .returning();

      return item;
    }),

  // ========================================================================
  // ACTUALIZAR JUGADOR
  // ========================================================================
  update: adminProcedure
    .input(UpdatePlayerInput)
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      // Verificar que no exista otro con el mismo slug
      if (updates.slug) {
        const existing = await db.query.players.findFirst({
          where: eq(players.slug, updates.slug),
        });

        if (existing && existing.id !== id) {
          throw new Error('Ya existe un jugador con ese slug');
        }
      }

      const [item] = await db
        .update(players)
        .set(updates)
        .where(eq(players.id, id))
        .returning();

      if (!item) {
        throw new Error('Jugador no encontrado');
      }

      return item;
    }),

  // ========================================================================
  // ELIMINAR JUGADOR
  // ========================================================================
  delete: adminProcedure
    .input(PlayerByIdInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      const [item] = await db
        .delete(players)
        .where(eq(players.id, id))
        .returning();

      if (!item) {
        throw new Error('Jugador no encontrado');
      }

      return { success: true, id };
    }),

  // ========================================================================
  // POSICIONES DISPONIBLES
  // ========================================================================
  positions: publicProcedure
    .query(async () => {
      const result = await db
        .select({ position: players.position })
        .from(players)
        .groupBy(players.position)
        .orderBy(asc(players.position));

      return result
        .map(r => r.position)
        .filter((p): p is string => p !== null);
    }),

  // ========================================================================
  // EQUIPOS DISPONIBLES
  // ========================================================================
  teams: publicProcedure
    .query(async () => {
      const result = await db
        .select({ team: players.team })
        .from(players)
        .groupBy(players.team)
        .orderBy(asc(players.team));

      return result
        .map(r => r.team)
        .filter((t): t is string => t !== null);
    }),

  // ========================================================================
  // JUGADORES DESTACADOS (por valor de mercado)
  // ========================================================================
  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ input }) => {
      const { limit } = input;

      const items = await db.query.players.findMany({
        orderBy: [desc(players.marketValue)],
        limit,
      });

      return items;
    }),

  // ========================================================================
  // JUGADORES JÓVENES PROMESAS (Sub-23)
  // ========================================================================
  prospects: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(10) }))
    .query(async ({ input }) => {
      const { limit } = input;

      const items = await db.query.players.findMany({
        where: and(
          lte(players.age, 23),
          gte(players.marketValue, 1000000)
        ),
        orderBy: [desc(players.marketValue)],
        limit,
      });

      return items;
    }),

  // ========================================================================
  // ESTADÍSTICAS
  // ========================================================================
  stats: publicProcedure
    .query(async () => {
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(players);

      const avgAgeResult = await db
        .select({ avg: sql<number>`avg(${players.age})` })
        .from(players);

      const totalMarketValueResult = await db
        .select({ total: sql<number>`coalesce(sum(${players.marketValue}), 0)` })
        .from(players);

      const abroadResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(players)
        .where(sql`${players.team} NOT LIKE '%Chile%' OR ${players.team} IS NULL`);

      return {
        total: totalResult[0]?.count || 0,
        averageAge: Math.round((avgAgeResult[0]?.avg || 0) * 10) / 10,
        totalMarketValue: totalMarketValueResult[0]?.total || 0,
        playingAbroad: abroadResult[0]?.count || 0,
      };
    }),
});

export type PlayersRouter = typeof playersRouter;
