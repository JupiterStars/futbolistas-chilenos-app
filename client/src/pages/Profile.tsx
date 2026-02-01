import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  Settings,
  Crown,
} from "lucide-react";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [, navigate] = useLocation();

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

  if (authLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <div className="flex items-center gap-6 mb-8">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
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
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-4">Inicia sesión para ver tu perfil</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Accede a tu cuenta para ver tu historial de lectura y gestionar tus favoritos
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

  return (
    <Layout>
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
                onClick={() => {
                  logout();
                  navigate("/");
                }}
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
                    <Skeleton key={i} className="h-16 w-full" />
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
                          <img
                            src={item.news?.imageUrl || "/chile-team-1.jpg"}
                            alt={item.news?.title}
                            className="w-20 h-14 object-cover rounded"
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
                <div className="text-center py-8">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    No has leído ninguna noticia aún
                  </p>
                  <Button asChild variant="outline">
                    <Link href="/">Explorar noticias</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}
