/**
 * Leaderboards.tsx - Rankings de jugadores integrado
 * Features: ListSkeleton, EmptyState, OptimizedImage
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OptimizedImage } from "@/components/OptimizedImage";
import { ListSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { Trophy, Target, Users, Star, Medal } from "lucide-react";

function LeaderboardRow({ 
  player, 
  team, 
  rank, 
  value, 
  label 
}: { 
  player: any; 
  team: any; 
  rank: number; 
  value: number | string;
  label: string;
}) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return "bg-gold text-black";
    if (rank === 2) return "bg-silver text-black";
    if (rank === 3) return "bg-bronze text-white";
    return "bg-muted text-muted-foreground";
  };

  return (
    <Link href={`/players/${player.slug}`}>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: rank * 0.05 }}
        whileHover={{ x: 5 }}
        className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-colors ${
          rank <= 3 ? "bg-muted/50" : "hover:bg-muted/30"
        }`}
      >
        {/* Rank */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getMedalColor(rank)}`}>
          {rank <= 3 ? <Medal className="w-5 h-5" /> : rank}
        </div>

        {/* Player info */}
        <Avatar className="w-12 h-12">
          <AvatarImage src={player.imageUrl || undefined} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {player.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <p className="font-semibold hover:text-primary transition-colors">
            {player.name}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{team?.shortName || team?.name || "Sin equipo"}</span>
            <span>•</span>
            <span>{player.position}</span>
          </div>
        </div>

        {/* Value */}
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </motion.div>
    </Link>
  );
}

function TopThreePodium({ data, valueKey, label }: { 
  data: any[]; 
  valueKey: string;
  label: string;
}) {
  if (!data || data.length < 3) return null;

  const [first, second, third] = data;

  return (
    <div className="flex items-end justify-center gap-4 mb-8 py-8">
      {/* Second place */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <Link href={`/players/${second.player.slug}`}>
          <div className="relative mb-2">
            <Avatar className="w-20 h-20 border-4 border-silver mx-auto">
              <AvatarImage src={second.player.imageUrl || undefined} />
              <AvatarFallback className="text-2xl">{second.player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-silver flex items-center justify-center font-bold text-black">
              2
            </div>
          </div>
          <p className="font-semibold mt-4">{second.player.name}</p>
          <p className="text-sm text-muted-foreground">{second.team?.shortName}</p>
          <p className="text-xl font-bold text-secondary mt-1">
            {second.player[valueKey]}
          </p>
        </Link>
        <div className="h-24 w-24 mx-auto bg-silver/20 rounded-t-lg mt-2" />
      </motion.div>

      {/* First place */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <Link href={`/players/${first.player.slug}`}>
          <div className="relative mb-2">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Trophy className="w-8 h-8 text-gold" />
            </div>
            <Avatar className="w-24 h-24 border-4 border-gold mx-auto">
              <AvatarImage src={first.player.imageUrl || undefined} />
              <AvatarFallback className="text-3xl">{first.player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gold flex items-center justify-center font-bold text-black">
              1
            </div>
          </div>
          <p className="font-bold text-lg mt-4">{first.player.name}</p>
          <p className="text-sm text-muted-foreground">{first.team?.shortName}</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {first.player[valueKey]}
          </p>
        </Link>
        <div className="h-32 w-28 mx-auto bg-gold/20 rounded-t-lg mt-2" />
      </motion.div>

      {/* Third place */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <Link href={`/players/${third.player.slug}`}>
          <div className="relative mb-2">
            <Avatar className="w-20 h-20 border-4 border-bronze mx-auto">
              <AvatarImage src={third.player.imageUrl || undefined} />
              <AvatarFallback className="text-2xl">{third.player.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-bronze flex items-center justify-center font-bold text-white">
              3
            </div>
          </div>
          <p className="font-semibold mt-4">{third.player.name}</p>
          <p className="text-sm text-muted-foreground">{third.team?.shortName}</p>
          <p className="text-xl font-bold text-bronze mt-1">
            {third.player[valueKey]}
          </p>
        </Link>
        <div className="h-16 w-24 mx-auto bg-bronze/20 rounded-t-lg mt-2" />
      </motion.div>
    </div>
  );
}

export default function Leaderboards() {
  const [activeTab, setActiveTab] = useState("goals");

  const { data: topScorers, isLoading: loadingScorers } = trpc.leaderboards.topScorers.useQuery({ limit: 20 });
  const { data: topAssisters, isLoading: loadingAssisters } = trpc.leaderboards.topAssisters.useQuery({ limit: 20 });
  const { data: topRated, isLoading: loadingRated } = trpc.leaderboards.topRated.useQuery({ limit: 20 });

  const isLoading = loadingScorers || loadingAssisters || loadingRated;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full gradient-chile flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Rankings</h1>
          <p className="text-muted-foreground">
            Los mejores jugadores chilenos de la temporada 2025
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-center mb-8">
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goleadores
            </TabsTrigger>
            <TabsTrigger value="assists" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Asistentes
            </TabsTrigger>
            <TabsTrigger value="rating" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Mejor Valorados
            </TabsTrigger>
          </TabsList>

          {/* Top Scorers */}
          <TabsContent value="goals">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Top Goleadores
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingScorers ? (
                  <ListSkeleton items={10} showAvatar showIcon />
                ) : topScorers && topScorers.length > 0 ? (
                  <>
                    <TopThreePodium data={topScorers} valueKey="goals" label="goles" />
                    <div className="space-y-2">
                      {topScorers.slice(3).map((item, index) => (
                        <LeaderboardRow
                          key={item.player.id}
                          player={item.player}
                          team={item.team}
                          rank={index + 4}
                          value={item.player.goals}
                          label="goles"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState 
                    type="players" 
                    title="No hay datos disponibles"
                    description="Aún no hay estadísticas de goleadores"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Assisters */}
          <TabsContent value="assists">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Top Asistentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAssisters ? (
                  <ListSkeleton items={10} showAvatar showIcon />
                ) : topAssisters && topAssisters.length > 0 ? (
                  <>
                    <TopThreePodium data={topAssisters} valueKey="assists" label="asistencias" />
                    <div className="space-y-2">
                      {topAssisters.slice(3).map((item, index) => (
                        <LeaderboardRow
                          key={item.player.id}
                          player={item.player}
                          team={item.team}
                          rank={index + 4}
                          value={item.player.assists}
                          label="asistencias"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState 
                    type="players" 
                    title="No hay datos disponibles"
                    description="Aún no hay estadísticas de asistentes"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Rated */}
          <TabsContent value="rating">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-gold" />
                  Mejor Valorados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRated ? (
                  <ListSkeleton items={10} showAvatar showIcon />
                ) : topRated && topRated.length > 0 ? (
                  <>
                    <TopThreePodium 
                      data={topRated.map(item => ({
                        ...item,
                        player: {
                          ...item.player,
                          overallRating: Number(item.player.overallRating).toFixed(1)
                        }
                      }))} 
                      valueKey="overallRating" 
                      label="rating" 
                    />
                    <div className="space-y-2">
                      {topRated.slice(3).map((item, index) => (
                        <LeaderboardRow
                          key={item.player.id}
                          player={item.player}
                          team={item.team}
                          rank={index + 4}
                          value={Number(item.player.overallRating).toFixed(1)}
                          label="rating"
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <EmptyState 
                    type="players" 
                    title="No hay datos disponibles"
                    description="Aún no hay ratings de jugadores"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
