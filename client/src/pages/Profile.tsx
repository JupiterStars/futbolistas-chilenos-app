/**
 * Profile.tsx - Perfil de usuario integrado
 * Features: OptimizedImage, LoadingOverlay, toast
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { OptimizedImage } from "@/components/OptimizedImage";
import { FullScreenLoading } from "@/components/LoadingOverlay";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "@/lib/toast";
import { getLoginUrl } from "@/const";
import {
  User,
  Mail,
  Calendar,
  Clock,
  Eye,
  Heart,
  History,
  LogIn,
  LogOut,
  Crown,
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { data: history, isLoading: loadingHistory } = trpc.history.list.useQuery(
    { limit: 10 },
    { enabled: isAuthenticated }
  );

  const { data: favoriteNewsCount } = trpc.favorites.news.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: favoritePlayersCount } = trpc.favorites.players.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
      navigate("/");
    } catch (error) {
      toast.error("Error al cerrar sesión");
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-muted rounded-full animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded animate-pulse" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
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
            title="Inicia sesión para ver tu perfil"
            description="Accede a tu cuenta para ver tu historial de lectura y gestionar tus favoritos"
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

  return (
    <Layout>
      <FullScreenLoading isLoading={isLoggingOut} text="Cerrando sesión..." />
      <div className="container py-8 max-w-4xl">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 md:w-32 md:h-32">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold">{user?.name}</h1>
                {user?.role === "admin" && (
                  <Badge className="bg-gold text-black">
                    <Crown className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 text-muted-foreground">
                {user?.email && (
                  <p className="flex items-center justify-center md:justify-start gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                )}
                <p className="flex items-center justify-center md:justify-start gap-2">
                  <Calendar className="w-4 h-4" />
                  Miembro desde {user?.createdAt && new Date(user.createdAt).toLocaleDateString('es-CL', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{history?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Noticias leídas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{favoriteNewsCount?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Noticias guardadas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-2">
              <User className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold">{favoritePlayersCount?.length || 0}</p>
            <p className="text-xs text-muted-foreground">Jugadores seguidos</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-xl border border-border p-4 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-2">
              <Crown className="w-5 h-5 text-gold" />
            </div>
            <p className="text-2xl font-bold">Free</p>
            <p className="text-xs text-muted-foreground">Plan actual</p>
          </motion.div>
        </div>

        {/* Reading history */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Historial de Lectura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 w-full bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item, index) => (
                    <motion.div
                      key={item.history.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/news/${item.news?.slug}`}>
                        <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                          <OptimizedImage
                            src={item.news?.imageUrl || "/chile-team-1.jpg"}
                            alt={item.news?.title || "Noticia"}
                            width={80}
                            height={56}
                            className="object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-1 hover:text-primary transition-colors">
                              {item.news?.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              {item.category && (
                                <Badge variant="outline" className="text-xs">
                                  {item.category.name}
                                </Badge>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Leído {new Date(item.history.readAt).toLocaleDateString('es-CL')}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                      {index < history.length - 1 && <Separator className="mt-4" />}
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  type="empty"
                  title="No has leído ninguna noticia aún"
                  description="Tu historial de lectura aparecerá aquí"
                  action={
                    <Button asChild variant="outline">
                      <Link href="/">Explorar noticias</Link>
                    </Button>
                  }
                  compact
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
