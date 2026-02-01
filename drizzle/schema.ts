import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal, json } from "drizzle-orm/mysql-core";

// ============ USERS ============
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  bio: text("bio"),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  premiumUntil: timestamp("premiumUntil"),
  favoriteTeam: varchar("favoriteTeam", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============ NEWS CATEGORIES ============
export const newsCategories = mysqlTable("news_categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description"),
  color: varchar("color", { length: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsCategory = typeof newsCategories.$inferSelect;
export type InsertNewsCategory = typeof newsCategories.$inferInsert;

// ============ NEWS ============
export const news = mysqlTable("news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 500 }).notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  imageUrl: text("imageUrl"),
  categoryId: int("categoryId").notNull(),
  authorId: int("authorId"),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  views: int("views").default(0).notNull(),
  publishedAt: timestamp("publishedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type News = typeof news.$inferSelect;
export type InsertNews = typeof news.$inferInsert;

// ============ TEAMS ============
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  shortName: varchar("shortName", { length: 50 }),
  logo: text("logo"),
  country: varchar("country", { length: 100 }),
  league: varchar("league", { length: 200 }),
  founded: int("founded"),
  stadium: varchar("stadium", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// ============ PLAYERS ============
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  imageUrl: text("imageUrl"),
  nationality: varchar("nationality", { length: 100 }).default("Chile"),
  birthDate: timestamp("birthDate"),
  age: int("age"),
  position: varchar("position", { length: 50 }).notNull(),
  currentTeamId: int("currentTeamId"),
  jerseyNumber: int("jerseyNumber"),
  height: int("height"), // in cm
  weight: int("weight"), // in kg
  preferredFoot: varchar("preferredFoot", { length: 20 }),
  marketValue: decimal("marketValue", { precision: 15, scale: 2 }),
  // Stats
  goals: int("goals").default(0).notNull(),
  assists: int("assists").default(0).notNull(),
  matches: int("matches").default(0).notNull(),
  minutesPlayed: int("minutesPlayed").default(0).notNull(),
  yellowCards: int("yellowCards").default(0).notNull(),
  redCards: int("redCards").default(0).notNull(),
  // Skills (1-100)
  pace: int("pace").default(50),
  shooting: int("shooting").default(50),
  passing: int("passing").default(50),
  dribbling: int("dribbling").default(50),
  defending: int("defending").default(50),
  physical: int("physical").default(50),
  // Rating
  overallRating: decimal("overallRating", { precision: 3, scale: 1 }).default("50.0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

// ============ PLAYER NEWS (relation) ============
export const playerNews = mysqlTable("player_news", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull(),
  newsId: int("newsId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlayerNews = typeof playerNews.$inferSelect;
export type InsertPlayerNews = typeof playerNews.$inferInsert;

// ============ TRANSFERS ============
export const transfers = mysqlTable("transfers", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull(),
  fromTeamId: int("fromTeamId"),
  toTeamId: int("toTeamId"),
  fee: decimal("fee", { precision: 15, scale: 2 }),
  feeType: mysqlEnum("feeType", ["paid", "free", "loan", "undisclosed"]).default("undisclosed"),
  status: mysqlEnum("status", ["confirmed", "rumor", "official"]).default("rumor").notNull(),
  contractYears: int("contractYears"),
  salary: decimal("salary", { precision: 15, scale: 2 }),
  announcedAt: timestamp("announcedAt"),
  completedAt: timestamp("completedAt"),
  source: text("source"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = typeof transfers.$inferInsert;

// ============ COMMENTS ============
export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  newsId: int("newsId").notNull(),
  userId: int("userId").notNull(),
  parentId: int("parentId"), // for nested replies
  content: text("content").notNull(),
  likes: int("likes").default(0).notNull(),
  isEdited: boolean("isEdited").default(false).notNull(),
  isDeleted: boolean("isDeleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

// ============ COMMENT LIKES ============
export const commentLikes = mysqlTable("comment_likes", {
  id: int("id").autoincrement().primaryKey(),
  commentId: int("commentId").notNull(),
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

// ============ FAVORITES (News) ============
export const favoriteNews = mysqlTable("favorite_news", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  newsId: int("newsId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FavoriteNews = typeof favoriteNews.$inferSelect;
export type InsertFavoriteNews = typeof favoriteNews.$inferInsert;

// ============ FAVORITES (Players) ============
export const favoritePlayers = mysqlTable("favorite_players", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  playerId: int("playerId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FavoritePlayer = typeof favoritePlayers.$inferSelect;
export type InsertFavoritePlayer = typeof favoritePlayers.$inferInsert;

// ============ READING HISTORY ============
export const readingHistory = mysqlTable("reading_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  newsId: int("newsId").notNull(),
  readAt: timestamp("readAt").defaultNow().notNull(),
});

export type ReadingHistory = typeof readingHistory.$inferSelect;
export type InsertReadingHistory = typeof readingHistory.$inferInsert;

// ============ NOTIFICATIONS ============
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["news", "goal", "transfer", "comment_reply", "system"]).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// ============ LEADERBOARD SNAPSHOTS ============
export const leaderboardSnapshots = mysqlTable("leaderboard_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["goals", "assists", "rating"]).notNull(),
  playerId: int("playerId").notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  rank: int("rank").notNull(),
  season: varchar("season", { length: 20 }).notNull(),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
});

export type LeaderboardSnapshot = typeof leaderboardSnapshots.$inferSelect;
export type InsertLeaderboardSnapshot = typeof leaderboardSnapshots.$inferInsert;
