/**
 * FCH Noticias - Transfers Router
 * CRUD completo para transferencias de jugadores
 */

import { z } from 'zod';
import { eq, desc, asc, sql, like, and, or } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../_core/trpc';
import { db } from '../db/connection';
import { transfers, players } from '../db/schema';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const TransferListInput = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  playerId: z.string().uuid().optional(),
  status: z.enum(['confirmed', 'rumor', 'pending']).optional(),
  type: z.enum(['transfer', 'loan', 'free', 'return']).optional(),
  fromTeam: z.string().optional(),
  toTeam: z.string().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['date', 'createdAt']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const TransferByIdInput = z.object({
  id: z.string().uuid(),
});

const CreateTransferInput = z.object({
  playerId: z.string().uuid(),
  fromTeam: z.string().max(100).optional(),
  toTeam: z.string().max(100).optional(),
  date: z.date().optional(),
  fee: z.string().max(50).optional(),
  type: z.enum(['transfer', 'loan', 'free', 'return']).default('transfer'),
  status: z.enum(['confirmed', 'rumor', 'pending']).default('rumor'),
});

const UpdateTransferInput = z.object({
  id: z.string().uuid(),
  fromTeam: z.string().max(100).optional().nullable(),
  toTeam: z.string().max(100).optional().nullable(),
  date: z.date().optional().nullable(),
  fee: z.string().max(50).optional().nullable(),
  type: z.enum(['transfer', 'loan', 'free', 'return']).optional(),
  status: z.enum(['confirmed', 'rumor', 'pending']).optional(),
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Construye el order by dinámicamente
 */
function buildOrderBy(orderBy: string, order: 'asc' | 'desc') {
  const columnMap: Record<string, any> = {
    date: transfers.date,
    createdAt: transfers.createdAt,
  };

  const column = columnMap[orderBy] || transfers.date;
  return order === 'desc' ? desc(column) : asc(column);
}

/**
 * Construye los filtros WHERE dinámicamente
 */
function buildWhereClause(
  playerId?: string,
  status?: 'confirmed' | 'rumor' | 'pending',
  type?: 'transfer' | 'loan' | 'free' | 'return',
  fromTeam?: string,
  toTeam?: string,
  search?: string
) {
  const conditions = [];

  if (playerId) {
    conditions.push(eq(transfers.playerId, playerId));
  }

  if (status) {
    conditions.push(eq(transfers.status, status));
  }

  if (type) {
    conditions.push(eq(transfers.type, type));
  }

  if (fromTeam) {
    conditions.push(like(transfers.fromTeam || '', `%${fromTeam}%`));
  }

  if (toTeam) {
    conditions.push(like(transfers.toTeam || '', `%${toTeam}%`));
  }

  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        like(transfers.fromTeam || '', searchTerm),
        like(transfers.toTeam || '', searchTerm),
        like(transfers.fee || '', searchTerm)
      )
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ============================================================================
// ROUTER
// ============================================================================

export const transfersRouter = router({
  // ========================================================================
  // LISTAR TRANSFERENCIAS (con paginación y filtros)
  // ========================================================================
  list: publicProcedure
    .input(TransferListInput)
    .query(async ({ input }) => {
      const {
        limit,
        offset,
        playerId,
        status,
        type,
        fromTeam,
        toTeam,
        search,
        orderBy,
        order,
      } = input;

      // Construir filtros
      const where = buildWhereClause(playerId, status, type, fromTeam, toTeam, search);

      // Contar total
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transfers)
        .where(where || sql`1=1`);
      
      const total = countResult[0]?.count || 0;

      // Obtener transferencias con info del jugador
      const items = await db.query.transfers.findMany({
        where,
        with: {
          player: true,
        },
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
  // OBTENER TRANSFERENCIA POR ID
  // ========================================================================
  getById: publicProcedure
    .input(TransferByIdInput)
    .query(async ({ input }) => {
      const { id } = input;

      const item = await db.query.transfers.findFirst({
        where: eq(transfers.id, id),
        with: {
          player: true,
        },
      });

      if (!item) {
        throw new Error('Transferencia no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // TRANSFERENCIAS RECIENTES
  // ========================================================================
  recent: publicProcedure
    .input(z.object({ 
      limit: z.number().min(1).max(50).default(10),
      status: z.enum(['confirmed', 'rumor']).optional(),
    }))
    .query(async ({ input }) => {
      const { limit, status } = input;

      const where = status ? eq(transfers.status, status) : undefined;

      const items = await db.query.transfers.findMany({
        where,
        with: {
          player: true,
        },
        limit,
        orderBy: [desc(transfers.date)],
      });

      return items;
    }),

  // ========================================================================
  // TRANSFERENCIAS POR JUGADOR
  // ========================================================================
  byPlayer: publicProcedure
    .input(z.object({
      playerId: z.string().uuid(),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const { playerId, limit } = input;

      const items = await db.query.transfers.findMany({
        where: eq(transfers.playerId, playerId),
        with: {
          player: true,
        },
        limit,
        orderBy: [desc(transfers.date)],
      });

      return items;
    }),

  // ========================================================================
  // CREAR TRANSFERENCIA
  // ========================================================================
  create: adminProcedure
    .input(CreateTransferInput)
    .mutation(async ({ input }) => {
      // Verificar que el jugador exista
      const player = await db.query.players.findFirst({
        where: eq(players.id, input.playerId),
      });

      if (!player) {
        throw new Error('Jugador no encontrado');
      }

      const [item] = await db
        .insert(transfers)
        .values({
          ...input,
          createdAt: new Date(),
        })
        .returning();

      return item;
    }),

  // ========================================================================
  // ACTUALIZAR TRANSFERENCIA
  // ========================================================================
  update: adminProcedure
    .input(UpdateTransferInput)
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      const [item] = await db
        .update(transfers)
        .set(updates)
        .where(eq(transfers.id, id))
        .returning();

      if (!item) {
        throw new Error('Transferencia no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // ELIMINAR TRANSFERENCIA
  // ========================================================================
  delete: adminProcedure
    .input(TransferByIdInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      const [item] = await db
        .delete(transfers)
        .where(eq(transfers.id, id))
        .returning();

      if (!item) {
        throw new Error('Transferencia no encontrada');
      }

      return { success: true, id };
    }),

  // ========================================================================
  // ACTUALIZAR ESTADO DE TRANSFERENCIA
  // ========================================================================
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string().uuid(),
      status: z.enum(['confirmed', 'rumor', 'pending']),
    }))
    .mutation(async ({ input }) => {
      const { id, status } = input;

      const [item] = await db
        .update(transfers)
        .set({ status })
        .where(eq(transfers.id, id))
        .returning();

      if (!item) {
        throw new Error('Transferencia no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // ESTADÍSTICAS
  // ========================================================================
  stats: publicProcedure
    .query(async () => {
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transfers);

      const confirmedResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transfers)
        .where(eq(transfers.status, 'confirmed'));

      const rumorResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transfers)
        .where(eq(transfers.status, 'rumor'));

      const byTypeResult = await db
        .select({
          type: transfers.type,
          count: sql<number>`count(*)`,
        })
        .from(transfers)
        .groupBy(transfers.type);

      return {
        total: totalResult[0]?.count || 0,
        confirmed: confirmedResult[0]?.count || 0,
        rumors: rumorResult[0]?.count || 0,
        byType: byTypeResult,
      };
    }),
});

export type TransfersRouter = typeof transfersRouter;
