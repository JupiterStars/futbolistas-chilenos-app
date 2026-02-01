import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  Share2,
  Calendar,
  MapPin,
  Ruler,
  Weight,
  Trophy,
  Target,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

function SkillsRadar({ player }: { player: any }) {
  const data = [
    { skill: "Ritmo", value: player.pace || 50, fullMark: 100 },
    { skill: "Tiro", value: player.shooting || 50, fullMark: 100 },
    { skill: "Pase", value: player.passing || 50, fullMark: 100 },
    { skill: "Regate", value: player.dribbling || 50, fullMark: 100 },
    { skill: "Defensa", value: player.defending || 50, fullMark: 100 },
    { skill: "Físico", value: player.physical || 50, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis 
          dataKey="skill" 
          tick={{ fill: "var(--foreground)", fontSize: 12 }}
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
        />
        <Radar
          name="Habilidades"
          dataKey="value"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.3}
          strokeWidth={2}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

function StatCard({ icon: Icon, label, value, color = "primary" }: {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="bg-muted rounded-lg p-4 text-center">
      <Icon className={`w-5 h-5 mx-auto mb-2 text-${color}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function PlayerDetail() {
  const params = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  
  const { data, isLoading } = trpc.players.getBySlug.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug }
  );

  const { data: playerNews } = trpc.players.getNews.useQuery(
    { playerId: data?.player.id || 0, limit: 5 },
    { enabled: !!data?.player.id }
  );

  const { data: isFavorited } = trpc.favorites.players.check.useQuery(
    { playerId: data?.player.id || 0 },
    { enabled: !!data?.player.id && isAuthenticated }
  );

  const utils = trpc.useUtils();
  const toggleFavorite = trpc.favorites.players.toggle.useMutation({
    onSuccess: (result) => {
      utils.favorites.players.check.invalidate({ playerId: data?.player.id });
      toast.success(result.isFavorited ? "Añadido a favoritos" : "Eliminado de favoritos");
    },
  });

  const handleShare = async () => {
    try {
      await navigator.share({
        title: data?.player.name,
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Skeleton className="h-[500px] rounded-xl" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-[300px] rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Jugador no encontrado</h1>
          <Link href="/players">
            <Button>Ver todos los jugadores</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const { player, team } = data;

  return (
    <Layout>
      <div className="container py-8">
        {/* Back button */}
        <Link href="/players">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a jugadores
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                <div className="aspect-[3/4] relative">
                  <img
                    src={player.imageUrl || "/player-profile.jpg"}
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  
                  {/* Rating */}
                  <div className="absolute top-4 right-4 w-16 h-16 rounded-full gradient-chile flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">
                      {Number(player.overallRating).toFixed(0)}
                    </span>
                  </div>

                  {/* Info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <Badge className="mb-2">{player.position}</Badge>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {player.name}
                    </h1>
                    <p className="text-white/70">{team?.name || "Sin equipo"}</p>
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Action buttons */}
                  <div className="flex gap-2 mb-4">
                    {isAuthenticated && (
                      <Button
                        variant={isFavorited ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => toggleFavorite.mutate({ playerId: player.id })}
                      >
                        <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                        {isFavorited ? "Favorito" : "Seguir"}
                      </Button>
                    )}
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Basic info */}
                  <div className="space-y-3 text-sm">
                    {player.age && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{player.age} años</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{player.nationality || "Chile"}</span>
                    </div>
                    {player.height && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Ruler className="w-4 h-4" />
                        <span>{player.height} cm</span>
                      </div>
                    )}
                    {player.weight && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Weight className="w-4 h-4" />
                        <span>{player.weight} kg</span>
                      </div>
                    )}
                    {player.preferredFoot && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>Pie preferido: {player.preferredFoot}</span>
                      </div>
                    )}
                    {player.marketValue && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>€{Number(player.marketValue).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Tabs defaultValue="stats" className="w-full">
              <TabsList className="w-full justify-start mb-6">
                <TabsTrigger value="stats">Estadísticas</TabsTrigger>
                <TabsTrigger value="skills">Habilidades</TabsTrigger>
                <TabsTrigger value="news">Noticias</TabsTrigger>
              </TabsList>

              <TabsContent value="stats">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Estadísticas de Temporada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatCard 
                        icon={Target} 
                        label="Goles" 
                        value={player.goals} 
                        color="primary"
                      />
                      <StatCard 
                        icon={Users} 
                        label="Asistencias" 
                        value={player.assists}
                        color="secondary" 
                      />
                      <StatCard 
                        icon={Trophy} 
                        label="Partidos" 
                        value={player.matches} 
                      />
                      <StatCard 
                        icon={Clock} 
                        label="Minutos" 
                        value={player.minutesPlayed.toLocaleString()} 
                      />
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-semibold mb-4">Disciplina</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                          <div className="w-6 h-8 bg-yellow-500 rounded" />
                          <div>
                            <p className="font-bold">{player.yellowCards}</p>
                            <p className="text-xs text-muted-foreground">Amarillas</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                          <div className="w-6 h-8 bg-red-500 rounded" />
                          <div>
                            <p className="font-bold">{player.redCards}</p>
                            <p className="text-xs text-muted-foreground">Rojas</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle>Radar de Habilidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SkillsRadar player={player} />
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                      {[
                        { label: "Ritmo", value: player.pace },
                        { label: "Tiro", value: player.shooting },
                        { label: "Pase", value: player.passing },
                        { label: "Regate", value: player.dribbling },
                        { label: "Defensa", value: player.defending },
                        { label: "Físico", value: player.physical },
                      ].map((skill) => (
                        <div key={skill.label} className="bg-muted rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm">{skill.label}</span>
                            <span className="font-bold">{skill.value}</span>
                          </div>
                          <div className="h-2 bg-background rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${skill.value}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-full gradient-chile rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="news">
                <Card>
                  <CardHeader>
                    <CardTitle>Noticias Relacionadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {playerNews && playerNews.length > 0 ? (
                      <div className="space-y-4">
                        {playerNews.map((item) => (
                          <Link key={item.news.id} href={`/news/${item.news.slug}`}>
                            <div className="flex gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                              <img
                                src={item.news.imageUrl || "/chile-team-1.jpg"}
                                alt={item.news.title}
                                className="w-24 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                                  {item.news.title}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(item.news.publishedAt).toLocaleDateString('es-CL')}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No hay noticias relacionadas
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
