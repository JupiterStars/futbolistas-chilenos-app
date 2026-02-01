import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  TrendingUp,
  Trophy,
  Users,
  ArrowRight,
} from "lucide-react";

// Hero Carousel Component
function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: featuredNews, isLoading } = trpc.news.featured.useQuery({ limit: 5 });

  const nextSlide = () => {
    if (featuredNews) {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }
  };

  const prevSlide = () => {
    if (featuredNews) {
      setCurrentSlide((prev) => (prev - 1 + featuredNews.length) % featuredNews.length);
    }
  };

  if (isLoading) {
    return (
      <div className="relative h-[500px] md:h-[600px] bg-muted rounded-2xl overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  if (!featuredNews || featuredNews.length === 0) {
    return (
      <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/stadium-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end p-8 md:p-12">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-primary">Bienvenido</Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Chilenos Young
            </h1>
            <p className="text-lg text-white/80 mb-6">
              La plataforma definitiva para seguir a las jóvenes promesas del fútbol chileno
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentNews = featuredNews[currentSlide];

  return (
    <div className="relative h-[500px] md:h-[600px] rounded-2xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ 
              backgroundImage: `url(${currentNews.news.imageUrl || '/stadium-bg.jpg'})` 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
          </div>
          <div className="absolute inset-0 flex items-end p-8 md:p-12">
            <div className="max-w-2xl">
              {currentNews.category && (
                <Badge className="mb-4 bg-primary">{currentNews.category.name}</Badge>
              )}
              <Link href={`/news/${currentNews.news.slug}`}>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-5xl font-bold text-white mb-4 hover:text-primary transition-colors cursor-pointer"
                >
                  {currentNews.news.title}
                </motion.h1>
              </Link>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-white/80 mb-6 line-clamp-2"
              >
                {currentNews.news.excerpt}
              </motion.p>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center gap-4 text-white/60 text-sm"
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(currentNews.news.publishedAt).toLocaleDateString('es-CL')}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {currentNews.news.views} vistas
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredNews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide 
                ? "w-8 bg-primary" 
                : "bg-white/50 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// News Card Component
function NewsCard({ news, category, featured = false }: { 
  news: any; 
  category: any; 
  featured?: boolean;
}) {
  return (
    <Link href={`/news/${news.slug}`}>
      <motion.article
        whileHover={{ y: -5 }}
        className={`group bg-card rounded-xl overflow-hidden border border-border card-hover ${
          featured ? "md:col-span-2 md:row-span-2" : ""
        }`}
      >
        <div className={`relative overflow-hidden ${featured ? "h-64 md:h-80" : "h-48"}`}>
          <img
            src={news.imageUrl || "/chile-team-1.jpg"}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          {category && (
            <Badge className="absolute top-4 left-4 bg-primary">
              {category.name}
            </Badge>
          )}
          {news.isPremium && (
            <Badge className="absolute top-4 right-4 bg-gold text-black">
              Premium
            </Badge>
          )}
        </div>
        <div className="p-4">
          <h3 className={`font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 ${
            featured ? "text-xl md:text-2xl" : "text-lg"
          }`}>
            {news.title}
          </h3>
          {featured && news.excerpt && (
            <p className="text-muted-foreground mb-3 line-clamp-2">
              {news.excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(news.publishedAt).toLocaleDateString('es-CL')}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {news.views}
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}

// News Grid Component
function NewsGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: newsList, isLoading } = trpc.news.list.useQuery({
    categoryId: activeCategory !== "all" ? parseInt(activeCategory) : undefined,
    limit: 9,
  });

  return (
    <section className="py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Últimas Noticias</h2>
          <p className="text-muted-foreground">
            Mantente al día con las novedades del fútbol chileno
          </p>
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">Todas</TabsTrigger>
            {categories?.slice(0, 4).map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id.toString()}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden border border-border">
              <Skeleton className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : newsList && newsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsList.map((item, index) => (
            <NewsCard 
              key={item.news.id} 
              news={item.news} 
              category={item.category}
              featured={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay noticias disponibles</p>
        </div>
      )}

      <div className="text-center mt-8">
        <Button variant="outline" size="lg" className="rounded-full">
          Ver más noticias
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}

// Quick Stats Component
function QuickStats() {
  const { data: topScorers } = trpc.leaderboards.topScorers.useQuery({ limit: 3 });
  const { data: topRated } = trpc.leaderboards.topRated.useQuery({ limit: 3 });

  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Scorers */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Top Goleadores</h3>
              <p className="text-sm text-muted-foreground">Temporada 2025</p>
            </div>
          </div>
          <div className="space-y-4">
            {topScorers?.slice(0, 3).map((item, index) => (
              <Link key={item.player.id} href={`/players/${item.player.slug}`}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? "bg-gold text-black" :
                    index === 1 ? "bg-silver text-black" :
                    "bg-bronze text-white"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.player.name}</p>
                    <p className="text-sm text-muted-foreground">{item.team?.shortName || "Sin equipo"}</p>
                  </div>
                  <span className="text-2xl font-bold text-primary">{item.player.goals}</span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/leaderboards">
            <Button variant="ghost" className="w-full mt-4">
              Ver ranking completo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Top Rated */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-xl border border-border p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Mejor Valorados</h3>
              <p className="text-sm text-muted-foreground">Rating general</p>
            </div>
          </div>
          <div className="space-y-4">
            {topRated?.slice(0, 3).map((item, index) => (
              <Link key={item.player.id} href={`/players/${item.player.slug}`}>
                <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? "bg-gold text-black" :
                    index === 1 ? "bg-silver text-black" :
                    "bg-bronze text-white"
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{item.player.name}</p>
                    <p className="text-sm text-muted-foreground">{item.player.position}</p>
                  </div>
                  <span className="text-2xl font-bold text-secondary">
                    {Number(item.player.overallRating).toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/leaderboards">
            <Button variant="ghost" className="w-full mt-4">
              Ver ranking completo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// Featured Players Component
function FeaturedPlayers() {
  const { data: players, isLoading } = trpc.players.list.useQuery({ 
    limit: 4, 
    orderBy: "rating" 
  });

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">Jugadores Destacados</h2>
          <p className="text-muted-foreground">Las jóvenes promesas del fútbol chileno</p>
        </div>
        <Link href="/players">
          <Button variant="outline" className="rounded-full">
            Ver todos
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {players?.map((item) => (
            <Link key={item.player.id} href={`/players/${item.player.slug}`}>
              <motion.div
                whileHover={{ y: -10 }}
                className="group relative bg-card rounded-xl overflow-hidden border border-border card-hover"
              >
                <div className="aspect-[3/4] relative">
                  <img
                    src={item.player.imageUrl || "/player-profile.jpg"}
                    alt={item.player.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.player.position}
                      </Badge>
                      <span className="text-xs text-white/70">
                        {item.player.age} años
                      </span>
                    </div>
                    <h3 className="font-bold text-white text-lg">
                      {item.player.name}
                    </h3>
                    <p className="text-sm text-white/70">
                      {item.team?.name || "Sin equipo"}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <span className="font-bold text-primary-foreground">
                      {Number(item.player.overallRating).toFixed(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      <div className="container py-8">
        <HeroCarousel />
        <NewsGrid />
        <QuickStats />
        <FeaturedPlayers />
      </div>
    </Layout>
  );
}
