import { useState, useEffect } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search as SearchIcon,
  Newspaper,
  Users,
  Building2,
  Clock,
  Eye,
  X,
} from "lucide-react";

export default function Search() {
  const searchParams = useSearch();
  const initialQuery = new URLSearchParams(searchParams).get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("all");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = trpc.search.all.useQuery(
    { query: debouncedQuery, limit: 20 },
    { enabled: debouncedQuery.length >= 2 }
  );

  const totalResults = 
    (results?.news?.length || 0) + 
    (results?.players?.length || 0) + 
    (results?.teams?.length || 0);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Search header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Buscar</h1>
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar noticias, jugadores, equipos..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 pr-12 h-14 text-lg"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {debouncedQuery.length < 2 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Escribe al menos 2 caracteres para buscar
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : totalResults === 0 ? (
          <div className="text-center py-12">
            <SearchIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-xl font-semibold mb-2">Sin resultados</p>
            <p className="text-muted-foreground">
              No encontramos nada para "{debouncedQuery}"
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              {totalResults} resultado{totalResults !== 1 ? "s" : ""} para "{debouncedQuery}"
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  Todos ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="news">
                  <Newspaper className="w-4 h-4 mr-2" />
                  Noticias ({results?.news?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="players">
                  <Users className="w-4 h-4 mr-2" />
                  Jugadores ({results?.players?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="teams">
                  <Building2 className="w-4 h-4 mr-2" />
                  Equipos ({results?.teams?.length || 0})
                </TabsTrigger>
              </TabsList>

              {/* All results */}
              <TabsContent value="all" className="space-y-6">
                {/* News */}
                {results?.news && results.news.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Newspaper className="w-4 h-4" />
                      Noticias
                    </h3>
                    <div className="space-y-3">
                      {results.news.slice(0, 5).map((item) => (
                        <NewsResult key={item.news.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Players */}
                {results?.players && results.players.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Jugadores
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.players.slice(0, 4).map((item) => (
                        <PlayerResult key={item.player.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Teams */}
                {results?.teams && results.teams.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Equipos
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {results.teams.slice(0, 4).map((team) => (
                        <TeamResult key={team.id} team={team} />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* News only */}
              <TabsContent value="news" className="space-y-3">
                {results?.news?.map((item) => (
                  <NewsResult key={item.news.id} item={item} />
                ))}
              </TabsContent>

              {/* Players only */}
              <TabsContent value="players" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results?.players?.map((item) => (
                  <PlayerResult key={item.player.id} item={item} />
                ))}
              </TabsContent>

              {/* Teams only */}
              <TabsContent value="teams" className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results?.teams?.map((team) => (
                  <TeamResult key={team.id} team={team} />
                ))}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </Layout>
  );
}

function NewsResult({ item }: { item: any }) {
  return (
    <Link href={`/news/${item.news.slug}`}>
      <motion.div
        whileHover={{ x: 5 }}
        className="flex gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
      >
        <img
          src={item.news.imageUrl || "/chile-team-1.jpg"}
          alt={item.news.title}
          className="w-24 h-16 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {item.category && (
              <Badge variant="secondary" className="text-xs">
                {item.category.name}
              </Badge>
            )}
          </div>
          <h4 className="font-medium line-clamp-2 hover:text-primary transition-colors">
            {item.news.title}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(item.news.publishedAt).toLocaleDateString('es-CL')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {item.news.views}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function PlayerResult({ item }: { item: any }) {
  return (
    <Link href={`/players/${item.player.slug}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors cursor-pointer"
      >
        <Avatar className="w-14 h-14">
          <AvatarImage src={item.player.imageUrl || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {item.player.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium hover:text-primary transition-colors">
            {item.player.name}
          </h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {item.player.position}
            </Badge>
            <span>{item.team?.name || "Sin equipo"}</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <span className="text-sm font-bold text-primary-foreground">
            {Number(item.player.overallRating).toFixed(0)}
          </span>
        </div>
      </motion.div>
    </Link>
  );
}

function TeamResult({ team }: { team: any }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border cursor-pointer"
    >
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
        {team.logo ? (
          <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-xl font-bold text-muted-foreground">
            {team.shortName?.charAt(0) || team.name.charAt(0)}
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium">{team.name}</h4>
        <p className="text-sm text-muted-foreground">
          {team.league || team.country}
        </p>
      </div>
    </motion.div>
  );
}
