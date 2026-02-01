import { eq, desc, asc, and, like, or, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  news, InsertNews, News,
  newsCategories, InsertNewsCategory, NewsCategory,
  players, InsertPlayer, Player,
  teams, InsertTeam, Team,
  transfers, InsertTransfer, Transfer,
  comments, InsertComment, Comment,
  commentLikes, InsertCommentLike,
  favoriteNews, InsertFavoriteNews,
  favoritePlayers, InsertFavoritePlayer,
  readingHistory, InsertReadingHistory,
  notifications, InsertNotification,
  leaderboardSnapshots, InsertLeaderboardSnapshot,
  playerNews, InsertPlayerNews
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER FUNCTIONS ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "avatar", "bio", "favoriteTeam"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; avatar?: string; favoriteTeam?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ============ NEWS CATEGORY FUNCTIONS ============
export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(newsCategories).orderBy(asc(newsCategories.name));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(newsCategories).where(eq(newsCategories.slug, slug)).limit(1);
  return result[0];
}

export async function createCategory(data: InsertNewsCategory) {
  const db = await getDb();
  if (!db) return;
  await db.insert(newsCategories).values(data);
}

// ============ NEWS FUNCTIONS ============
export async function getNewsList(options: { 
  categoryId?: number; 
  limit?: number; 
  offset?: number;
  featured?: boolean;
  premium?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    news: news,
    category: newsCategories,
  }).from(news)
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .orderBy(desc(news.publishedAt))
    .$dynamic();

  const conditions = [];
  if (options.categoryId) {
    conditions.push(eq(news.categoryId, options.categoryId));
  }
  if (options.featured !== undefined) {
    conditions.push(eq(news.isFeatured, options.featured));
  }
  if (options.premium !== undefined) {
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

export async function getFeaturedNews(limit = 5) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    news: news,
    category: newsCategories,
  }).from(news)
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(eq(news.isFeatured, true))
    .orderBy(desc(news.publishedAt))
    .limit(limit);
}

export async function getNewsById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    news: news,
    category: newsCategories,
  }).from(news)
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(eq(news.id, id))
    .limit(1);
  return result[0];
}

export async function getNewsBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    news: news,
    category: newsCategories,
  }).from(news)
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(eq(news.slug, slug))
    .limit(1);
  return result[0];
}

export async function createNews(data: InsertNews) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(news).values(data);
  return result[0].insertId;
}

export async function incrementNewsViews(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(news).set({ views: sql`${news.views} + 1` }).where(eq(news.id, id));
}

// ============ TEAM FUNCTIONS ============
export async function getAllTeams() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).orderBy(asc(teams.name));
}

export async function getTeamById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teams).where(eq(teams.id, id)).limit(1);
  return result[0];
}

export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) return;
  await db.insert(teams).values(data);
}

// ============ PLAYER FUNCTIONS ============
export async function getPlayersList(options: { 
  position?: string; 
  teamId?: number;
  limit?: number; 
  offset?: number;
  orderBy?: 'rating' | 'goals' | 'assists' | 'name';
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select({
    player: players,
    team: teams,
  }).from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .$dynamic();

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

  // Order by
  if (options.orderBy === 'goals') {
    query = query.orderBy(desc(players.goals));
  } else if (options.orderBy === 'assists') {
    query = query.orderBy(desc(players.assists));
  } else if (options.orderBy === 'name') {
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

export async function getPlayerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    player: players,
    team: teams,
  }).from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .where(eq(players.id, id))
    .limit(1);
  return result[0];
}

export async function getPlayerBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select({
    player: players,
    team: teams,
  }).from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .where(eq(players.slug, slug))
    .limit(1);
  return result[0];
}

export async function createPlayer(data: InsertPlayer) {
  const db = await getDb();
  if (!db) return;
  await db.insert(players).values(data);
}

// ============ LEADERBOARD FUNCTIONS ============
export async function getTopScorers(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    player: players,
    team: teams,
  }).from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .orderBy(desc(players.goals))
    .limit(limit);
}

export async function getTopAssisters(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    player: players,
    team: teams,
  }).from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .orderBy(desc(players.assists))
    .limit(limit);
}

export async function getTopRated(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    player: players,
    team: teams,
  }).from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .orderBy(desc(players.overallRating))
    .limit(limit);
}

// ============ TRANSFER FUNCTIONS ============
export async function getTransfers(options: { status?: 'confirmed' | 'rumor' | 'official'; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(transfers)
    .orderBy(desc(transfers.createdAt))
    .$dynamic();

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

export async function getTransferWithDetails(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(transfers).where(eq(transfers.id, id)).limit(1);
  if (!result[0]) return undefined;
  
  const transfer = result[0];
  const player = transfer.playerId ? await getPlayerById(transfer.playerId) : undefined;
  const fromTeam = transfer.fromTeamId ? await getTeamById(transfer.fromTeamId) : undefined;
  const toTeam = transfer.toTeamId ? await getTeamById(transfer.toTeamId) : undefined;
  
  return { transfer, player, fromTeam, toTeam };
}

export async function createTransfer(data: InsertTransfer) {
  const db = await getDb();
  if (!db) return;
  await db.insert(transfers).values(data);
}

// ============ COMMENT FUNCTIONS ============
export async function getCommentsByNewsId(newsId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    comment: comments,
    user: {
      id: users.id,
      name: users.name,
      avatar: users.avatar,
    }
  }).from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.newsId, newsId), eq(comments.isDeleted, false)))
    .orderBy(desc(comments.createdAt));
  
  return result;
}

