/**
 * NewsList.tsx - Listado de noticias integrado
 * Features: OptimizedImage, GridSkeleton, InfiniteScroll, EmptyState
 */
import { useState, useCallback } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { OptimizedImage } from "@/components/OptimizedImage";
import { GridSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { InfiniteScroll } from "@/components/InfiniteScroll";
import { useCachedNews } from "@/hooks/useCachedNews";
import { toast } from "@/lib/toast";
import {
  Clock,
  Eye,
  TrendingUp,
  ChevronLeft,
  Search,
  Filter,
  Newspaper,
  Calendar,
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

export default function NewsList() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const limit = 12;

  const { data: categories } = trpc.categories.list.useQuery();
  
  // Usar InfiniteScroll con paginación
  const { data: allNews, isLoading, error } = trpc.news.list.useQuery({
    limit: page * limit,
  });

  // Manejar error de red
  if (error && !isLoading) {
    toast.error("Error al cargar noticias. Intenta nuevamente.");
  }

  // Filter and search news
  let filteredNews = allNews || [];
  
  if (selectedCategory) {
    filteredNews = filteredNews.filter((item: any) => item.category?.slug === selectedCategory);
  }
  
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredNews = filteredNews.filter((item: any) => 
      item.news.title.toLowerCase().includes(query) ||
      item.news.excerpt.toLowerCase().includes(query)
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / limit);
  const paginatedNews = filteredNews.slice((page - 1) * limit, page * limit);
  
  const hasMore = page < totalPages;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#E30613]/10 flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-[#E30613]" />
            </div>
            <div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">
                Todas las Noticias
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                {filteredNews.length} noticias disponibles
              </p>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111] rounded-xl p-4 border border-gray-200 dark:border-white/5 mb-8"
        >
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar noticias..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" className="bg-[#E30613] hover:bg-[#c70510]">
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </form>

          {/* Category Filter */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Filtrar por categoría:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => { setSelectedCategory(null); setPage(1); }}
                className={selectedCategory === null ? "bg-[#E30613] hover:bg-[#c70510]" : ""}
              >
                Todas
              </Button>
              {categories?.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.slug ? "default" : "outline"}
                  size="sm"
                  onClick={() => { setSelectedCategory(cat.slug); setPage(1); }}
                  className={selectedCategory === cat.slug ? "bg-[#E30613] hover:bg-[#c70510]" : ""}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* News Grid con InfiniteScroll */}
        {isLoading && page === 1 ? (
          <GridSkeleton columns={4} items={8} itemHeight="md" showImage />
        ) : paginatedNews.length > 0 ? (
          <InfiniteScroll onLoadMore={loadMore} hasMore={hasMore}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedNews.map((item: any, index: number) => (
                <NewsCard 
                  key={item.news.id} 
                  news={item.news} 
                  category={item.category}
                  index={index}
                />
              ))}
            </div>
          </InfiniteScroll>
        ) : (
          <EmptyState 
            type="search" 
            title={searchQuery ? "No se encontraron resultados" : "No hay noticias disponibles"}
            description={searchQuery 
              ? "Intenta con otros términos de búsqueda o filtros diferentes" 
              : "Aún no hay noticias publicadas en esta categoría"}
            action={
              searchQuery ? (
                <Button onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                  Limpiar filtros
                </Button>
              ) : undefined
            }
          />
        )}

        {/* Pagination (fallback si InfiniteScroll no funciona) */}
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
