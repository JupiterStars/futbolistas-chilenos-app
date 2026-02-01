# Supabase Setup Guide - Chilenos Young App

**Date:** 2026-02-01
**Purpose:** Setup PostgreSQL database on Supabase for deployment

---

## STEP 1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up / Log in
3. Click **"New Project"**
4. Configure:
   - **Name:** `chilenos-young-db` (or your preferred name)
   - **Database Password:** Generate a strong password (SAVE IT!)
   - **Region:** Choose closest to your users (e.g., `South America East` for Chile)
   - **Pricing Plan:** Free tier is fine for starters

5. Click **"Create new project"** and wait for provisioning (~2 minutes)

---

## STEP 2: Get Database Connection String

Once project is ready:

1. Go to **Project Settings** > **Database**
2. Scroll to **Connection String** section
3. Select **"URI"** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```

5. Save this - you'll need it for Vercel environment variables

---

## STEP 3: Run SQL Schema

1. In Supabase dashboard, go to **SQL Editor** (icon looks like `</>`)
2. Click **"New Query"**
3. Copy the entire contents of `docs/schema-postgresql.sql`
4. Paste into the SQL Editor
5. Click **"Run"** (or press `Ctrl+Enter`)

This will create:
- 14 tables (users, news, players, teams, etc.)
- 5 enum types
- 3 useful views
- Row Level Security (RLS) policies
- Triggers for `updatedAt` timestamps

---

## STEP 4: Configure Database URL in Vercel

### Option A: Via Vercel Dashboard

1. Go to Vercel Dashboard > Your Project > **Settings** > **Environment Variables**
2. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `DATABASE_URL` | Your Supabase connection string | Production |
| `POSTGRES_URL` | Same as above | Production |
| `POSTGRES_PRISMA_URL` | Same as above | Production |
| `POSTGRES_URL_NON_POOLING` | Same as above | Production |
| `JWT_SECRET` | `openssl rand -base64 32` | Production |
| `SESSION_SECRET` | `openssl rand -base64 32` | Production |
| `MANUS_OAUTH_CLIENT_ID` | From Manus Dashboard | Production |
| `MANUS_OAUTH_CLIENT_SECRET` | From Manus Dashboard | Production |
| `MANUS_OAUTH_REDIRECT_URI` | `https://your-domain.vercel.app/api/oauth/callback` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | Production |

### Option B: Via Vercel CLI

```bash
# Set database URL
vercel env add DATABASE_URL production
# Paste your Supabase connection string when prompted

# Set secrets (generate these first)
vercel env add JWT_SECRET production
vercel env add SESSION_SECRET production

# Set OAuth variables
vercel env add MANUS_OAUTH_CLIENT_ID production
vercel env add MANUS_OAUTH_CLIENT_SECRET production
vercel env add MANUS_OAUTH_REDIRECT_URI production

# Set site URL
vercel env add NEXT_PUBLIC_SITE_URL production
```

---

## STEP 5: Generate Secrets

Run these commands to generate secure random strings:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate SESSION_SECRET
openssl rand -base64 32
```

Use these values in Vercel environment variables.

---

## STEP 6: Update OAuth Redirect URI in Manus

1. Go to your Manus OAuth Dashboard
2. Find your application settings
3. Add the redirect URI: `https://your-domain.vercel.app/api/oauth/callback`
4. Save changes

---

## STEP 7: Deploy to Vercel

```bash
cd "/home/cosmic/Proyectos Codigo/chilenos-young app (1)"
pnpm install
vercel --prod
```

---

## Verification

After deploy, verify:

1. **Homepage loads:** `https://your-domain.vercel.app`
2. **API responds:** `curl https://your-domain.vercel.app/api/trpc`
3. **Check Vercel Logs:** No database connection errors

---

## Troubleshooting

### "Connection refused" error

**Cause:** Supabase needs to allow Vercel IPs

**Fix:**
1. In Supabase Dashboard > Database > Connection Pooling
2. Enable "Connection Pooling" mode
3. Use the pooled connection string (starts with `postgres://postgres.pooler:`)

### "Relation does not exist" error

**Cause:** SQL schema not executed

**Fix:** Run the `schema-postgresql.sql` script in Supabase SQL Editor

### "Invalid JWT" error

**Cause:** JWT_SECRET not configured

**Fix:** Add JWT_SECRET to Vercel environment variables

---

## Supabase Project URLs Reference

After creating your project, you'll have these URLs:

| Purpose | URL Format | Example |
|---------|------------|---------|
| Database | `db.[REF].supabase.co` | `db.abcdefghijk.supabase.co` |
| API | `[REF].supabase.co` | `abcdefghijk.supabase.co` |
| Studio | `supabase.com/dashboard/project/[REF]` | Dashboard link |
| Connection String | `postgresql://...` | From Database settings |

---

## Schema Overview

The SQL script creates these tables:

- **users** - User accounts with OAuth
- **news_categories** - News categories
- **news** - News articles
- **teams** - Football clubs
- **players** - Chilean players with stats
- **player_news** - Player-news relationships
- **transfers** - Transfer rumors/deals
- **comments** - Nested comments
- **comment_likes** - Comment likes
- **favorite_news** - User bookmarked news
- **favorite_players** - User bookmarked players
- **reading_history** - User reading history
- **notifications** - User notifications
- **leaderboard_snapshots** - Historical rankings

---

## Post-Setup Tasks

After successful deploy:

1. **Add seed data:** Insert initial categories, teams, players
2. **Configure RLS policies:** Fine-tune access rules
3. **Set up backups:** Enable automated backups in Supabase
4. **Monitor usage:** Check Supabase dashboard for performance

---

*Generated by Web Orchestrator - 2026-02-01*
