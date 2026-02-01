-- ============================================================
-- Chilenos Young App - PostgreSQL Schema for Supabase
-- ============================================================
-- Generated from: drizzle/schema.ts (MySQL)
-- Migration: MySQL (Drizzle) → PostgreSQL (Supabase)
-- Version: 1.0
-- Date: 2026-02-01
-- ============================================================

-- Drop existing types (for clean re-run)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS fee_type CASCADE;
DROP TYPE IF EXISTS transfer_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS leaderboard_type CASCADE;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TYPE fee_type AS ENUM ('paid', 'free', 'loan', 'undisclosed');

CREATE TYPE transfer_status AS ENUM ('confirmed', 'rumor', 'official');

CREATE TYPE notification_type AS ENUM ('news', 'goal', 'transfer', 'comment_reply', 'system');

CREATE TYPE leaderboard_type AS ENUM ('goals', 'assists', 'rating');

-- ============================================================
-- CORE TABLES
-- ============================================================

-- ============================================================
-- Table: users
-- ============================================================
-- User accounts with OAuth authentication and premium subscription support
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    openId VARCHAR(64) NOT NULL UNIQUE,
    name TEXT,
    email VARCHAR(320),
    avatar TEXT,
    bio TEXT,
    loginMethod VARCHAR(64),
    role user_role NOT NULL DEFAULT 'user',
    isPremium BOOLEAN NOT NULL DEFAULT FALSE,
    premiumUntil TIMESTAMPTZ,
    favoriteTeam VARCHAR(100),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    lastSignedIn TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_openid ON users(openId);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_ispremium ON users(isPremium);

-- ============================================================
-- Table: news_categories
-- ============================================================
-- Categories for organizing news articles
CREATE TABLE news_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for news_categories
CREATE INDEX idx_news_categories_slug ON news_categories(slug);

-- ============================================================
-- Table: news
-- ============================================================
-- News articles with featured/premium flags and view tracking
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    imageUrl TEXT,
    categoryId INTEGER NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
    authorId INTEGER REFERENCES users(id) ON DELETE SET NULL,
    isFeatured BOOLEAN NOT NULL DEFAULT FALSE,
    isPremium BOOLEAN NOT NULL DEFAULT FALSE,
    views INTEGER NOT NULL DEFAULT 0,
    publishedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for news
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_categoryid ON news(categoryId);
CREATE INDEX idx_news_authorid ON news(authorId);
CREATE INDEX idx_news_isfeatured ON news(isFeatured);
CREATE INDEX idx_news_ispremium ON news(isPremium);
CREATE INDEX idx_news_publishedat ON news(publishedAt DESC);
CREATE INDEX idx_news_views ON news(views DESC);

-- ============================================================
-- Table: teams
-- ============================================================
-- Football clubs and national teams
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    shortName VARCHAR(50),
    logo TEXT,
    country VARCHAR(100),
    league VARCHAR(200),
    founded INTEGER,
    stadium VARCHAR(200),
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for teams
CREATE INDEX idx_teams_name ON teams(name);
CREATE INDEX idx_teams_country ON teams(country);
CREATE INDEX idx_teams_league ON teams(league);

-- ============================================================
-- Table: players
-- ============================================================
-- Chilean football players with stats, skills, and market values
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    imageUrl TEXT,
    nationality VARCHAR(100) NOT NULL DEFAULT 'Chile',
    birthDate TIMESTAMPTZ,
    age INTEGER,
    position VARCHAR(50) NOT NULL,
    currentTeamId INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    jerseyNumber INTEGER,
    height INTEGER,  -- in cm
    weight INTEGER,  -- in kg
    preferredFoot VARCHAR(20),
    marketValue DECIMAL(15, 2),
    -- Stats
    goals INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    matches INTEGER NOT NULL DEFAULT 0,
    minutesPlayed INTEGER NOT NULL DEFAULT 0,
    yellowCards INTEGER NOT NULL DEFAULT 0,
    redCards INTEGER NOT NULL DEFAULT 0,
    -- Skills (1-100)
    pace INTEGER DEFAULT 50,
    shooting INTEGER DEFAULT 50,
    passing INTEGER DEFAULT 50,
    dribbling INTEGER DEFAULT 50,
    defending INTEGER DEFAULT 50,
    physical INTEGER DEFAULT 50,
    -- Rating
    overallRating DECIMAL(3, 1) DEFAULT 50.0,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for players
