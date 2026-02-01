import { pgTable, serial, text, varchar, boolean, decimal, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";

// ============ ENUMS ============
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const feeTypeEnum = pgEnum("feeType", ["paid", "free", "loan", "undisclosed"]);
export const transferStatusEnum = pgEnum("status", ["confirmed", "rumor", "official"]);
export const notificationTypeEnum = pgEnum("type", ["news", "goal", "transfer", "comment_reply", "system"]);
export const leaderboardTypeEnum = pgEnum("leaderboard_type", ["goals", "assists", "rating"]);

// ============ USERS ============
export const users = pgTable("users", {
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
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============ NEWS CATEGORIES ============
export const newsCategories = pgTable("news_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsCategory = typeof newsCategories.$inferSelect;
export type InsertNewsCategory = typeof newsCategories.$inferInsert;

// ============ NEWS ============
export const news = pgTable("news", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

// ============ TEAMS ============
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("shortName", { length: 50 }),
  logo: text("logo"),
  country: varchar("country", { length: 100 }),
  league: varchar("league", { length: 200 }),
  founded: integer("founded"),
  stadium: varchar("stadium", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// ============ PLAYERS ============
export const players = pgTable("players", {
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
  height: integer("height"), // in cm
  weight: integer("weight"), // in kg
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

// ============ PLAYER NEWS (relation) ============
export const playerNews = pgTable("player_news", {
  id: serial("id").primaryKey(),
  playerId: integer("playerId").notNull(),
  newsId: integer("newsId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlayerNews = typeof playerNews.$inferSelect;
export type InsertPlayerNews = typeof playerNews.$inferInsert;

// ============ TRANSFERS ============
export const transfers = pgTable("transfers", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = typeof transfers.$inferInsert;

// ============ COMMENTS ============
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  newsId: integer("newsId").notNull(),
  userId: integer("userId").notNull(),
  parentId: integer("parentId"), // for nested replies
  content: text("content").notNull(),
  likes: integer("likes").default(0).notNull(),
  isEdited: boolean("isEdited").default(false).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// ============ COMMENT LIKES ============
export const commentLikes = pgTable("comment_likes", {
  id: serial("id").primaryKey(),
  commentId: integer("commentId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

// ============ FAVORITES (News) ============
export const favoriteNews = pgTable("favorite_news", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  newsId: integer("newsId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FavoriteNews = typeof favoriteNews.$inferSelect;
export type InsertFavoriteNews = typeof favoriteNews.$inferInsert;

// ============ FAVORITES (Players) ============
export const favoritePlayers = pgTable("favorite_players", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  playerId: integer("playerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FavoritePlayer = typeof favoritePlayers.$inferSelect;
export type InsertFavoritePlayer = typeof favoritePlayers.$inferInsert;

// ============ READING HISTORY ============
export const readingHistory = pgTable("reading_history", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  newsId: integer("newsId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertReadingHistory = typeof readingHistory.$inferInsert;

// ============ NOTIFICATIONS ============
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============ LEADERBOARD SNAPSHOTS ============
export const leaderboardSnapshots = pgTable("leaderboard_snapshots", {
  id: serial("id").primaryKey(),
  type: leaderboardTypeEnum("type").notNull(),
  playerId: integer("playerId").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  rank: integer("rank").notNull(),
  season: varchar("season", { length: 20 }).notNull(),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
});

export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type InsertLeaderboardSnapshot = typeof leaderboardSnapshots.$inferInsert;
