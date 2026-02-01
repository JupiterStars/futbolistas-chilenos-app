import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
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

function PlayerCard({ player, team }: { player: any; team: any }) {
  return (
    <Link href={`/players/${player.slug}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group bg-card rounded-xl overflow-hidden border border-border card-hover"
      >
        <div className="aspect-[3/4] relative">
          <img
            src={player.imageUrl || "/player-profile.jpg"}
            alt={player.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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

  const { data: players, isLoading } = trpc.players.list.useQuery({
    position: position !== "all" ? position : undefined,
    orderBy: sortBy,
    limit: 50,
  });

  const filteredPlayers = players?.filter(item =>
    item.player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={position} onValueChange={setPosition}>
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
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
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

        {/* Players grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
                <Skeleton className="aspect-[3/4]" />
                <div className="p-4">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPlayers && filteredPlayers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredPlayers.map((item, index) => (
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
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No se encontraron jugadores
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
