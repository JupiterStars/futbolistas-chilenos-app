import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

// Import new routers
import { newsRouter } from "./routers/news";
import { categoriesRouter } from "./routers/categories";
import { playersRouter } from "./routers/players";
import { transfersRouter } from "./routers/transfers";
import { searchRouter } from "./routers/search";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        bio: z.string().optional(),
        avatar: z.string().optional(),
        favoriteTeam: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // ============ NEW ROUTERS (Drizzle ORM) ============
  news: newsRouter,
  categories: categoriesRouter,
  players: playersRouter,
  transfers: transfersRouter,

  // ============ LEGACY ROUTERS (para compatibilidad) ============
  
  // ============ CATEGORIES (legacy) ============
  categoriesLegacy: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories ? db.getAllCategories() : [];
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getCategoryBySlug ? db.getCategoryBySlug(input.slug) : null;
      }),
  }),

  // ============ NEWS (legacy) ============
  newsLegacy: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
        featured: z.boolean().optional(),
        premium: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return db.getNewsList ? db.getNewsList(input) : { items: [], total: 0 };
      }),
    featured: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ input }) => {
        return db.getFeaturedNews ? db.getFeaturedNews(input.limit) : [];
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getNewsById ? db.getNewsById(input.id) : null;
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getNewsBySlug ? db.getNewsBySlug(input.slug) : null;
      }),
    incrementViews: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        if (db.incrementNewsViews) await db.incrementNewsViews(input.id);
        return { success: true };
      }),
  }),

  // ============ PLAYERS (legacy) ============
  playersLegacy: router({
    list: publicProcedure
      .input(z.object({
        position: z.string().optional(),
        teamId: z.number().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
        orderBy: z.enum(['rating', 'goals', 'assists', 'name']).optional(),
      }))
      .query(async ({ input }) => {
        return db.getPlayersList ? db.getPlayersList(input) : { items: [], total: 0 };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayerById ? db.getPlayerById(input.id) : null;
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getPlayerBySlug ? db.getPlayerBySlug(input.slug) : null;
      }),
    getNews: publicProcedure
      .input(z.object({ playerId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getPlayerNews ? db.getPlayerNews(input.playerId, input.limit) : [];
      }),
  }),

  // ============ TEAMS ============
  teams: router({
    list: publicProcedure.query(async () => {
      return db.getAllTeams ? db.getAllTeams() : [];
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamById ? db.getTeamById(input.id) : null;
      }),
  }),

  // ============ LEADERBOARDS ============
  leaderboards: router({
    topScorers: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getTopScorers ? db.getTopScorers(input.limit) : [];
      }),
    topAssisters: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getTopAssisters ? db.getTopAssisters(input.limit) : [];
      }),
    topRated: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getTopRated ? db.getTopRated(input.limit) : [];
      }),
  }),

  // ============ TRANSFERS (legacy) ============
  transfersLegacy: router({
    list: publicProcedure
      .input(z.object({
        status: z.enum(['confirmed', 'rumor', 'official']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getTransfers ? db.getTransfers(input) : { items: [], total: 0 };
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTransferWithDetails ? db.getTransferWithDetails(input.id) : null;
      }),
  }),

  // ============ COMMENTS ============
  comments: router({
    getByNewsId: publicProcedure
      .input(z.object({ newsId: z.number() }))
      .query(async ({ input, ctx }) => {
        if (!db.getCommentsByNewsId) return [];
        const comments = await db.getCommentsByNewsId(input.newsId);
        
        // Get user likes if authenticated
        let userLikes: number[] = [];
        if (ctx.user && db.getUserCommentLikes) {
          const commentIds = comments.map((c: any) => c.comment.id);
          userLikes = await db.getUserCommentLikes(ctx.user.id, commentIds);
        }
        
        return comments.map((c: any) => ({
          ...c,
          isLiked: userLikes.includes(c.comment.id),
        }));
      }),
    create: protectedProcedure
      .input(z.object({
        newsId: z.number(),
        content: z.string().min(1).max(2000),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!db.createComment) throw new Error('Not implemented');
        const id = await db.createComment({
          newsId: input.newsId,
          userId: ctx.user.id,
          content: input.content,
          parentId: input.parentId,
        });
        return { success: true, id };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (db.deleteComment) await db.deleteComment(input.id, ctx.user.id);
        return { success: true };
      }),
    toggleLike: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (!db.toggleCommentLike) return { success: true, isLiked: false };
        const isLiked = await db.toggleCommentLike(input.commentId, ctx.user.id);
        return { success: true, isLiked };
      }),
  }),

  // ============ FAVORITES ============
  favorites: router({
    news: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getUserFavoriteNews ? db.getUserFavoriteNews(ctx.user.id) : [];
      }),
      toggle: protectedProcedure
        .input(z.object({ newsId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (!db.toggleFavoriteNews) return { success: true, isFavorited: false };
          const isFavorited = await db.toggleFavoriteNews(ctx.user.id, input.newsId);
          return { success: true, isFavorited };
        }),
      check: protectedProcedure
        .input(z.object({ newsId: z.number() }))
        .query(async ({ ctx, input }) => {
          return db.isNewsFavorited ? db.isNewsFavorited(ctx.user.id, input.newsId) : false;
        }),
    }),
    players: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getUserFavoritePlayers ? db.getUserFavoritePlayers(ctx.user.id) : [];
      }),
      toggle: protectedProcedure
        .input(z.object({ playerId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (!db.toggleFavoritePlayer) return { success: true, isFavorited: false };
          const isFavorited = await db.toggleFavoritePlayer(ctx.user.id, input.playerId);
          return { success: true, isFavorited };
        }),
      check: protectedProcedure
        .input(z.object({ playerId: z.number() }))
        .query(async ({ ctx, input }) => {
          return db.isPlayerFavorited ? db.isPlayerFavorited(ctx.user.id, input.playerId) : false;
        }),
    }),
  }),

  // ============ READING HISTORY ============
  history: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserReadingHistory ? db.getUserReadingHistory(ctx.user.id, input.limit) : [];
      }),
    add: protectedProcedure
      .input(z.object({ newsId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (db.addToReadingHistory) await db.addToReadingHistory(ctx.user.id, input.newsId);
        return { success: true };
      }),
  }),

  // ============ NOTIFICATIONS ============
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications ? db.getUserNotifications(ctx.user.id, input.limit) : [];
      }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount ? db.getUnreadNotificationCount(ctx.user.id) : 0;
    }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (db.markNotificationAsRead) await db.markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      if (db.markAllNotificationsAsRead) await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ SEARCH ============
  search: searchRouter,
});

export type AppRouter = typeof appRouter;
