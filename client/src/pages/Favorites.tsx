/**
 * Favorites.tsx - Favoritos integrado
 * Features: OptimizedImage, EmptyState, useOfflineData, toast
 */
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OptimizedImage } from "@/components/OptimizedImage";
import { EmptyState } from "@/components/EmptyState";
import { useOfflineData } from "@/hooks/useOfflineData";
import { toast } from "@/lib/toast";
import { getLoginUrl } from "@/const";
import {
  Heart,
  Newspaper,
  Users,
  Clock,
  Eye,
  Trash2,
  LogIn,
  Wifi,
  WifiOff,
} from "lucide-react";

export default function Favorites() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const { isOnline, isSyncing, pendingSyncCount, syncNow } = useOfflineData();

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

  // Sincronizar cuando vuelve online
  useEffect(() => {
    if (isOnline && pendingSyncCount > 0) {
      syncNow().then(() => {
        toast.success("Favoritos sincronizados");
      });
    }
  }, [isOnline, pendingSyncCount, syncNow]);

  // Mostrar toast de estado offline
  useEffect(() => {
    if (!isOnline) {
      toast.warning("Estás offline. Los cambios se sincronizarán cuando vuelvas a conectarte.");
    }
  }, [isOnline]);

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="h-12 w-48 bg-muted rounded animate-pulse mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 w-full bg-muted rounded animate-pulse" />
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
          <EmptyState
            type="empty"
            title="Inicia sesión para ver tus favoritos"
            description="Guarda tus noticias y jugadores favoritos para acceder a ellos rápidamente"
            action={
              <Button asChild size="lg">
                <a href={getLoginUrl()}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </a>
              </Button>
            }
          />
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
          
          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-2">
            {isOnline ? (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <Wifi className="w-3 h-3" />
                En línea
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-amber-600">
                <WifiOff className="w-3 h-3" />
                Offline
              </span>
            )}
            {pendingSyncCount > 0 && (
              <span className="text-xs text-muted-foreground">
                • {pendingSyncCount} pendiente{pendingSyncCount !== 1 ? "s" : ""} de sincronizar
              </span>
            )}
            {isSyncing && (
              <span className="text-xs text-primary">• Sincronizando...</span>
            )}
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
                  <div key={i} className="h-24 w-full bg-muted rounded animate-pulse" />
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
                      <OptimizedImage
                        src={item.news?.imageUrl || "/chile-team-1.jpg"}
                        alt={item.news?.title || "Noticia"}
                        width={112}
                        height={80}
                        className="object-cover rounded"
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
              <EmptyState
                type="news"
                title="No tienes noticias guardadas"
                description="Guarda tus noticias favoritas para acceder a ellas rápidamente"
                action={
                  <Button asChild variant="outline">
                    <Link href="/">Explorar noticias</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>

          {/* Favorite Players */}
          <TabsContent value="players">
            {loadingPlayers ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 w-full bg-muted rounded animate-pulse" />
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
              <EmptyState
                type="players"
                title="No tienes jugadores guardados"
                description="Sigue a tus jugadores favoritos para tenerlos siempre a mano"
                action={
                  <Button asChild variant="outline">
                    <Link href="/players">Explorar jugadores</Link>
                  </Button>
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
