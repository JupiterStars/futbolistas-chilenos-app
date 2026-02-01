# Database Schema - Chilenos Young App

> Complete documentation of the MySQL/Drizzle schema for migration to PostgreSQL/Supabase

---

## Overview

**Total Tables:** 14
**Total Enums:** 4
**Database Type:** MySQL (Drizzle ORM) → Migrating to PostgreSQL (Supabase)

---

## Table of Contents

1. [Core Tables](#core-tables)
   - [users](#users)
   - [news_categories](#news_categories)
   - [news](#news)
   - [teams](#teams)
   - [players](#players)
2. [Relation Tables](#relation-tables)
   - [player_news](#player_news)
   - [transfers](#transfers)
3. [Engagement Tables](#engagement-tables)
   - [comments](#comments)
   - [comment_likes](#comment_likes)
   - [favorite_news](#favorite_news)
   - [favorite_players](#favorite_players)
   - [reading_history](#reading_history)
4. [System Tables](#system-tables)
   - [notifications](#notifications)
   - [leaderboard_snapshots](#leaderboard_snapshots)
5. [Enums](#enums)
6. [Relationship Diagram](#relationship-diagram)

---

## Core Tables

### users

User accounts with OAuth authentication and premium subscription support.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `openId` | VARCHAR(64) | NO | - | OAuth unique identifier (UNIQUE) |
| `name` | TEXT | YES | NULL | Display name |
| `email` | VARCHAR(320) | YES | NULL | Email address |
| `avatar` | TEXT | YES | NULL | Avatar URL |
| `bio` | TEXT | YES | NULL | User biography |
| `loginMethod` | VARCHAR(64) | YES | NULL | Auth provider (e.g., "manus") |
| `role` | ENUM | NO | 'user' | User role: 'user' or 'admin' |
| `isPremium` | BOOLEAN | NO | FALSE | Premium subscription status |
| `premiumUntil` | TIMESTAMP | YES | NULL | Premium expiry date |
| `favoriteTeam` | VARCHAR(100) | YES | NULL | User's favorite team name |
| `createdAt` | TIMESTAMP | NO | NOW() | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NO | NOW() | Last update timestamp |
| `lastSignedIn` | TIMESTAMP | NO | NOW() | Last login timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`openId`)

---

### news_categories

Categories for organizing news articles.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `name` | VARCHAR(100) | NO | - | Category display name |
| `slug` | VARCHAR(100) | NO | - | URL-friendly identifier (UNIQUE) |
| `description` | TEXT | YES | NULL | Category description |
| `color` | VARCHAR(7) | YES | NULL | Hex color code for UI |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`slug`)

---

### news

News articles with featured/premium flags and view tracking.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `title` | VARCHAR(500) | NO | - | Article title |
| `slug` | VARCHAR(500) | NO | - | URL-friendly identifier (UNIQUE) |
| `excerpt` | TEXT | YES | NULL | Short summary |
| `content` | TEXT | NO | - | Full article content |
| `imageUrl` | TEXT | YES | NULL | Featured image URL |
| `categoryId` | INT | NO | - | FK → news_categories.id |
| `authorId` | INT | YES | NULL | FK → users.id |
| `isFeatured` | BOOLEAN | NO | FALSE | Show on homepage |
| `isPremium` | BOOLEAN | NO | FALSE | Premium-only content |
| `views` | INT | NO | 0 | View counter |
| `publishedAt` | TIMESTAMP | NO | NOW() | Publication date |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`slug`)
- FOREIGN KEY (`categoryId`) → news_categories(`id`)
- FOREIGN KEY (`authorId`) → users(`id`)

---

### teams

Football clubs and national teams.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `name` | VARCHAR(200) | NO | - | Full team name |
| `shortName` | VARCHAR(50) | YES | NULL | Abbreviated name |
| `logo` | TEXT | YES | NULL | Team logo URL |
| `country` | VARCHAR(100) | YES | NULL | Team country |
| `league` | VARCHAR(200) | YES | NULL | League name |
| `founded` | INT | YES | NULL | Year founded |
| `stadium` | VARCHAR(200) | YES | NULL | Home stadium name |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)

---

### players

Chilean football players with stats, skills, and market values.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `name` | VARCHAR(200) | NO | - | Full player name |
| `slug` | VARCHAR(200) | NO | - | URL-friendly identifier (UNIQUE) |
| `imageUrl` | TEXT | YES | NULL | Player photo URL |
| `nationality` | VARCHAR(100) | NO | 'Chile' | Nationality |
| `birthDate` | TIMESTAMP | YES | NULL | Date of birth |
| `age` | INT | YES | NULL | Calculated age |
| `position` | VARCHAR(50) | NO | - | Playing position (e.g., "FW") |
| `currentTeamId` | INT | YES | NULL | FK → teams.id |
| `jerseyNumber` | INT | YES | NULL | Shirt number |
| `height` | INT | YES | NULL | Height in cm |
| `weight` | INT | YES | NULL | Weight in kg |
| `preferredFoot` | VARCHAR(20) | YES | NULL | "left" or "right" |
| `marketValue` | DECIMAL(15,2) | YES | NULL | Transfer market value |
| `goals` | INT | NO | 0 | Career goals |
| `assists` | INT | NO | 0 | Career assists |
| `matches` | INT | NO | 0 | Matches played |
| `minutesPlayed` | INT | NO | 0 | Total minutes |
| `yellowCards` | INT | NO | 0 | Yellow cards received |
| `redCards` | INT | NO | 0 | Red cards received |
| `pace` | INT | NO | 50 | Skill attribute (1-100) |
| `shooting` | INT | NO | 50 | Skill attribute (1-100) |
| `passing` | INT | NO | 50 | Skill attribute (1-100) |
| `dribbling` | INT | NO | 50 | Skill attribute (1-100) |
| `defending` | INT | NO | 50 | Skill attribute (1-100) |
| `physical` | INT | NO | 50 | Skill attribute (1-100) |
| `overallRating` | DECIMAL(3,1) | NO | 50.0 | Overall rating (0-100) |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`slug`)
- FOREIGN KEY (`currentTeamId`) → teams(`id`)

---

## Relation Tables

### player_news

Many-to-many relationship between players and news articles.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `playerId` | INT | NO | - | FK → players.id |
| `newsId` | INT | NO | - | FK → news.id |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`playerId`) → players(`id`)
- FOREIGN KEY (`newsId`) → news(`id`)

---

### transfers

Transfer rumors and confirmed transfers.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `playerId` | INT | NO | - | FK → players.id |
| `fromTeamId` | INT | YES | NULL | FK → teams.id (origin) |
| `toTeamId` | INT | YES | NULL | FK → teams.id (destination) |
| `fee` | DECIMAL(15,2) | YES | NULL | Transfer fee amount |
| `feeType` | ENUM | NO | 'undisclosed' | 'paid', 'free', 'loan', 'undisclosed' |
| `status` | ENUM | NO | 'rumor' | 'confirmed', 'rumor', 'official' |
| `contractYears` | INT | YES | NULL | Contract duration |
| `salary` | DECIMAL(15,2) | YES | NULL | Annual salary |
| `announcedAt` | TIMESTAMP | YES | NULL | Announcement date |
| `completedAt` | TIMESTAMP | YES | NULL | Completion date |
| `source` | TEXT | YES | NULL | News source URL |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`playerId`) → players(`id`)
- FOREIGN KEY (`fromTeamId`) → teams(`id`)
- FOREIGN KEY (`toTeamId`) → teams(`id`)

---

## Engagement Tables

### comments

Nested comment system for news articles.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `newsId` | INT | NO | - | FK → news.id |
| `userId` | INT | NO | - | FK → users.id |
| `parentId` | INT | YES | NULL | FK → comments.id (self-referencing) |
| `content` | TEXT | NO | - | Comment text |
| `likes` | INT | NO | 0 | Like counter |
| `isEdited` | BOOLEAN | NO | FALSE | Has been edited |
| `isDeleted` | BOOLEAN | NO | FALSE | Soft delete flag |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |
| `updatedAt` | TIMESTAMP | NO | NOW() | Last update timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`newsId`) → news(`id`)
- FOREIGN KEY (`userId`) → users(`id`)
- FOREIGN KEY (`parentId`) → comments(`id`) (self-referencing)

---

### comment_likes

User likes on comments (many-to-many).

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `commentId` | INT | NO | - | FK → comments.id |
| `userId` | INT | NO | - | FK → users.id |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`commentId`) → comments(`id`)
- FOREIGN KEY (`userId`) → users(`id`)

---

### favorite_news

User bookmarked news articles.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `userId` | INT | NO | - | FK → users.id |
| `newsId` | INT | NO | - | FK → news.id |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`userId`) → users(`id`)
- FOREIGN KEY (`newsId`) → news(`id`)

---

### favorite_players

User bookmarked players.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `userId` | INT | NO | - | FK → users.id |
| `playerId` | INT | NO | - | FK → players.id |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`userId`) → users(`id`)
- FOREIGN KEY (`playerId`) → players(`id`)

---

### reading_history

Track news articles read by users.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `userId` | INT | NO | - | FK → users.id |
| `newsId` | INT | NO | - | FK → news.id |
| `readAt` | TIMESTAMP | NO | NOW() | Read timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`userId`) → users(`id`)
- FOREIGN KEY (`newsId`) → news(`id`)

---

## System Tables

### notifications

User notifications for various events.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `userId` | INT | NO | - | FK → users.id |
| `type` | ENUM | NO | - | 'news', 'goal', 'transfer', 'comment_reply', 'system' |
| `title` | VARCHAR(200) | NO | - | Notification title |
| `message` | TEXT | NO | - | Notification content |
| `link` | TEXT | YES | NULL | Deep link URL |
| `isRead` | BOOLEAN | NO | FALSE | Read status |
| `createdAt` | TIMESTAMP | NO | NOW() | Creation timestamp |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`userId`) → users(`id`)

---

### leaderboard_snapshots

Historical leaderboard data for players.

| Field | Type | Nullable | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | INT | NO | AUTO_INCREMENT | Primary key |
| `type` | ENUM | NO | - | 'goals', 'assists', 'rating' |
| `playerId` | INT | NO | - | FK → players.id |
| `value` | DECIMAL(10,2) | NO | - | Metric value |
| `rank` | INT | NO | - | Leaderboard position |
| `season` | VARCHAR(20) | NO | - | Season identifier (e.g., "2024-2025") |
| `snapshotDate` | TIMESTAMP | NO | NOW() | When snapshot was taken |

**Indexes:**
- PRIMARY KEY (`id`)
- FOREIGN KEY (`playerId`) → players(`id`)

---

## Enums

### role (users table)

```sql
ENUM('user', 'admin')
```
**Default:** 'user'

### fee_type (transfers table)

```sql
ENUM('paid', 'free', 'loan', 'undisclosed')
```
**Default:** 'undisclosed'

### transfer_status (transfers table)

```sql
ENUM('confirmed', 'rumor', 'official')
```
**Default:** 'rumor'

### notification_type (notifications table)

```sql
ENUM('news', 'goal', 'transfer', 'comment_reply', 'system')
```

### leaderboard_type (leaderboard_snapshots table)

```sql
ENUM('goals', 'assists', 'rating')
```

---

## Relationship Diagram

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   users     │────<│   comments       │>────│   news      │
│             │     │  (self: parentId)│     │             │
└─────────────┘     └──────────────────┘     └──────┬──────┘
     │  │  │                  │  │                   │
     │  │  │                  │  │                   │
     │  │  │           ┌──────┘  └──────┐           │
     │  │  │           │                 │           │
     │  │  │     ┌─────▼─────┐   ┌──────▼─────┐     │
     │  │  │     │comment_   │   │player_news │     │
     │  │  │     │likes      │   │            │     │
     │  │  │     └───────────┘   └──────┬─────┘     │
     │  │  │                             │           │
     │  │  └──────────┐                  │           │
     │  │             │                  │           │
     │  │     ┌───────▼───────┐          │           │
     │  │     │favorite_players│         │           │
     │  │     └───────┬───────┘          │           │
     │  │             │                  │           │
     │  │     ┌───────▼───────┐          │           │
     │  └────>│ favorite_news │───────────┘           │
     │        └───────────────┘                      │
     │                                                │
     │  ┌─────────────┐              ┌─────────────┐  │
     └──│notifications│              │reading_     │──┘
        └─────────────┘              │history      │
                                    └─────────────┘

┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   teams     │────<│   transfers      │>────│  players    │
│             │     │                  │     └─────────────┘
└─────────────┘     └──────────────────┘              │
        │                     │                       │
        └─────────────────────┴───────────────────────┼─────────────┐
                                                           ┌─────────▼─┐
                                                           │leaderboard│
                                                           │snapshots  │
                                                           └───────────┘

┌─────────────┐
│news_        │
│categories   │>────┐
└─────────────┘    │
                   │
              ┌────┴────┐
              │   news  │
              └─────────┘
```

---

## Migration Notes (MySQL → PostgreSQL)

### Type Conversions Applied

| MySQL | PostgreSQL |
|-------|------------|
| `INT AUTO_INCREMENT` | `SERIAL` or `BIGSERIAL` |
| `VARCHAR(n)` | `VARCHAR(n)` |
| `TEXT` | `TEXT` |
| `BOOLEAN` | `BOOLEAN` |
| `TIMESTAMP` | `TIMESTAMP` or `TIMESTAMPTZ` |
| `DECIMAL(p,s)` | `DECIMAL(p,s)` or `NUMERIC(p,s)` |
| `ENUM(...)` | Custom `CREATE TYPE` |
| `JSON` | `JSONB` |

### Key Changes for Supabase

1. **Auto-increment**: MySQL's `AUTO_INCREMENT` becomes PostgreSQL's `SERIAL` (for INT) or `BIGSERIAL` (for BIGINT)
2. **Timestamps**: Consider using `TIMESTAMPTZ` for timezone-aware timestamps
3. **Enums**: PostgreSQL requires creating custom types before table creation
4. **JSON**: PostgreSQL's `JSONB` is more performant than MySQL's `JSON`
5. **Foreign Keys**: PostgreSQL syntax is nearly identical but with slight differences in `ON DELETE` behavior

---

**Document Version:** 1.0
**Last Updated:** 2026-02-01
**Schema Source:** `/drizzle/schema.ts` (Drizzle ORM + MySQL)
