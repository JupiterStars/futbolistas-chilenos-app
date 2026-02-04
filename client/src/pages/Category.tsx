/**
 * Category.tsx - Página de categoría integrada
 * Features: OptimizedImage, GridSkeleton, InfiniteScroll, EmptyState
 */
import { useState, useCallback } from "react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { OptimizedImage } from "@/components/OptimizedImage";
import { GridSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { useCachedNews } from "@/hooks/useCachedNews";
import {
  Clock,
  Eye,
  TrendingUp,
  ChevronLeft,
  Newspaper,
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
  "extranjero": "Extranjero",
  "u20": "U20",
  "u18": "U18",
  "u17": "U17",
  "u16": "U16",
  "u15": "U15",
  "entrevistas": "Entrevistas",
  "mercado": "Mercado de Pases",
};

const categoryDescriptions: Record<string, string> = {
  "la-roja": "Toda la información sobre la Selección Chilena. Partidos, convocatorias, resultados y noticias de La Roja.",
  "extranjero": "Chilenos jugando en el exterior. Sigue la actuación de nuestros jugadores en las mejores ligas del mundo.",
  "u20": "Noticias de la selección sub-20. Los futuros talentos del fútbol chileno.",
  "u18": "Cobertura de la selección sub-18. Las promesas juveniles de La Roja.",
  "u17": "Información de la selección sub-17. Jóvenes talentos en formación.",
  "u16": "Noticias de la selección sub-16. La base del fútbol chileno.",
  "u15": "Cobertura de la selección sub-15. Los más jóvenes representando a Chile.",
  "entrevistas": "Entrevistas exclusivas con jugadores, técnicos y personalidades del fútbol chileno.",
  "mercado": "Todo sobre el mercado de fichajes. Rumores, confirmaciones y movimientos de jugadores chilenos.",
};

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
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/news/${news.slug}`}>
        <article className="group bg-white dark:bg-[#111] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-[#E30613]/30 dark:hover:border-[#E30613]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#E30613]/5">
          {/* Image Container con OptimizedImage */}
          <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-white/5">
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

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: categoriesResponse } = trpc.categories.list.useQuery({ limit: 100 });
  const categories = (categoriesResponse as any)?.items || [];
  const { data: allNews, isLoading } = useCachedNews({
    limit: 100,
  });

  // Find category by slug
  const category = categories?.find((c: any) => c.slug === slug);
  const categoryColor = categoryColors[slug || ""] || "bg-[#E30613]";
  const categoryName = category?.name || categoryNames[slug || ""] || (slug || "").toUpperCase();
  const categoryDescription = categoryDescriptions[slug || ""] || `Noticias de ${categoryName}`;

  // Filter news by category
  const filteredNews = allNews?.filter((item: any) => item.category?.slug === slug) || [];
  
  // Pagination
  const totalPages = Math.ceil(filteredNews.length / limit);
  const paginatedNews = filteredNews.slice((page - 1) * limit, page * limit);
  
  const hasMore = page < totalPages;

  const loadMore = useCallback(async () => {
    if (hasMore && !isLoading) {
      setPage(p => p + 1);
    }
  }, [hasMore, isLoading]);

  return (
    <Layout>
      <div className="container py-6">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="w-4 h-4" />
              Volver al inicio
            </Button>
          </Link>
        </motion.div>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl mb-8"
        >
          <div className={`${categoryColor} p-6 md:p-10`}>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Newspaper className="w-6 h-6 text-white" />
                </div>
                <Badge className="bg-white/20 text-white border-0">
                  Categoría
                </Badge>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">
                {categoryName}
              </h1>
              <p className="text-white/80 max-w-2xl text-base md:text-lg">
                {categoryDescription}
              </p>
              <div className="mt-4 flex items-center gap-4 text-white/60 text-sm">
                <span>{filteredNews.length} noticias</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* News Grid con InfiniteScroll */}
        {isLoading ? (
          <GridSkeleton columns={4} items={8} itemHeight="md" showImage />
        ) : paginatedNews.length > 0 ? (
          <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedNews.map((item: any, index: number) => (
                <NewsCard 
                  key={item.id} 
                  news={item} 
                  category={item.category}
                  index={index}
                />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <EmptyState
            type="news"
            title={`No hay noticias en ${categoryName}`}
            description="Aún no tenemos noticias en esta categoría. Vuelve pronto para más contenido."
            action={
              <Link href="/">
                <Button>Ver todas las noticias</Button>
              </Link>
            }
          />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Siguiente
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}
