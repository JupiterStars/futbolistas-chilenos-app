/**
 * FCH Noticias - Categories Router
 * CRUD completo para categorías
 */

import { z } from 'zod';
import { eq, desc, asc, sql, like, and } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../_core/trpc';
import { db } from '../db/connection';
import { categories, news } from '../db/schema';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const CategoryListInput = z.object({
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
  search: z.string().optional(),
});

const CategoryBySlugInput = z.object({
  slug: z.string(),
});

const CategoryByIdInput = z.object({
  id: z.string().uuid(),
});

const CreateCategoryInput = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
});

const UpdateCategoryInput = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  icon: z.string().max(50).optional().nullable(),
});

// ============================================================================
// ROUTER
// ============================================================================

export const categoriesRouter = router({
  // ========================================================================
  // LISTAR CATEGORÍAS
  // ========================================================================
  list: publicProcedure
    .input(CategoryListInput)
    .query(async ({ input }) => {
      const { limit, offset, search } = input;

      // Construir filtros
      const where = search
        ? like(categories.name, `%${search}%`)
        : undefined;

      // Contar total
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(categories)
        .where(where || sql`1=1`);
      
      const total = countResult[0]?.count || 0;

      // Obtener categorías con conteo de noticias
      const items = await db.query.categories.findMany({
        where,
        limit,
        offset,
        orderBy: [asc(categories.name)],
      });

      // Obtener conteo de noticias por categoría
      const newsCounts = await db
        .select({
          categoryId: news.categoryId,
          count: sql<number>`count(*)`,
        })
        .from(news)
        .groupBy(news.categoryId);

      const countMap = new Map(
        newsCounts.map(c => [c.categoryId, c.count])
      );

      // Agregar conteo a cada categoría
      const itemsWithCount = items.map(cat => ({
        ...cat,
        newsCount: countMap.get(cat.id) || 0,
      }));

      return {
        items: itemsWithCount,
        total,
        limit,
        offset,
        hasMore: offset + items.length < total,
      };
    }),

  // ========================================================================
  // LISTAR TODAS (sin paginación, para selectores)
  // ========================================================================
  all: publicProcedure
    .query(async () => {
      const items = await db.query.categories.findMany({
        orderBy: [asc(categories.name)],
      });

      return items;
    }),

  // ========================================================================
  // OBTENER CATEGORÍA POR ID
  // ========================================================================
  getById: publicProcedure
    .input(CategoryByIdInput)
    .query(async ({ input }) => {
      const { id } = input;

      const item = await db.query.categories.findFirst({
        where: eq(categories.id, id),
      });

      if (!item) {
        throw new Error('Categoría no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // OBTENER CATEGORÍA POR SLUG (con noticias)
  // ========================================================================
  getBySlug: publicProcedure
    .input(z.object({
      slug: z.string(),
      newsLimit: z.number().min(1).max(50).default(20),
      newsOffset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const { slug, newsLimit, newsOffset } = input;

      const category = await db.query.categories.findFirst({
        where: eq(categories.slug, slug),
      });

      if (!category) {
        throw new Error('Categoría no encontrada');
      }

      // Obtener noticias de esta categoría
      const newsItems = await db.query.news.findMany({
        where: eq(news.categoryId, category.id),
        limit: newsLimit,
        offset: newsOffset,
        orderBy: [desc(news.publishedAt)],
      });

      // Contar total de noticias
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(news)
        .where(eq(news.categoryId, category.id));

      return {
        category,
        news: {
          items: newsItems,
          total: countResult[0]?.count || 0,
          limit: newsLimit,
          offset: newsOffset,
          hasMore: newsOffset + newsItems.length < (countResult[0]?.count || 0),
        },
      };
    }),

  // ========================================================================
  // CREAR CATEGORÍA
  // ========================================================================
  create: adminProcedure
    .input(CreateCategoryInput)
    .mutation(async ({ input }) => {
      // Verificar que el slug no exista
      const existing = await db.query.categories.findFirst({
        where: eq(categories.slug, input.slug),
      });

      if (existing) {
        throw new Error('Ya existe una categoría con ese slug');
      }

      const [item] = await db
        .insert(categories)
        .values({
          ...input,
          createdAt: new Date(),
        })
        .returning();

      return item;
    }),

  // ========================================================================
  // ACTUALIZAR CATEGORÍA
  // ========================================================================
  update: adminProcedure
    .input(UpdateCategoryInput)
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      // Verificar que no exista otro con el mismo slug
      if (updates.slug) {
        const existing = await db.query.categories.findFirst({
          where: eq(categories.slug, updates.slug),
        });

        if (existing && existing.id !== id) {
          throw new Error('Ya existe una categoría con ese slug');
        }
      }

      const [item] = await db
        .update(categories)
        .set(updates)
        .where(eq(categories.id, id))
        .returning();

      if (!item) {
        throw new Error('Categoría no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // ELIMINAR CATEGORÍA
  // ========================================================================
  delete: adminProcedure
    .input(CategoryByIdInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      // Verificar si tiene noticias asociadas
      const newsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(news)
        .where(eq(news.categoryId, id));

      if (newsCount[0]?.count > 0) {
        throw new Error('No se puede eliminar una categoría con noticias asociadas');
      }

      const [item] = await db
        .delete(categories)
        .where(eq(categories.id, id))
        .returning();

      if (!item) {
        throw new Error('Categoría no encontrada');
      }

      return { success: true, id };
    }),

  // ========================================================================
  // ESTADÍSTICAS
  // ========================================================================
  stats: publicProcedure
    .query(async () => {
      const categoriesResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(categories);

      return {
        total: categoriesResult[0]?.count || 0,
      };
    }),
});

export type CategoriesRouter = typeof categoriesRouter;
