import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import {
  Heart,
  Newspaper,
  Users,
  Clock,
  Eye,
  Trash2,
  LogIn,
} from "lucide-react";

export default function Favorites() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();

  const { data: favoriteNews, isLoading: loadingNews } = trpc.favorites.news.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: favoritePlayers, isLoading: loadingPlayers } = trpc.favorites.players.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const utils = trpc.useUtils();

  const removeNewsFavorite = trpc.favorites.news.toggle.useMutation({
    onSuccess: () => {
      utils.favorites.news.list.invalidate();
      toast.success("Eliminado de favoritos");
    },
  });

  const removePlayerFavorite = trpc.favorites.players.toggle.useMutation({
    onSuccess: () => {
      utils.favorites.players.list.invalidate();
      toast.success("Eliminado de favoritos");
    },
  });

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-12 w-48 mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Inicia sesión para ver tus favoritos</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Guarda tus noticias y jugadores favoritos para acceder a ellos rápidamente
          </p>
          <Button asChild size="lg">
            <a href={getLoginUrl()}>
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </a>
          </Button>
        </div>
      </Layout>
    );
  }

  const totalFavorites = (favoriteNews?.length || 0) + (favoritePlayers?.length || 0);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Mis Favoritos</h1>
              <p className="text-muted-foreground">
                {totalFavorites} elemento{totalFavorites !== 1 ? "s" : ""} guardado{totalFavorites !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="news">
          <TabsList className="mb-6">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              Noticias ({favoriteNews?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Jugadores ({favoritePlayers?.length || 0})
            </TabsTrigger>
          </TabsList>

          {/* Favorite News */}
          <TabsContent value="news">
            {loadingNews ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : favoriteNews && favoriteNews.length > 0 ? (
              <div className="space-y-4">
                {favoriteNews.map((item, index) => (
                  <motion.div
                    key={item.favorite.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 p-4 rounded-lg bg-card border border-border group"
                  >
                    <Link href={`/news/${item.news?.slug}`} className="flex gap-4 flex-1">
                      <img
                        src={item.news?.imageUrl || "/chile-team-1.jpg"}
                        alt={item.news?.title}
                        className="w-28 h-20 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        {item.category && (
                          <Badge variant="secondary" className="text-xs mb-1">
                            {item.category.name}
                          </Badge>
                        )}
                        <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {item.news?.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.news?.publishedAt && new Date(item.news.publishedAt).toLocaleDateString('es-CL')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.news?.views}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => item.news && removeNewsFavorite.mutate({ newsId: item.news.id })}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Newspaper className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No tienes noticias guardadas
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/">Explorar noticias</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Favorite Players */}
          <TabsContent value="players">
            {loadingPlayers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ) : favoritePlayers && favoritePlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoritePlayers.map((item, index) => (
                  <motion.div
                    key={item.favorite.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-card border border-border group"
                  >
                    <Link href={`/players/${item.player?.slug}`} className="flex items-center gap-4 flex-1">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={item.player?.imageUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                          {item.player?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium group-hover:text-primary transition-colors">
                          {item.player?.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {item.player?.position}
                          </Badge>
                          <span>{item.team?.name || "Sin equipo"}</span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">
                          {item.player?.overallRating && Number(item.player.overallRating).toFixed(0)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                        onClick={() => item.player && removePlayerFavorite.mutate({ playerId: item.player.id })}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No tienes jugadores guardados
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/players">Explorar jugadores</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