CREATE INDEX idx_players_slug ON players(slug);
CREATE INDEX idx_players_nationality ON players(nationality);
CREATE INDEX idx_players_position ON players(position);
CREATE INDEX idx_players_currentteamid ON players(currentTeamId);
CREATE INDEX idx_players_goals ON players(goals DESC);
CREATE INDEX idx_players_assists ON players(assists DESC);
CREATE INDEX idx_players_overallrating ON players(overallRating DESC);

-- ============================================================
-- RELATION TABLES
-- ============================================================

-- ============================================================
-- Table: player_news
-- ============================================================
-- Many-to-many relationship between players and news articles
CREATE TABLE player_news (
    id SERIAL PRIMARY KEY,
    playerId INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    newsId INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(playerId, newsId)
);

-- Indexes for player_news
CREATE INDEX idx_player_news_playerid ON player_news(playerId);
CREATE INDEX idx_player_news_newsid ON player_news(newsId);

-- ============================================================
-- Table: transfers
-- ============================================================
-- Transfer rumors and confirmed transfers
CREATE TABLE transfers (
    id SERIAL PRIMARY KEY,
    playerId INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    fromTeamId INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    toTeamId INTEGER REFERENCES teams(id) ON DELETE SET NULL,
    fee DECIMAL(15, 2),
    feeType fee_type DEFAULT 'undisclosed',
    status transfer_status NOT NULL DEFAULT 'rumor',
    contractYears INTEGER,
    salary DECIMAL(15, 2),
    announcedAt TIMESTAMPTZ,
    completedAt TIMESTAMPTZ,
    source TEXT,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for transfers
CREATE INDEX idx_transfers_playerid ON transfers(playerId);
CREATE INDEX idx_transfers_fromteamid ON transfers(fromTeamId);
CREATE INDEX idx_transfers_toteamid ON transfers(toTeamId);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_transfers_completedat ON transfers(completedAt DESC);

-- ============================================================
-- ENGAGEMENT TABLES
-- ============================================================

-- ============================================================
-- Table: comments
-- ============================================================
-- Nested comment system for news articles
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    newsId INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parentId INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes INTEGER NOT NULL DEFAULT 0,
    isEdited BOOLEAN NOT NULL DEFAULT FALSE,
    isDeleted BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX idx_comments_newsid ON comments(newsId);
CREATE INDEX idx_comments_userid ON comments(userId);
CREATE INDEX idx_comments_parentid ON comments(parentId);
CREATE INDEX idx_comments_createdat ON comments(createdAt DESC);

-- ============================================================
-- Table: comment_likes
-- ============================================================
-- User likes on comments (many-to-many)
CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    commentId INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(commentId, userId)
);

-- Indexes for comment_likes
CREATE INDEX idx_comment_likes_commentid ON comment_likes(commentId);
CREATE INDEX idx_comment_likes_userid ON comment_likes(userId);

-- ============================================================
-- Table: favorite_news
-- ============================================================
-- User bookmarked news articles
CREATE TABLE favorite_news (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    newsId INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, newsId)
);

-- Indexes for favorite_news
CREATE INDEX idx_favorite_news_userid ON favorite_news(userId);
CREATE INDEX idx_favorite_news_newsid ON favorite_news(newsId);

-- ============================================================
-- Table: favorite_players
-- ============================================================
-- User bookmarked players
CREATE TABLE favorite_players (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    playerId INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(userId, playerId)
);

