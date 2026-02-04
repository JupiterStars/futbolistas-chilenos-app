/**
 * FCH Noticias - Search Router
 * Búsqueda global de noticias, jugadores y equipos
 */

import { z } from 'zod';
import { eq, like, or, sql, desc } from 'drizzle-orm';
import { router, publicProcedure } from '../_core/trpc';
import { db } from '../db/connection';
import { news, players, teams } from '../db/schema';

// Input de búsqueda
const SearchInput = z.object({
  query: z.string().min(1),
  limit: z.number().min(1).max(50).default(20),
});

export const searchRouter = router({
  /**
   * Búsqueda global
   * Busca en noticias, jugadores y equipos
   */
  all: publicProcedure
    .input(SearchInput)
    .query(async ({ input }) => {
      const { query, limit } = input;
      const searchTerm = `%${query.toLowerCase()}%`;
      
      // Buscar noticias
      const newsResults = await db.query.news.findMany({
        where: or(
          like(sql`lower(${news.title})`, searchTerm),
          like(sql`lower(${news.excerpt})`, searchTerm),
          like(sql`lower(${news.content})`, searchTerm)
        ),
        with: {
          category: true,
        },
        limit: Math.floor(limit / 2),
        orderBy: [desc(news.publishedAt)],
      });

      // Buscar jugadores
      const playersResults = await db.query.players.findMany({
        where: or(
          like(sql`lower(${players.name})`, searchTerm),
          like(sql`lower(${players.position})`, searchTerm),
          like(sql`lower(${players.nationality})`, searchTerm)
        ),
        with: {
          team: true,
        },
        limit: Math.floor(limit / 3),
        orderBy: [desc(players.overallRating)],
      });

      // Buscar equipos
      const teamsResults = await db.query.teams.findMany({
        where: or(
          like(sql`lower(${teams.name})`, searchTerm),
          like(sql`lower(${teams.shortName})`, searchTerm),
          like(sql`lower(${teams.league})`, searchTerm)
        ),
        limit: Math.floor(limit / 3),
        orderBy: [teams.name],
      });

      return {
        news: newsResults.map(n => ({
          news: n,
          category: n.category,
        })),
        players: playersResults.map(p => ({
          player: p,
          team: p.team,
        })),
        teams: teamsResults,
        query,
      };
    }),

  /**
   * Búsqueda solo de noticias
   */
  news: publicProcedure
    .input(SearchInput)
    .query(async ({ input }) => {
      const { query, limit } = input;
      const searchTerm = `%${query.toLowerCase()}%`;
      
      const results = await db.query.news.findMany({
        where: or(
          like(sql`lower(${news.title})`, searchTerm),
          like(sql`lower(${news.excerpt})`, searchTerm),
          like(sql`lower(${news.content})`, searchTerm)
        ),
        with: {
          category: true,
        },
        limit,
        orderBy: [desc(news.publishedAt)],
      });

      return results.map(n => ({
        news: n,
        category: n.category,
      }));
    }),

  /**
   * Búsqueda solo de jugadores
   */
  players: publicProcedure
    .input(SearchInput)
    .query(async ({ input }) => {
      const { query, limit } = input;
      const searchTerm = `%${query.toLowerCase()}%`;
      
      const results = await db.query.players.findMany({
        where: or(
          like(sql`lower(${players.name})`, searchTerm),
          like(sql`lower(${players.position})`, searchTerm),
          like(sql`lower(${players.nationality})`, searchTerm)
        ),
        with: {
          team: true,
        },
        limit,
        orderBy: [desc(players.overallRating)],
      });

      return results.map(p => ({
        player: p,
        team: p.team,
      }));
    }),
});

export type SearchRouter = typeof searchRouter;
