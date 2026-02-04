/**
 * Home.tsx - Página principal integrada
 * Features: OptimizedImage, GridSkeleton, NewsCardSkeleton, useCachedNews
 */
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { GridSkeleton } from "@/components/skeletons";
import { useCachedNews } from "@/hooks/useCachedNews";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  TrendingUp,
  Flame,
  ArrowRight,
  Heart,
} from "lucide-react";

// Category colors mapping
const categoryColors: Record<string, string> = {
  "la-roja": "bg-[#E30613]",
  "extranjero": "bg-[#FFA500]",
  "u20": "bg-[#E30613]",
  "u18": "bg-[#8B5CF6]",
  "u17": "bg-[#3B82F6]",
  "u16": "bg-[#EC4899]",
  "u15": "bg-[#6366F1]",
  "entrevistas": "bg-[#14B8A6]",
  "mercado": "bg-[#F97316]",
};

const categoryNames: Record<string, string> = {
  "la-roja": "LA ROJA",
  "extranjero": "EXTRANJERO",
  "u20": "U20",
  "u18": "U18",
  "u17": "U17",
  "u16": "U16",
  "u15": "U15",
  "entrevistas": "ENTREVISTAS",
  "mercado": "MERCADO",
};

// Hero Carousel Component con OptimizedImage
function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { data: newsList, isLoading } = useCachedNews({ limit: 5 });
  
  // Mapear los datos de cached news al formato esperado
  const featuredNews = newsList?.slice(0, 5).map((item: any) => ({
    news: {
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      imageUrl: item.imageUrl,
      publishedAt: item.publishedAt,
      views: item.views,
    },
    category: item.category
  }));

  useEffect(() => {
    if (!featuredNews?.length) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredNews]);

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
      <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
        <GridSkeleton columns={1} items={1} itemHeight="lg" showImage className="h-full" />
      </div>
    );
  }

  if (!featuredNews || featuredNews.length === 0) {
    return (
      <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/stadium-bg.jpg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end p-6 md:p-10">
          <div className="max-w-2xl">
            <Badge className="mb-3 bg-[#E30613] hover:bg-[#E30613]">Bienvenido</Badge>
            <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3">
              FCH Noticias
            </h1>
            <p className="text-base md:text-lg text-white/80">
              Tu fuente de noticias del fútbol chileno
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentNews = featuredNews[currentSlide];
  const categorySlug = currentNews.category?.slug || "";
  const categoryColor = categoryColors[categorySlug] || "bg-[#E30613]";
  const categoryName = currentNews.category?.name || categoryNames[categorySlug] || "NOTICIAS";

  return (
    <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {/* OptimizedImage para el hero - con priority */}
          <OptimizedImage
            src={currentNews.news.imageUrl || '/stadium-bg.jpg'}
            alt={currentNews.news.title}
            fill
            priority={currentSlide === 0}
            className="absolute inset-0"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          
          <div className="absolute inset-0 flex items-end p-6 md:p-10">
            <div className="max-w-2xl">
              <Badge className={`mb-3 ${categoryColor} hover:${categoryColor} text-white border-0 font-medium text-xs`}>
                {categoryName}
              </Badge>
              <Link href={`/news/${currentNews.news.slug}`}>
                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="font-heading text-2xl md:text-4xl font-bold text-white mb-3 hover:text-white/90 transition-colors cursor-pointer leading-tight"
                >
                  {currentNews.news.title}
                </motion.h1>
              </Link>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-base text-white/80 mb-4 line-clamp-2"
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
                  {new Date(currentNews.news.publishedAt).toLocaleDateString('es-CL', {
                    day: 'numeric',
                    month: 'long'
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {currentNews.news.views.toLocaleString()} vistas
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {featuredNews.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all ${
              index === currentSlide 
                ? "w-6 bg-white" 
                : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// Trending Bar Component
function TrendingBar() {
  const { data: newsList, isLoading } = useCachedNews({ limit: 5 });
  const trendingNews = newsList?.slice(0, 5);

  if (isLoading || !trendingNews?.length) return null;

  return (
    <div className="flex items-center gap-3 py-3 overflow-hidden border-b border-gray-200 dark:border-white/5">
      <Badge className="bg-[#E30613] hover:bg-[#E30613] text-white border-0 shrink-0 font-heading font-bold tracking-wide text-[10px]">
        TENDENCIAS
      </Badge>
      <div className="flex-1 overflow-x-auto scrollbar-hide">
        <div className="flex gap-6">
          {trendingNews.map((item: any, index: number) => (
            <Link 
              key={`${item.id}-${index}`} 
              href={`/news/${item.slug}`}
              className="flex items-center gap-2 shrink-0 hover:text-[#E30613] transition-colors group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#E30613] shrink-0 group-hover:scale-125 transition-transform" />
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px] md:max-w-[300px] whitespace-nowrap">
                {item.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// News Card Component con OptimizedImage
function NewsCard({ news, category, index = 0 }: { 
  news: any; 
  category: any;
  index?: number;
}) {
  const categorySlug = category?.slug || "";
  const categoryColor = categoryColors[categorySlug] || "bg-[#E30613]";
  const categoryName = category?.name || categoryNames[categorySlug] || "NOTICIAS";

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Hace minutos";
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return "Ayer";
    return published.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link href={`/news/${news.slug}`}>
        <article className="group bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-[#E30613]/30 dark:hover:border-[#E30613]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#E30613]/5">
          {/* Image Container con OptimizedImage */}
          <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-white/5">
            <OptimizedImage
              src={news.imageUrl || "/chile-team-1.jpg"}
              alt={news.title}
              fill
              className="group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            {/* Category Badge */}
            <Badge className={`absolute top-3 left-3 ${categoryColor} text-white border-0 text-[10px] font-bold tracking-wider px-2 py-0.5`}>
              {categoryName}
            </Badge>
            {/* Views Badge */}
            <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              {news.views.toLocaleString()}
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-heading font-bold text-base leading-snug mb-2 group-hover:text-[#E30613] transition-colors line-clamp-2">
              {news.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
              {news.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {getRelativeTime(news.publishedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {news.views.toLocaleString()}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

// Category Filter Tabs
function CategoryTabs({ 
  activeCategory, 
  setActiveCategory, 
  categories 
}: { 
  activeCategory: string; 
  setActiveCategory: (id: string) => void;
  categories: any[];
}) {
  const allTabs = [
    { id: "all", name: "Todas", icon: Flame },
    ...(categories?.slice(0, 4).map(cat => ({ 
      id: cat.id.toString(), 
      name: cat.name,
      icon: null 
    })) || []),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {allTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeCategory === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              isActive
                ? "bg-[#E30613] text-white shadow-lg shadow-[#E30613]/20"
                : "bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            {Icon && <Icon className="w-4 h-4" />}
            {tab.name}
          </button>
        );
      })}
    </div>
  );
}

// News Grid Section con GridSkeleton
function NewsGrid() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: newsList, isLoading } = useCachedNews({
    categoryId: activeCategory !== "all" ? activeCategory : undefined,
    limit: 8,
  });

  return (
    <section className="py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-[#E30613] rounded-full" />
          <h2 className="font-heading text-xl md:text-2xl font-bold">Últimas Noticias</h2>
        </div>
        <Link href="/news">
          <span className="text-sm text-gray-500 hover:text-[#E30613] transition-colors flex items-center gap-1">
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <CategoryTabs 
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categories={categories || []}
        />
      </div>

      {/* Grid con Skeleton o Contenido */}
      {isLoading ? (
        <GridSkeleton columns={4} items={8} itemHeight="md" showImage />
      ) : newsList && newsList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {newsList.map((item: any, index: number) => (
            <NewsCard 
              key={item.id} 
              news={item} 
              category={item.category}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-xl">
          <p className="text-gray-500">No hay noticias disponibles</p>
        </div>
      )}
    </section>
  );
}

// Categories Grid Section
function CategoriesGrid() {
  const categoryLinks = [
    { slug: "la-roja", name: "LA ROJA" },
    { slug: "extranjero", name: "Extranjero" },
    { slug: "u20", name: "U20" },
    { slug: "u18", name: "U18" },
    { slug: "u17", name: "U17" },
    { slug: "u16", name: "U16" },
    { slug: "u15", name: "U15" },
    { slug: "entrevistas", name: "Entrevistas" },
    { slug: "mercado", name: "Mercado de Pases" },
  ];

  return (
    <section className="py-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-[#E30613] rounded-full" />
        <h2 className="font-heading text-xl md:text-2xl font-bold">Explora por Categoría</h2>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {categoryLinks.map((cat, index) => (
          <motion.div
            key={cat.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/category/${cat.slug}`}>
              <div className="group bg-white dark:bg-[#111] border border-gray-200 dark:border-white/5 rounded-xl p-4 text-center hover:border-[#E30613]/30 dark:hover:border-[#E30613]/30 transition-all duration-300 hover:shadow-lg cursor-pointer">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-[#E30613] transition-colors">
                  {cat.name}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Support Section
function SupportSection() {
  return (
    <section className="py-6">
      <div className="bg-[#E30613] rounded-2xl p-6 md:p-8 text-center">
        {/* Heart icon centered at top */}
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-6 h-6 text-white" />
        </div>
        
        <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
          Apoya Nuestro Trabajo
        </h3>
        <p className="text-white/80 text-sm md:text-base mb-6 max-w-md mx-auto">
          Gracias a ti este proyecto se mantiene vivo
        </p>
        
        {/* White button with red text */}
        <Link href="/support">
          <Button 
            className="bg-white text-[#E30613] hover:bg-white/90 rounded-full px-8 font-semibold shadow-lg w-full max-w-xs"
          >
            <Heart className="w-4 h-4 mr-2 fill-[#E30613]" />
            Apoyar Ahora
          </Button>
        </Link>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout>
      <div className="container">
        <HeroCarousel />
        <TrendingBar />
        <NewsGrid />
        <CategoriesGrid />
        <SupportSection />
      </div>
    </Layout>
  );
}
