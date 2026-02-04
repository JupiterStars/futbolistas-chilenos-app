/**
 * FCH Noticias - News Router
 * CRUD completo para noticias con paginación, filtros y búsqueda
 */

import { z } from 'zod';
import { eq, desc, asc, sql, like, and, or, isNull } from 'drizzle-orm';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../_core/trpc';
import { db } from '../db/connection';
import { news, categories, type NewsItem } from '../db/schema';

// ============================================================================
// SCHEMAS DE VALIDACIÓN
// ============================================================================

const NewsListInput = z.object({
  categoryId: z.string().uuid().optional(),
  categorySlug: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
  featured: z.boolean().optional(),
  search: z.string().optional(),
  orderBy: z.enum(['publishedAt', 'views', 'createdAt']).default('publishedAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

const NewsBySlugInput = z.object({
  slug: z.string(),
});

const NewsByIdInput = z.object({
  id: z.string().uuid(),
});

const CreateNewsInput = z.object({
  title: z.string().min(5).max(255),
  slug: z.string().min(5).max(255),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(50),
  imageUrl: z.string().url().max(500).optional(),
  categoryId: z.string().uuid().optional(),
  featured: z.boolean().default(false),
  publishedAt: z.date().optional(),
});

const UpdateNewsInput = z.object({
  id: z.string().uuid(),
  title: z.string().min(5).max(255).optional(),
  slug: z.string().min(5).max(255).optional(),
  excerpt: z.string().min(10).max(500).optional(),
  content: z.string().min(50).optional(),
  imageUrl: z.string().url().max(500).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  featured: z.boolean().optional(),
  publishedAt: z.date().optional().nullable(),
});

const IncrementViewsInput = z.object({
  id: z.string().uuid(),
});

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Construye el order by dinámicamente
 */
function buildOrderBy(orderBy: string, order: 'asc' | 'desc') {
  const columnMap: Record<string, any> = {
    publishedAt: news.publishedAt,
    views: news.views,
    createdAt: news.createdAt,
  };

  const column = columnMap[orderBy] || news.publishedAt;
  return order === 'desc' ? desc(column) : asc(column);
}

/**
 * Construye los filtros WHERE dinámicamente
 */
function buildWhereClause(
  categoryId?: string,
  categorySlug?: string,
  featured?: boolean,
  search?: string
) {
  const conditions = [];

  // Filtro por ID de categoría
  if (categoryId) {
    conditions.push(eq(news.categoryId, categoryId));
  }

  // Filtro por slug de categoría (requiere subquery)
  // Nota: Esto se maneja separadamente en la consulta

  // Filtro por destacados
  if (featured !== undefined) {
    conditions.push(eq(news.featured, featured));
  }

  // Búsqueda full-text
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`;
    conditions.push(
      or(
        like(news.title, searchTerm),
        like(news.excerpt, searchTerm),
        like(news.content, searchTerm)
      )
    );
  }

  // Solo noticias publicadas (tiene fecha de publicación)
  conditions.push(isNull(news.publishedAt).not());

  return conditions.length > 0 ? and(...conditions) : undefined;
}

// ============================================================================
// ROUTER
// ============================================================================

export const newsRouter = router({
  // ========================================================================
  // LISTAR NOTICIAS (con paginación y filtros)
  // ========================================================================
  list: publicProcedure
    .input(NewsListInput)
    .query(async ({ input }) => {
      const {
        categoryId,
        categorySlug,
        limit,
        offset,
        featured,
        search,
        orderBy,
        order,
      } = input;

      // Resolver categorySlug a categoryId si es necesario
      let resolvedCategoryId = categoryId;
      if (categorySlug && !categoryId) {
        const category = await db.query.categories.findFirst({
          where: eq(categories.slug, categorySlug),
        });
        if (category) {
          resolvedCategoryId = category.id;
        }
      }

      // Construir filtros
      const where = buildWhereClause(resolvedCategoryId, undefined, featured, search);

      // Contar total de resultados
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(news)
        .where(where || sql`1=1`);
      
      const total = countResult[0]?.count || 0;

      // Obtener noticias con relaciones
      const items = await db.query.news.findMany({
        where,
        with: {
          category: true,
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
  // NOTICIAS DESTACADAS
  // ========================================================================
  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(20).default(5) }))
    .query(async ({ input }) => {
      const { limit } = input;

      const items = await db.query.news.findMany({
        where: and(
          eq(news.featured, true),
          isNull(news.publishedAt).not()
        ),
        with: {
          category: true,
        },
        limit,
        orderBy: [desc(news.publishedAt)],
      });

      return items;
    }),

  // ========================================================================
  // OBTENER NOTICIA POR ID
  // ========================================================================
  getById: publicProcedure
    .input(NewsByIdInput)
    .query(async ({ input }) => {
      const { id } = input;

      const item = await db.query.news.findFirst({
        where: eq(news.id, id),
        with: {
          category: true,
        },
      });

      if (!item) {
        throw new Error('Noticia no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // OBTENER NOTICIA POR SLUG
  // ========================================================================
  getBySlug: publicProcedure
    .input(NewsBySlugInput)
    .query(async ({ input }) => {
      const { slug } = input;

      const item = await db.query.news.findFirst({
        where: eq(news.slug, slug),
        with: {
          category: true,
        },
      });

      if (!item) {
        throw new Error('Noticia no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // CREAR NOTICIA
  // ========================================================================
  create: adminProcedure
    .input(CreateNewsInput)
    .mutation(async ({ input, ctx }) => {
      const { categoryId, ...rest } = input;

      const [item] = await db
        .insert(news)
        .values({
          ...rest,
          categoryId: categoryId || null,
          authorId: ctx.user.id,
          views: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return item;
    }),

  // ========================================================================
  // ACTUALIZAR NOTICIA
  // ========================================================================
  update: adminProcedure
    .input(UpdateNewsInput)
    .mutation(async ({ input }) => {
      const { id, ...updates } = input;

      const [item] = await db
        .update(news)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(news.id, id))
        .returning();

      if (!item) {
        throw new Error('Noticia no encontrada');
      }

      return item;
    }),

  // ========================================================================
  // ELIMINAR NOTICIA
  // ========================================================================
  delete: adminProcedure
    .input(NewsByIdInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      const [item] = await db
        .delete(news)
        .where(eq(news.id, id))
        .returning();

      if (!item) {
        throw new Error('Noticia no encontrada');
      }

      return { success: true, id };
    }),

  // ========================================================================
  // INCREMENTAR VISTAS
  // ========================================================================
  incrementViews: publicProcedure
    .input(IncrementViewsInput)
    .mutation(async ({ input }) => {
      const { id } = input;

      await db
        .update(news)
        .set({
          views: sql`${news.views} + 1`,
        })
        .where(eq(news.id, id));

      return { success: true };
    }),

  // ========================================================================
  // BUSCAR NOTICIAS (búsqueda avanzada)
  // ========================================================================
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1),
      limit: z.number().min(1).max(50).default(10),
    }))
    .query(async ({ input }) => {
      const { query, limit } = input;
      const searchTerm = `%${query}%`;

      const items = await db.query.news.findMany({
        where: and(
          or(
            like(news.title, searchTerm),
            like(news.excerpt, searchTerm),
            like(news.content, searchTerm)
          ),
          isNull(news.publishedAt).not()
        ),
        with: {
          category: true,
        },
        limit,
        orderBy: [desc(news.publishedAt)],
      });

      return items;
    }),

  // ========================================================================
  // NOTICIAS RELACIONADAS
  // ========================================================================
  related: publicProcedure
    .input(z.object({
      newsId: z.string().uuid(),
      limit: z.number().min(1).max(10).default(5),
    }))
    .query(async ({ input }) => {
      const { newsId, limit } = input;

      // Obtener la noticia original para buscar por categoría
      const originalNews = await db.query.news.findFirst({
        where: eq(news.id, newsId),
      });

      if (!originalNews || !originalNews.categoryId) {
        return [];
      }

      // Buscar noticias de la misma categoría, excluyendo la actual
      const items = await db.query.news.findMany({
        where: and(
          eq(news.categoryId, originalNews.categoryId),
          sql`${news.id} != ${newsId}`,
          isNull(news.publishedAt).not()
        ),
        with: {
          category: true,
        },
        limit,
        orderBy: [desc(news.publishedAt)],
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
        .from(news);
      
      const featuredResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(news)
        .where(eq(news.featured, true));
      
      const viewsResult = await db
        .select({ total: sql<number>`coalesce(sum(views), 0)` })
        .from(news);

      return {
        total: totalResult[0]?.count || 0,
        featured: featuredResult[0]?.count || 0,
        totalViews: viewsResult[0]?.total || 0,
      };
    }),
});

export type NewsRouter = typeof newsRouter;