-- Indexes for favorite_players
CREATE INDEX idx_favorite_players_userid ON favorite_players(userId);
CREATE INDEX idx_favorite_players_playerid ON favorite_players(playerId);

-- ============================================================
-- Table: reading_history
-- ============================================================
-- Track news articles read by users
CREATE TABLE reading_history (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    newsId INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
    readAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for reading_history
CREATE INDEX idx_reading_history_userid ON reading_history(userId);
CREATE INDEX idx_reading_history_newsid ON reading_history(newsId);
CREATE INDEX idx_reading_history_readat ON reading_history(readAt DESC);

-- ============================================================
-- SYSTEM TABLES
-- ============================================================

-- ============================================================
-- Table: notifications
-- ============================================================
-- User notifications for various events
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    isRead BOOLEAN NOT NULL DEFAULT FALSE,
    createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for notifications
CREATE INDEX idx_notifications_userid ON notifications(userId);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_isread ON notifications(isRead);
CREATE INDEX idx_notifications_createdat ON notifications(createdAt DESC);

-- ============================================================
-- Table: leaderboard_snapshots
-- ============================================================
-- Historical leaderboard data for players
CREATE TABLE leaderboard_snapshots (
    id SERIAL PRIMARY KEY,
    type leaderboard_type NOT NULL,
    playerId INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    value DECIMAL(10, 2) NOT NULL,
    rank INTEGER NOT NULL,
    season VARCHAR(20) NOT NULL,
    snapshotDate TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for leaderboard_snapshots
CREATE INDEX idx_leaderboard_snapshots_type ON leaderboard_snapshots(type);
CREATE INDEX idx_leaderboard_snapshots_playerid ON leaderboard_snapshots(playerId);
CREATE INDEX idx_leaderboard_snapshots_season ON leaderboard_snapshots(season);
CREATE INDEX idx_leaderboard_snapshots_rank ON leaderboard_snapshots(type, season, rank);
CREATE INDEX idx_leaderboard_snapshots_date ON leaderboard_snapshots(snapshotDate DESC);

-- ============================================================
-- USEFUL VIEWS (Optional)
-- ============================================================

-- View: Player with current team name
CREATE VIEW players_with_teams AS
SELECT
    p.*,
    t.name AS currentTeamName,
    t.shortName AS currentTeamShortName,
    t.logo AS currentTeamLogo
FROM players p
LEFT JOIN teams t ON p.currentTeamId = t.id;

-- View: News with category and author
CREATE VIEW news_with_details AS
SELECT
    n.*,
    c.name AS categoryName,
    c.slug AS categorySlug,
    c.color AS categoryColor,
    u.name AS authorName,
    u.avatar AS authorAvatar
FROM news n
INNER JOIN news_categories c ON n.categoryId = c.id
LEFT JOIN users u ON n.authorId = u.id;

-- View: Transfers with player and team details
CREATE VIEW transfers_with_details AS
SELECT
    t.*,
    p.name AS playerName,
    p.slug AS playerSlug,
    fromTeam.name AS fromTeamName,
    fromTeam.logo AS fromTeamLogo,
    toTeam.name AS toTeamName,
    toTeam.logo AS toTeamLogo
FROM transfers t
INNER JOIN players p ON t.playerId = p.id
LEFT JOIN teams fromTeam ON t.fromTeamId = fromTeam.id
LEFT JOIN teams toTeam ON t.toTeamId = toTeam.id;

-- ============================================================
-- SUPABASE-SPECIFIC ADDITIONS
-- ============================================================

-- Enable Row Level Security (RLS) - recommended for Supabase
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your application's
-- authentication and authorization requirements. This is a template
-- and should be customized.

-- Example RLS policy for users table (everyone can read, only own user can update)
CREATE POLICY "Users can view all profiles" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = openId);

-- ============================================================
-- TRIGGER FUNCTIONS FOR UPDATED_AT
-- ============================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedAt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for tables with updatedAt field
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfers_updated_at BEFORE UPDATE ON transfers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- END OF SCHEMA
-- ============================================================
