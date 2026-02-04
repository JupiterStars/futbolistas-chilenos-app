/**
 * NewsDetail.tsx - Detalle de noticia integrado
 * Features: OptimizedImage, DetailSkeleton, useCachedNewsBySlug, toast
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { OptimizedImage } from "@/components/OptimizedImage";
import { DetailSkeleton } from "@/components/skeletons";
import { EmptyState } from "@/components/EmptyState";
import { useCachedNewsBySlug } from "@/hooks/useCachedNews";
import { toast } from "@/lib/toast";
import DOMPurify from "dompurify";
import {
  Clock,
  Eye,
  Heart,
  Share2,
  MessageCircle,
  ArrowLeft,
  ThumbsUp,
  Send,
  Bookmark,
} from "lucide-react";
import { getLoginUrl } from "@/const";

function CommentSection({ newsId }: { newsId: number }) {
  const { user, isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  
  const utils = trpc.useUtils();
  const { data: comments, isLoading } = trpc.comments.getByNewsId.useQuery({ newsId });
  
  const createComment = trpc.comments.create.useMutation({
    onSuccess: () => {
      setNewComment("");
      setReplyTo(null);
      utils.comments.getByNewsId.invalidate({ newsId });
      toast.success("Comentario publicado");
    },
    onError: () => {
      toast.error("Error al publicar comentario");
    },
  });

  const toggleLike = trpc.comments.toggleLike.useMutation({
    onSuccess: () => {
      utils.comments.getByNewsId.invalidate({ newsId });
    },
  });

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createComment.mutate({
      newsId,
      content: newComment,
      parentId: replyTo || undefined,
    });
  };

  // Organize comments into threads
  const rootComments = comments?.filter((c: any) => !c.comment.parentId) || [];
  const replies = comments?.filter((c: any) => c.comment.parentId) || [];

  const getReplies = (parentId: number) => 
    replies.filter((r: any) => r.comment.parentId === parentId);

  return (
    <section className="mt-12">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        Comentarios ({comments?.length || 0})
      </h3>

      {/* Comment form */}
      {isAuthenticated ? (
        <div className="mb-8">
          <div className="flex gap-4">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user?.avatar || undefined} />
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              {replyTo && (
                <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                  Respondiendo a un comentario
                  <button 
                    onClick={() => setReplyTo(null)}
                    className="text-primary hover:underline"
                  >
                    Cancelar
                  </button>
                </div>
              )}
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] resize-none"
              />
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || createComment.isPending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-6 bg-muted rounded-lg text-center">
          <p className="text-muted-foreground mb-4">
            Inicia sesión para comentar
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Iniciar Sesión</a>
          </Button>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-16 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : rootComments.length > 0 ? (
        <div className="space-y-6">
          {rootComments.map((item: any) => (
            <motion.div
              key={item.comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={item.user?.avatar || undefined} />
                <AvatarFallback>{item.user?.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">{item.user?.name || "Usuario"}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.comment.createdAt).toLocaleDateString('es-CL')}
                    </span>
                  </div>
                  <p className="text-sm">{item.comment.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <button
                    onClick={() => isAuthenticated && toggleLike.mutate({ commentId: item.comment.id })}
                    className={`flex items-center gap-1 hover:text-primary transition-colors ${
                      item.isLiked ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    {item.comment.likes}
                  </button>
                  {isAuthenticated && (
                    <button
                      onClick={() => setReplyTo(item.comment.id)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      Responder
                    </button>
                  )}
                </div>

                {/* Replies */}
                {getReplies(item.comment.id).length > 0 && (
                  <div className="mt-4 ml-4 space-y-4 border-l-2 border-border pl-4">
                    {getReplies(item.comment.id).map((reply: any) => (
                      <div key={reply.comment.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={reply.user?.avatar || undefined} />
                          <AvatarFallback>{reply.user?.name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted/50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{reply.user?.name || "Usuario"}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(reply.comment.createdAt).toLocaleDateString('es-CL')}
                              </span>
                            </div>
                            <p className="text-sm">{reply.comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState 
          type="empty" 
          title="No hay comentarios aún"
          description="¡Sé el primero en comentar!"
          compact
        />
      )}
    </section>
  );
}

export default function NewsDetail() {
  const params = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  
  // Usar cached news con soporte offline
  const { item: cachedNews, isLoading: isLoadingCached } = useCachedNewsBySlug(
    params.slug,
    { enabled: !!params.slug }
  );

  // También usar tRPC para datos frescos
  const { data: serverData, isLoading: isLoadingServer } = trpc.news.getBySlug.useQuery(
    { slug: params.slug || "" },
    { enabled: !!params.slug && navigator.onLine }
  );

  // Usar datos del servidor si están disponibles, sino del cache
  // Type assertion necesario por diferencias en tipos entre tRPC y cached data
  const data = (serverData as any) || (cachedNews ? {
    news: cachedNews,
    category: cachedNews.category
  } : null);
  
  const isLoading = isLoadingCached && isLoadingServer;

  const { data: isFavorited } = trpc.favorites.news.check.useQuery(
    { newsId: data?.news.id || 0 },
    { enabled: !!data?.news.id && isAuthenticated }
  );

  const utils = trpc.useUtils();
  const incrementViews = trpc.news.incrementViews.useMutation();
  const addToHistory = trpc.history.add.useMutation();
  const toggleFavorite = trpc.favorites.news.toggle.useMutation({
    onSuccess: (result) => {
      utils.favorites.news.check.invalidate({ newsId: data?.news.id });
      if (result.isFavorited) {
        toast.success("Añadido a favoritos", { description: data?.news.title });
      } else {
        toast.success("Eliminado de favoritos");
      }
    },
    onError: () => {
      toast.error("No se pudo actualizar favoritos");
    }
  });

  useEffect(() => {
    if (data?.news.id) {
      incrementViews.mutate({ id: data.news.id });
      if (isAuthenticated) {
        addToHistory.mutate({ newsId: data.news.id });
      }
    }
  }, [data?.news.id, isAuthenticated]);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: data?.news.title,
        url: window.location.href,
      });
      toast.success("Compartido exitosamente");
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Enlace copiado al portapapeles");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <DetailSkeleton variant="news" />
        </div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout>
        <div className="container py-8">
          <EmptyState 
            type="notFound" 
            title="Noticia no encontrada"
            description="El contenido que buscas no existe o ha sido eliminado"
            action={
              <Link href="/">
                <Button>Volver al inicio</Button>
              </Link>
            }
          />
        </div>
      </Layout>
    );
  }

  const { news, category } = data;

  return (
    <Layout>
      <article className="container py-8 max-w-4xl">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </Link>

        {/* Hero image con OptimizedImage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-[300px] md:h-[400px] rounded-xl overflow-hidden mb-8"
        >
          <OptimizedImage
            src={news.imageUrl || "/stadium-bg.jpg"}
            alt={news.title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
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
        </motion.div>

        {/* Title and meta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{news.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(news.publishedAt).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {news.views} vistas
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 mb-8 pb-8 border-b border-border">
            {isAuthenticated && (
              <Button
                variant={isFavorited ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFavorite.mutate({ newsId: news.id })}
              >
                <Heart className={`w-4 h-4 mr-2 ${isFavorited ? "fill-current" : ""}`} />
                {isFavorited ? "Guardado" : "Guardar"}
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartir
            </Button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          {news.excerpt && (
            <p className="text-xl text-muted-foreground font-medium mb-6">
              {news.excerpt}
            </p>
          )}
          <div
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(news.content.replace(/\n/g, '<br/>')) }}
          />
        </motion.div>

        {/* Comments */}
        <CommentSection newsId={news.id} />
      </article>
    </Layout>
  );
}
