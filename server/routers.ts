import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

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

  // ============ CATEGORIES ============
  categories: router({
    list: publicProcedure.query(async () => {
      return db.getAllCategories();
    }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getCategoryBySlug(input.slug);
      }),
  }),

  // ============ NEWS ============
  news: router({
    list: publicProcedure
      .input(z.object({
        categoryId: z.number().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
        featured: z.boolean().optional(),
        premium: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return db.getNewsList(input);
      }),
    featured: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(async ({ input }) => {
        return db.getFeaturedNews(input.limit);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getNewsById(input.id);
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getNewsBySlug(input.slug);
      }),
    incrementViews: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementNewsViews(input.id);
        return { success: true };
      }),
  }),

  // ============ PLAYERS ============
  players: router({
    list: publicProcedure
      .input(z.object({
        position: z.string().optional(),
        teamId: z.number().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
        orderBy: z.enum(['rating', 'goals', 'assists', 'name']).optional(),
      }))
      .query(async ({ input }) => {
        return db.getPlayersList(input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getPlayerById(input.id);
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return db.getPlayerBySlug(input.slug);
      }),
    getNews: publicProcedure
      .input(z.object({ playerId: z.number(), limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getPlayerNews(input.playerId, input.limit);
      }),
  }),

  // ============ TEAMS ============
  teams: router({
    list: publicProcedure.query(async () => {
      return db.getAllTeams();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamById(input.id);
      }),
  }),

  // ============ LEADERBOARDS ============
  leaderboards: router({
    topScorers: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getTopScorers(input.limit);
      }),
    topAssisters: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getTopAssisters(input.limit);
      }),
    topRated: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getTopRated(input.limit);
      }),
  }),

  // ============ TRANSFERS ============
  transfers: router({
    list: publicProcedure
      .input(z.object({
        status: z.enum(['confirmed', 'rumor', 'official']).optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return db.getTransfers(input);
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getTransferWithDetails(input.id);
      }),
  }),

  // ============ COMMENTS ============
  comments: router({
    getByNewsId: publicProcedure
      .input(z.object({ newsId: z.number() }))
      .query(async ({ input, ctx }) => {
        const comments = await db.getCommentsByNewsId(input.newsId);
        
        // Get user likes if authenticated
        let userLikes: number[] = [];
        if (ctx.user) {
          const commentIds = comments.map(c => c.comment.id);
          userLikes = await db.getUserCommentLikes(ctx.user.id, commentIds);
        }
        
        return comments.map(c => ({
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
        await db.deleteComment(input.id, ctx.user.id);
        return { success: true };
      }),
    toggleLike: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const isLiked = await db.toggleCommentLike(input.commentId, ctx.user.id);
        return { success: true, isLiked };
      }),
  }),

  // ============ FAVORITES ============
  favorites: router({
    news: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getUserFavoriteNews(ctx.user.id);
      }),
      toggle: protectedProcedure
        .input(z.object({ newsId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const isFavorited = await db.toggleFavoriteNews(ctx.user.id, input.newsId);
          return { success: true, isFavorited };
        }),
      check: protectedProcedure
        .input(z.object({ newsId: z.number() }))
        .query(async ({ ctx, input }) => {
          return db.isNewsFavorited(ctx.user.id, input.newsId);
        }),
    }),
    players: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getUserFavoritePlayers(ctx.user.id);
      }),
      toggle: protectedProcedure
        .input(z.object({ playerId: z.number() }))
        .mutation(async ({ ctx, input }) => {
          const isFavorited = await db.toggleFavoritePlayer(ctx.user.id, input.playerId);
          return { success: true, isFavorited };
        }),
      check: protectedProcedure
        .input(z.object({ playerId: z.number() }))
        .query(async ({ ctx, input }) => {
          return db.isPlayerFavorited(ctx.user.id, input.playerId);
        }),
    }),
  }),

  // ============ READING HISTORY ============
  history: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserReadingHistory(ctx.user.id, input.limit);
      }),
    add: protectedProcedure
      .input(z.object({ newsId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.addToReadingHistory(ctx.user.id, input.newsId);
        return { success: true };
      }),
  }),

  // ============ NOTIFICATIONS ============
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input.limit);
      }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.markNotificationAsRead(input.id, ctx.user.id);
        return { success: true };
      }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),
  }),

  // ============ SEARCH ============
  search: router({
    all: publicProcedure
      .input(z.object({ query: z.string().min(1), limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.searchAll(input.query, input.limit);
      }),
  }),
});

export type AppRouter = typeof appRouter;
