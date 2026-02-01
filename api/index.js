// server/vercel.ts
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { eq, desc, asc, and, like, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// drizzle/schema.ts
import { pgTable, serial, text, varchar, boolean, decimal, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var feeTypeEnum = pgEnum("feeType", ["paid", "free", "loan", "undisclosed"]);
var transferStatusEnum = pgEnum("status", ["confirmed", "rumor", "official"]);
var notificationTypeEnum = pgEnum("type", ["news", "goal", "transfer", "comment_reply", "system"]);
var leaderboardTypeEnum = pgEnum("leaderboard_type", ["goals", "assists", "rating"]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  bio: text("bio"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  premiumUntil: timestamp("premiumUntil"),
  favoriteTeam: varchar("favoriteTeam", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var newsCategories = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  categoryId: integer("categoryId").notNull(),
  authorId: integer("authorId"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  views: integer("views").default(0).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("shortName", { length: 50 }),
  logo: text("logo"),
  country: varchar("country", { length: 100 }),
  league: varchar("league", { length: 200 }),
  founded: integer("founded"),
  stadium: varchar("stadium", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  imageUrl: text("imageUrl"),
  nationality: varchar("nationality", { length: 100 }).default("Chile"),
  birthDate: timestamp("birthDate"),
  age: integer("age"),
  position: varchar("position", { length: 50 }).notNull(),
  currentTeamId: integer("currentTeamId"),
  jerseyNumber: integer("jerseyNumber"),
  height: integer("height"),
  // in cm
  weight: integer("weight"),
  // in kg
  preferredFoot: varchar("preferredFoot", { length: 20 }),
  marketValue: decimal("marketValue", { precision: 15, scale: 2 }),
  // Stats
  goals: integer("goals").default(0).notNull(),
  assists: integer("assists").default(0).notNull(),
  matches: integer("matches").default(0).notNull(),
  minutesPlayed: integer("minutesPlayed").default(0).notNull(),
  yellowCards: integer("yellowCards").default(0).notNull(),
  redCards: integer("redCards").default(0).notNull(),
  // Skills (1-100)
  pace: integer("pace").default(50),
  shooting: integer("shooting").default(50),
  passing: integer("passing").default(50),
  dribbling: integer("dribbling").default(50),
  defending: integer("defending").default(50),
  physical: integer("physical").default(50),
  // Rating
  overallRating: decimal("overallRating", { precision: 3, scale: 1 }).default("50.0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var playerNews = pgTable("player_news", {
  id: serial("id").primaryKey(),
  playerId: integer("playerId").notNull(),
  newsId: integer("newsId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  playerId: integer("playerId").notNull(),
  fromTeamId: integer("fromTeamId"),
  toTeamId: integer("toTeamId"),
  fee: decimal("fee", { precision: 15, scale: 2 }),
  feeType: feeTypeEnum("feeType").default("undisclosed"),
  status: transferStatusEnum("status").default("rumor").notNull(),
  contractYears: integer("contractYears"),
  salary: decimal("salary", { precision: 15, scale: 2 }),
  announcedAt: timestamp("announcedAt"),
  completedAt: timestamp("completedAt"),
  source: text("source"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  newsId: integer("newsId").notNull(),
  userId: integer("userId").notNull(),
  parentId: integer("parentId"),
  // for nested replies
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  isEdited: boolean("isEdited").default(false).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("commentId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var favoriteNews = pgTable("favorite_news", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  newsId: integer("newsId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var favoritePlayers = pgTable("favorite_players", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  playerId: integer("playerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var readingHistory = pgTable("reading_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  newsId: integer("newsId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull()
});
var notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: serial("id").primaryKey(),
  type: leaderboardTypeEnum("type").notNull(),
  playerId: integer("playerId").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  rank: integer("rank").notNull(),
  season: varchar("season", { length: 20 }).notNull(),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
var _client = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL);
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _client = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod", "avatar", "bio", "favoriteTeam"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (existingUser.length > 0) {
      await db.update(users).set(updateSet).where(eq(users.openId, user.openId));
    } else {
      await db.insert(users).values(values);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function updateUserProfile(userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}
async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsCategories).orderBy(asc(newsCategories.name));
}
async function getCategoryBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(newsCategories).where(eq(newsCategories.slug, slug)).limit(1);
  return result[0];
}
async function getNewsList(options) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select({
    news,
    category: newsCategories
  }).from(news).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).orderBy(desc(news.publishedAt)).$dynamic();
  const conditions = [];
  if (options.categoryId) {
    conditions.push(eq(news.categoryId, options.categoryId));
  }
  if (options.featured !== void 0) {
    conditions.push(eq(news.isFeatured, options.featured));
  }
  if (options.premium !== void 0) {
    conditions.push(eq(news.isPremium, options.premium));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.offset(options.offset);
  }
  return query;
}
async function getFeaturedNews(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    news,
    category: newsCategories
  }).from(news).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(eq(news.isFeatured, true)).orderBy(desc(news.publishedAt)).limit(limit);
}
async function getNewsById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select({
    news,
    category: newsCategories
  }).from(news).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(eq(news.id, id)).limit(1);
  return result[0];
}
async function getNewsBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select({
    news,
    category: newsCategories
  }).from(news).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(eq(news.slug, slug)).limit(1);
  return result[0];
}
async function incrementNewsViews(id) {
  const db = await getDb();
  if (!db) return;
  await db.update(news).set({ views: sql`${news.views} + 1` }).where(eq(news.id, id));
}
async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).orderBy(asc(teams.name));
}
async function getTeamById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0];
}
async function getPlayersList(options) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select({
    player: players,
    team: teams
  }).from(players).leftJoin(teams, eq(players.currentTeamId, teams.id)).$dynamic();
  const conditions = [];
  if (options.position) {
    conditions.push(eq(players.position, options.position));
  }
  if (options.teamId) {
    conditions.push(eq(players.currentTeamId, options.teamId));
  }
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  if (options.orderBy === "goals") {
    query = query.orderBy(desc(players.goals));
  } else if (options.orderBy === "assists") {
    query = query.orderBy(desc(players.assists));
  } else if (options.orderBy === "name") {
    query = query.orderBy(asc(players.name));
  } else {
    query = query.orderBy(desc(players.overallRating));
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.offset(options.offset);
  }
  return query;
}
async function getPlayerById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select({
    player: players,
    team: teams
  }).from(players).leftJoin(teams, eq(players.currentTeamId, teams.id)).where(eq(players.id, id)).limit(1);
  return result[0];
}
async function getPlayerBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select({
    player: players,
    team: teams
  }).from(players).leftJoin(teams, eq(players.currentTeamId, teams.id)).where(eq(players.slug, slug)).limit(1);
  return result[0];
}
async function getTopScorers(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    player: players,
    team: teams
  }).from(players).leftJoin(teams, eq(players.currentTeamId, teams.id)).orderBy(desc(players.goals)).limit(limit);
}
async function getTopAssisters(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    player: players,
    team: teams
  }).from(players).leftJoin(teams, eq(players.currentTeamId, teams.id)).orderBy(desc(players.assists)).limit(limit);
}
async function getTopRated(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    player: players,
    team: teams
  }).from(players).leftJoin(teams, eq(players.currentTeamId, teams.id)).orderBy(desc(players.overallRating)).limit(limit);
}
async function getTransfers(options) {
  const db = await getDb();
  if (!db) return [];
  let query = db.select().from(transfers).orderBy(desc(transfers.createdAt)).$dynamic();
  if (options.status) {
    query = query.where(eq(transfers.status, options.status));
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }
  if (options.offset) {
    query = query.offset(options.offset);
  }
  return query;
}
async function getTransferWithDetails(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(transfers).where(eq(transfers.id, id)).limit(1);
  if (!result[0]) return void 0;
  const transfer = result[0];
  const player = transfer.playerId ? await getPlayerById(transfer.playerId) : void 0;
  const fromTeam = transfer.fromTeamId ? await getTeamById(transfer.fromTeamId) : void 0;
  const toTeam = transfer.toTeamId ? await getTeamById(transfer.toTeamId) : void 0;
  return { transfer, player, fromTeam, toTeam };
}
async function getCommentsByNewsId(newsId) {
  const db = await getDb();
  if (!db) return [];
  const result = await db.select({
    comment: comments,
    user: {
      id: users.id,
      name: users.name,
      avatar: users.avatar
    }
  }).from(comments).leftJoin(users, eq(comments.userId, users.id)).where(and(eq(comments.newsId, newsId), eq(comments.isDeleted, false))).orderBy(desc(comments.createdAt));
  return result;
}
async function createComment(data) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(comments).values(data).returning();
  return result[0]?.id;
}
async function deleteComment(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(comments).set({ isDeleted: true }).where(and(eq(comments.id, id), eq(comments.userId, userId)));
}
async function toggleCommentLike(commentId, userId) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(commentLikes).where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId))).limit(1);
  if (existing.length > 0) {
    await db.delete(commentLikes).where(eq(commentLikes.id, existing[0].id));
    await db.update(comments).set({ likes: sql`${comments.likes} - 1` }).where(eq(comments.id, commentId));
    return false;
  } else {
    await db.insert(commentLikes).values({ commentId, userId });
    await db.update(comments).set({ likes: sql`${comments.likes} + 1` }).where(eq(comments.id, commentId));
    return true;
  }
}
async function getUserCommentLikes(userId, commentIds) {
  const db = await getDb();
  if (!db || commentIds.length === 0) return [];
  const result = await db.select({ commentId: commentLikes.commentId }).from(commentLikes).where(and(eq(commentLikes.userId, userId), inArray(commentLikes.commentId, commentIds)));
  return result.map((r) => r.commentId);
}
async function getUserFavoriteNews(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    favorite: favoriteNews,
    news,
    category: newsCategories
  }).from(favoriteNews).innerJoin(news, eq(favoriteNews.newsId, news.id)).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(eq(favoriteNews.userId, userId)).orderBy(desc(favoriteNews.createdAt));
}
async function toggleFavoriteNews(userId, newsId) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(favoriteNews).where(and(eq(favoriteNews.userId, userId), eq(favoriteNews.newsId, newsId))).limit(1);
  if (existing.length > 0) {
    await db.delete(favoriteNews).where(eq(favoriteNews.id, existing[0].id));
    return false;
  } else {
    await db.insert(favoriteNews).values({ userId, newsId });
    return true;
  }
}
async function isNewsFavorited(userId, newsId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(favoriteNews).where(and(eq(favoriteNews.userId, userId), eq(favoriteNews.newsId, newsId))).limit(1);
  return result.length > 0;
}
async function getUserFavoritePlayers(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    favorite: favoritePlayers,
    player: players,
    team: teams
  }).from(favoritePlayers).innerJoin(players, eq(favoritePlayers.playerId, players.id)).leftJoin(teams, eq(players.currentTeamId, teams.id)).where(eq(favoritePlayers.userId, userId)).orderBy(desc(favoritePlayers.createdAt));
}
async function toggleFavoritePlayer(userId, playerId) {
  const db = await getDb();
  if (!db) return false;
  const existing = await db.select().from(favoritePlayers).where(and(eq(favoritePlayers.userId, userId), eq(favoritePlayers.playerId, playerId))).limit(1);
  if (existing.length > 0) {
    await db.delete(favoritePlayers).where(eq(favoritePlayers.id, existing[0].id));
    return false;
  } else {
    await db.insert(favoritePlayers).values({ userId, playerId });
    return true;
  }
}
async function isPlayerFavorited(userId, playerId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(favoritePlayers).where(and(eq(favoritePlayers.userId, userId), eq(favoritePlayers.playerId, playerId))).limit(1);
  return result.length > 0;
}
async function addToReadingHistory(userId, newsId) {
  const db = await getDb();
  if (!db) return;
  await db.insert(readingHistory).values({ userId, newsId });
}
async function getUserReadingHistory(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    history: readingHistory,
    news,
    category: newsCategories
  }).from(readingHistory).innerJoin(news, eq(readingHistory.newsId, news.id)).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(eq(readingHistory.userId, userId)).orderBy(desc(readingHistory.readAt)).limit(limit);
}
async function getUserNotifications(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}
async function markNotificationAsRead(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}
async function markAllNotificationsAsRead(userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, userId));
}
async function getUnreadNotificationCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  return result[0]?.count ?? 0;
}
async function searchAll(query, limit = 10) {
  const db = await getDb();
  if (!db) return { news: [], players: [], teams: [] };
  const searchTerm = `%${query}%`;
  const newsResults = await db.select({
    news,
    category: newsCategories
  }).from(news).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(or(
    like(news.title, searchTerm),
    like(news.excerpt, searchTerm)
  )).orderBy(desc(news.publishedAt)).limit(limit);
  const playerResults = await db.select({
    player: players,
    team: teams
  }).from(players).leftJoin(teams, eq(players.currentTeamId, teams.id)).where(like(players.name, searchTerm)).orderBy(desc(players.overallRating)).limit(limit);
  const teamResults = await db.select().from(teams).where(or(
    like(teams.name, searchTerm),
    like(teams.shortName, searchTerm)
  )).limit(limit);
  return { news: newsResults, players: playerResults, teams: teamResults };
}
async function getPlayerNews(playerId, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    news,
    category: newsCategories
  }).from(playerNews).innerJoin(news, eq(playerNews.newsId, news.id)).leftJoin(newsCategories, eq(news.categoryId, newsCategories.id)).where(eq(playerNews.playerId, playerId)).orderBy(desc(news.publishedAt)).limit(limit);
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    }),
    updateProfile: protectedProcedure.input(z2.object({
      name: z2.string().optional(),
      bio: z2.string().optional(),
      avatar: z2.string().optional(),
      favoriteTeam: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, input);
      return { success: true };
    })
  }),
  // ============ CATEGORIES ============
  categories: router({
    list: publicProcedure.query(async () => {
      return getAllCategories();
    }),
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      return getCategoryBySlug(input.slug);
    })
  }),
  // ============ NEWS ============
  news: router({
    list: publicProcedure.input(z2.object({
      categoryId: z2.number().optional(),
      limit: z2.number().default(20),
      offset: z2.number().default(0),
      featured: z2.boolean().optional(),
      premium: z2.boolean().optional()
    })).query(async ({ input }) => {
      return getNewsList(input);
    }),
    featured: publicProcedure.input(z2.object({ limit: z2.number().default(5) })).query(async ({ input }) => {
      return getFeaturedNews(input.limit);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getNewsById(input.id);
    }),
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      return getNewsBySlug(input.slug);
    }),
    incrementViews: publicProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ input }) => {
      await incrementNewsViews(input.id);
      return { success: true };
    })
  }),
  // ============ PLAYERS ============
  players: router({
    list: publicProcedure.input(z2.object({
      position: z2.string().optional(),
      teamId: z2.number().optional(),
      limit: z2.number().default(20),
      offset: z2.number().default(0),
      orderBy: z2.enum(["rating", "goals", "assists", "name"]).optional()
    })).query(async ({ input }) => {
      return getPlayersList(input);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getPlayerById(input.id);
    }),
    getBySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(async ({ input }) => {
      return getPlayerBySlug(input.slug);
    }),
    getNews: publicProcedure.input(z2.object({ playerId: z2.number(), limit: z2.number().default(10) })).query(async ({ input }) => {
      return getPlayerNews(input.playerId, input.limit);
    })
  }),
  // ============ TEAMS ============
  teams: router({
    list: publicProcedure.query(async () => {
      return getAllTeams();
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getTeamById(input.id);
    })
  }),
  // ============ LEADERBOARDS ============
  leaderboards: router({
    topScorers: publicProcedure.input(z2.object({ limit: z2.number().default(10) })).query(async ({ input }) => {
      return getTopScorers(input.limit);
    }),
    topAssisters: publicProcedure.input(z2.object({ limit: z2.number().default(10) })).query(async ({ input }) => {
      return getTopAssisters(input.limit);
    }),
    topRated: publicProcedure.input(z2.object({ limit: z2.number().default(10) })).query(async ({ input }) => {
      return getTopRated(input.limit);
    })
  }),
  // ============ TRANSFERS ============
  transfers: router({
    list: publicProcedure.input(z2.object({
      status: z2.enum(["confirmed", "rumor", "official"]).optional(),
      limit: z2.number().default(20),
      offset: z2.number().default(0)
    })).query(async ({ input }) => {
      return getTransfers(input);
    }),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
      return getTransferWithDetails(input.id);
    })
  }),
  // ============ COMMENTS ============
  comments: router({
    getByNewsId: publicProcedure.input(z2.object({ newsId: z2.number() })).query(async ({ input, ctx }) => {
      const comments2 = await getCommentsByNewsId(input.newsId);
      let userLikes = [];
      if (ctx.user) {
        const commentIds = comments2.map((c) => c.comment.id);
        userLikes = await getUserCommentLikes(ctx.user.id, commentIds);
      }
      return comments2.map((c) => ({
        ...c,
        isLiked: userLikes.includes(c.comment.id)
      }));
    }),
    create: protectedProcedure.input(z2.object({
      newsId: z2.number(),
      content: z2.string().min(1).max(2e3),
      parentId: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      const id = await createComment({
        newsId: input.newsId,
        userId: ctx.user.id,
        content: input.content,
        parentId: input.parentId
      });
      return { success: true, id };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await deleteComment(input.id, ctx.user.id);
      return { success: true };
    }),
    toggleLike: protectedProcedure.input(z2.object({ commentId: z2.number() })).mutation(async ({ ctx, input }) => {
      const isLiked = await toggleCommentLike(input.commentId, ctx.user.id);
      return { success: true, isLiked };
    })
  }),
  // ============ FAVORITES ============
  favorites: router({
    news: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return getUserFavoriteNews(ctx.user.id);
      }),
      toggle: protectedProcedure.input(z2.object({ newsId: z2.number() })).mutation(async ({ ctx, input }) => {
        const isFavorited = await toggleFavoriteNews(ctx.user.id, input.newsId);
        return { success: true, isFavorited };
      }),
      check: protectedProcedure.input(z2.object({ newsId: z2.number() })).query(async ({ ctx, input }) => {
        return isNewsFavorited(ctx.user.id, input.newsId);
      })
    }),
    players: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return getUserFavoritePlayers(ctx.user.id);
      }),
      toggle: protectedProcedure.input(z2.object({ playerId: z2.number() })).mutation(async ({ ctx, input }) => {
        const isFavorited = await toggleFavoritePlayer(ctx.user.id, input.playerId);
        return { success: true, isFavorited };
      }),
      check: protectedProcedure.input(z2.object({ playerId: z2.number() })).query(async ({ ctx, input }) => {
        return isPlayerFavorited(ctx.user.id, input.playerId);
      })
    })
  }),
  // ============ READING HISTORY ============
  history: router({
    list: protectedProcedure.input(z2.object({ limit: z2.number().default(20) })).query(async ({ ctx, input }) => {
      return getUserReadingHistory(ctx.user.id, input.limit);
    }),
    add: protectedProcedure.input(z2.object({ newsId: z2.number() })).mutation(async ({ ctx, input }) => {
      await addToReadingHistory(ctx.user.id, input.newsId);
      return { success: true };
    })
  }),
  // ============ NOTIFICATIONS ============
  notifications: router({
    list: protectedProcedure.input(z2.object({ limit: z2.number().default(20) })).query(async ({ ctx, input }) => {
      return getUserNotifications(ctx.user.id, input.limit);
    }),
    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      await markNotificationAsRead(input.id, ctx.user.id);
      return { success: true };
    }),
    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    })
  }),
  // ============ SEARCH ============
  search: router({
    all: publicProcedure.input(z2.object({ query: z2.string().min(1), limit: z2.number().default(10) })).query(async ({ input }) => {
      return searchAll(input.query, input.limit);
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/vercel.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Vercel API is alive" });
});
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var vercel_default = app;
export {
  vercel_default as default
};
