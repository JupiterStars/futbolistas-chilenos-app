/**
 * Players.tsx - Página de jugadores integrada
 * Features: OptimizedImage, GridSkeleton, PlayerCardSkeleton, InfiniteScroll
 */
import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { OptimizedImage } from "@/components/OptimizedImage";
import { GridSkeleton, PlayerCardSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Users, Filter } from "lucide-react";

const positions = [
  { value: "all", label: "Todas las posiciones" },
  { value: "Portero", label: "Portero" },
  { value: "Defensa", label: "Defensa" },
  { value: "Mediocampista", label: "Mediocampista" },
  { value: "Delantero", label: "Delantero" },
];

const sortOptions = [
  { value: "rating", label: "Mejor valorados" },
  { value: "goals", label: "Más goles" },
  { value: "assists", label: "Más asistencias" },
  { value: "name", label: "Nombre A-Z" },
];

// Player Card con OptimizedImage
function PlayerCard({ player, team }: { player: any; team: any }) {
  return (
    <Link href={`/players/${player.slug}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group bg-card rounded-xl overflow-hidden border border-border card-hover"
      >
        <div className="aspect-[3/4] relative">
          <OptimizedImage
            src={player.imageUrl || "/player-profile.jpg"}
            alt={player.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Rating badge */}
          <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <span className="font-bold text-primary-foreground">
              {Number(player.overallRating).toFixed(0)}
            </span>
          </div>

          {/* Player info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {player.position}
              </Badge>
              {player.jerseyNumber && (
                <span className="text-xs text-white/70">#{player.jerseyNumber}</span>
              )}
            </div>
            <h3 className="font-bold text-white text-lg group-hover:text-primary transition-colors">
              {player.name}
            </h3>
            <p className="text-sm text-white/70">
              {team?.name || "Sin equipo"}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 grid grid-cols-3 gap-2 text-center border-t border-border">
          <div>
            <p className="text-lg font-bold text-primary">{player.goals}</p>
            <p className="text-xs text-muted-foreground">Goles</p>
          </div>
          <div>
            <p className="text-lg font-bold text-secondary">{player.assists}</p>
            <p className="text-xs text-muted-foreground">Asist.</p>
          </div>
          <div>
            <p className="text-lg font-bold">{player.matches}</p>
            <p className="text-xs text-muted-foreground">PJ</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const [position, setPosition] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "goals" | "assists" | "name">("rating");
  const [page, setPage] = useState(1);
  const limit = 16;

  const { data: allPlayers, isLoading } = trpc.players.list.useQuery({
    position: position !== "all" ? position : undefined,
    orderBy: sortBy,
    limit: 100,
  });

  // Filter players by search
  const filteredPlayers = allPlayers?.filter((item: any) =>
    item.player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil((filteredPlayers?.length || 0) / limit);
  const paginatedPlayers = filteredPlayers?.slice((page - 1) * limit, page * limit);
  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      setPage(p => p + 1);
    }
  }, [hasMore, isLoading]);

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Jugadores</h1>
              <p className="text-muted-foreground">
                Explora las jóvenes promesas del fútbol chileno
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar jugador..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-10"
            />
          </div>
          <Select value={position} onValueChange={(v) => { setPosition(v); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Posición" />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
                <SelectItem key={pos.value} value={pos.value}>
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as any); setPage(1); }}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Players grid con Skeleton o Contenido */}
        {isLoading ? (
          <GridSkeleton columns={4} items={8} itemHeight="lg" showImage />
        ) : paginatedPlayers && paginatedPlayers.length > 0 ? (
          <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {paginatedPlayers.map((item: any, index: number) => (
                <motion.div
                  key={item.player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PlayerCard player={item.player} team={item.team} />
                </motion.div>
              ))}
            </motion.div>
          </InfiniteScroll>
        ) : (
          <EmptyState
            type="players"
            title="No se encontraron jugadores"
            description={searchQuery 
              ? "Intenta con otros términos de búsqueda" 
              : "No hay jugadores disponibles en esta categoría"}
            action={searchQuery ? (
              <Button onClick={() => { setSearchQuery(""); setPosition("all"); }}>
                Limpiar filtros
              </Button>
            ) : undefined}
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