export async function createComment(data: InsertComment) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(comments).values(data);
  return result[0].insertId;
}

export async function deleteComment(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(comments)
    .set({ isDeleted: true })
    .where(and(eq(comments.id, id), eq(comments.userId, userId)));
}

export async function toggleCommentLike(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await db.select().from(commentLikes)
    .where(and(eq(commentLikes.commentId, commentId), eq(commentLikes.userId, userId)))
    .limit(1);
  
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

export async function getUserCommentLikes(userId: number, commentIds: number[]) {
  const db = await getDb();
  if (!db || commentIds.length === 0) return [];
  
  const result = await db.select({ commentId: commentLikes.commentId })
    .from(commentLikes)
    .where(and(eq(commentLikes.userId, userId), inArray(commentLikes.commentId, commentIds)));
  
  return result.map(r => r.commentId);
}

// ============ FAVORITES FUNCTIONS ============
export async function getUserFavoriteNews(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    favorite: favoriteNews,
    news: news,
    category: newsCategories,
  }).from(favoriteNews)
    .innerJoin(news, eq(favoriteNews.newsId, news.id))
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(eq(favoriteNews.userId, userId))
    .orderBy(desc(favoriteNews.createdAt));
}

export async function toggleFavoriteNews(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await db.select().from(favoriteNews)
    .where(and(eq(favoriteNews.userId, userId), eq(favoriteNews.newsId, newsId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(favoriteNews).where(eq(favoriteNews.id, existing[0].id));
    return false;
  } else {
    await db.insert(favoriteNews).values({ userId, newsId });
    return true;
  }
}

export async function isNewsFavorited(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(favoriteNews)
    .where(and(eq(favoriteNews.userId, userId), eq(favoriteNews.newsId, newsId)))
    .limit(1);
  
  return result.length > 0;
}

export async function getUserFavoritePlayers(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    favorite: favoritePlayers,
    player: players,
    team: teams,
  }).from(favoritePlayers)
    .innerJoin(players, eq(favoritePlayers.playerId, players.id))
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .where(eq(favoritePlayers.userId, userId))
    .orderBy(desc(favoritePlayers.createdAt));
}

export async function toggleFavoritePlayer(userId: number, playerId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await db.select().from(favoritePlayers)
    .where(and(eq(favoritePlayers.userId, userId), eq(favoritePlayers.playerId, playerId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.delete(favoritePlayers).where(eq(favoritePlayers.id, existing[0].id));
    return false;
  } else {
    await db.insert(favoritePlayers).values({ userId, playerId });
    return true;
  }
}

export async function isPlayerFavorited(userId: number, playerId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(favoritePlayers)
    .where(and(eq(favoritePlayers.userId, userId), eq(favoritePlayers.playerId, playerId)))
    .limit(1);
  
  return result.length > 0;
}

// ============ READING HISTORY FUNCTIONS ============
export async function addToReadingHistory(userId: number, newsId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(readingHistory).values({ userId, newsId });
}

export async function getUserReadingHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    history: readingHistory,
    news: news,
    category: newsCategories,
  }).from(readingHistory)
    .innerJoin(news, eq(readingHistory.newsId, news.id))
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(eq(readingHistory.userId, userId))
    .orderBy(desc(readingHistory.readAt))
    .limit(limit);
}

// ============ NOTIFICATION FUNCTIONS ============
export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}

export async function markNotificationAsRead(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, userId)));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  
  return result[0]?.count ?? 0;
}

// ============ SEARCH FUNCTIONS ============
export async function searchAll(query: string, limit = 10) {
  const db = await getDb();
  if (!db) return { news: [], players: [], teams: [] };
  
  const searchTerm = `%${query}%`;
  
  const newsResults = await db.select({
    news: news,
    category: newsCategories,
  }).from(news)
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(or(
      like(news.title, searchTerm),
      like(news.excerpt, searchTerm)
    ))
    .orderBy(desc(news.publishedAt))
    .limit(limit);
  
  const playerResults = await db.select({
    player: players,
    team: teams,
  }).from(players)
    .leftJoin(teams, eq(players.currentTeamId, teams.id))
    .where(like(players.name, searchTerm))
    .orderBy(desc(players.overallRating))
    .limit(limit);
  
  const teamResults = await db.select().from(teams)
    .where(or(
      like(teams.name, searchTerm),
      like(teams.shortName, searchTerm)
    ))
    .limit(limit);
  
  return { news: newsResults, players: playerResults, teams: teamResults };
}

// ============ PLAYER NEWS FUNCTIONS ============
export async function getPlayerNews(playerId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    news: news,
    category: newsCategories,
  }).from(playerNews)
    .innerJoin(news, eq(playerNews.newsId, news.id))
    .leftJoin(newsCategories, eq(news.categoryId, newsCategories.id))
    .where(eq(playerNews.playerId, playerId))
    .orderBy(desc(news.publishedAt))
    .limit(limit);
}

export async function linkPlayerToNews(playerId: number, newsId: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(playerNews).values({ playerId, newsId });
}
