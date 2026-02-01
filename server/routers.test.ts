import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock database functions with all required exports
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getAllCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Últimas Noticias", slug: "ultimas-noticias", description: null, color: "#E30613", createdAt: new Date() }
  ]),
  getCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Últimas Noticias", slug: "ultimas-noticias", description: null, color: "#E30613", createdAt: new Date() }
  ]),
  getNewsList: vi.fn().mockResolvedValue([]),
  getFeaturedNews: vi.fn().mockResolvedValue([]),
  getNewsBySlug: vi.fn().mockResolvedValue(null),
  getPlayersList: vi.fn().mockResolvedValue([]),
  getPlayerBySlug: vi.fn().mockResolvedValue(null),
  getTopScorers: vi.fn().mockResolvedValue([]),
  getTopAssisters: vi.fn().mockResolvedValue([]),
  getTopRated: vi.fn().mockResolvedValue([]),
  getTransfers: vi.fn().mockResolvedValue([]),
  getTransferById: vi.fn().mockResolvedValue(null),
  searchAll: vi.fn().mockResolvedValue({ news: [], players: [], teams: [] }),
  getTeams: vi.fn().mockResolvedValue([]),
  getCommentsByNewsId: vi.fn().mockResolvedValue([]),
  createComment: vi.fn().mockResolvedValue({ id: 1 }),
  toggleCommentLike: vi.fn().mockResolvedValue(true),
  getUserFavoriteNews: vi.fn().mockResolvedValue([]),
  toggleFavoriteNews: vi.fn().mockResolvedValue(true),
  getUserFavoritePlayers: vi.fn().mockResolvedValue([]),
  toggleFavoritePlayer: vi.fn().mockResolvedValue(true),
  getUserReadingHistory: vi.fn().mockResolvedValue([]),
  addReadingHistory: vi.fn().mockResolvedValue({ id: 1 }),
  incrementNewsViews: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(null),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAuthenticatedContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("appRouter", () => {
  describe("auth.me", () => {
    it("returns null for unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.auth.me();
      
      expect(result).toBeNull();
    });

    it("returns user data for authenticated users", async () => {
      const ctx = createAuthenticatedContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.auth.me();
      
      expect(result).not.toBeNull();
      expect(result?.name).toBe("Test User");
      expect(result?.email).toBe("test@example.com");
    });
  });

  describe("auth.logout", () => {
    it("clears session cookie and returns success", async () => {
      const ctx = createAuthenticatedContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.auth.logout();
      
      expect(result).toEqual({ success: true });
      expect(ctx.res.clearCookie).toHaveBeenCalled();
    });
  });

  describe("categories.list", () => {
    it("returns list of categories", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.categories.list();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("news.list", () => {
    it("returns list of news articles", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.news.list({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("news.featured", () => {
    it("returns featured news articles", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.news.featured({ limit: 5 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("players.list", () => {
    it("returns list of players", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.players.list({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("leaderboards", () => {
    it("returns top scorers", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.leaderboards.topScorers({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns top assisters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.leaderboards.topAssisters({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("returns top rated players", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.leaderboards.topRated({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("transfers.list", () => {
    it("returns list of transfers", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.transfers.list({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("search.all", () => {
    it("returns search results", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.search.all({ query: "test", limit: 10 });
      
      expect(result).toHaveProperty("news");
      expect(result).toHaveProperty("players");
      expect(result).toHaveProperty("teams");
    });
  });
});
