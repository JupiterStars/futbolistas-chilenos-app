# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Chilenos Young** is a full-stack Chilean football news and statistics platform focusing on young Chilean players. Built as a monorepo with React 19 frontend, Express/tRPC backend, and MySQL database with Drizzle ORM.

## Development Commands

```bash
# Install dependencies
pnpm install

# Development (runs both frontend on Vite and backend server with hot reload)
pnpm dev

# Type checking
pnpm check

# Format code
pnpm format

# Run tests
pnpm test

# Database migrations
pnpm db:push    # Generate migrations and apply to database

# Production
pnpm build      # Build frontend and bundle backend
pnpm start      # Run production server
```

## Architecture

### Monorepo Structure
```
├── client/          # React 19 frontend (Vite)
├── server/          # Express + tRPC backend
├── shared/          # Shared types and constants
├── drizzle/         # Database schema and migrations
└── dist/            # Production build output
```

### Key Technologies

**Frontend (`client/`)**:
- React 19 with TypeScript
- Vite (dev server, HMR, builds)
- Wouter for routing (`@/routes` pattern)
- TanStack Query for server state
- tRPC React for type-safe API calls
- shadcn/ui + Radix UI components
- Tailwind CSS v4 with Chilean theme colors

**Backend (`server/`)**:
- Express with tRPC adapter
- Cookie-based authentication with JWT (jose)
- OAuth integration (Manus OAuth)
- MySQL2 + Drizzle ORM

**Database (`drizzle/schema.ts`)**:
- Users (OAuth, premium, roles)
- News system (categories, articles, featured/premium)
- Teams and Players (with stats, skills, market values)
- Transfers (rumors, confirmed)
- Comments (nested with likes)
- Favorites (news, players)
- Leaderboard snapshots

### tRPC Setup

**Server** (`server/_core/trpc.ts`):
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role

**Client** (`client/src/lib/trpc.ts`):
- Uses `createTRPCReact` with TanStack Query integration
- All API calls are fully type-safe

### Path Aliases (vite.config.ts)
```typescript
@/          → client/src
@shared/    → shared
@assets/    → attached_assets
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - MySQL connection string (required for Drizzle commands)

## Manus Debug System

This project includes a custom debug collector (`vite.config.ts`):
- Browser logs are written to `.manus-logs/` during development
- Files: `browserConsole.log`, `networkRequests.log`, `sessionReplay.log`
- Auto-trimmed at 1MB to prevent oversized logs
- Injected via `/__manus__/debug-collector.js` script

## Chilean Theme

Colors (used throughout UI):
- Red: `#E30613`
- Blue: `#0039A6`

## Database Operations

Use `pnpm db:push` to:
1. Generate SQL migrations from schema changes
2. Apply migrations to database

Schema is in `drizzle/schema.ts` - all tables use Drizzle ORM MySQL core.
