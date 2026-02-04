/**
 * FCH Noticias - Componente EmptyState
 * 
 * Componente reutilizable para mostrar estados vacíos con iconos,
 * títulos, descripciones y acciones personalizables.
 * 
 * @example
 * ```tsx
 * // Estado vacío básico
 * <EmptyState type="empty" />
 * 
 * // Estado de búsqueda sin resultados
 * <EmptyState type="search" />
 * 
 * // Estado de error con acción
 * <EmptyState 
 *   type="error" 
 *   onAction={() => refetch()}
 *   actionLabel="Reintentar"
 * />
 * 
 * // Personalizado completo
 * <EmptyState
 *   icon={CustomIcon}
 *   title="Título personalizado"
 *   description="Descripción detallada"
 *   action={<Button>Acción</Button>}
 * />
 * ```
 * 
 * @module client/src/components/EmptyState
 */

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Search,
  PackageOpen,
  AlertCircle,
  CloudOff,
  Heart,
  FileX,
  Newspaper,
  Users,
  LucideIcon
} from "lucide-react";

/**
 * Tipos predefinidos de estados vacíos con contenido por defecto
 */
export type EmptyStateType = 
  | "search" 
  | "empty" 
  | "error" 
  | "offline" 
  | "favorites" 
  | "notFound"
  | "news"
  | "players";

/**
 * Props para el componente EmptyState
 */
interface EmptyStateProps {
  /** Tipo predefinido de estado vacío (usa contenido por defecto) */
  type?: EmptyStateType;
  /** Icono personalizado (sobrescribe el del tipo) */
  icon?: LucideIcon;
  /** Título personalizado (sobrescribe el del tipo) */
  title?: string;
  /** Descripción personalizada (sobrescribe la del tipo) */
  description?: string;
  /** Componente de acción personalizado */
  action?: React.ReactNode;
  /** Label del botón de acción (si se usa onAction) */
  actionLabel?: string;
  /** Callback para el botón de acción */
  onAction?: () => void;
  /** Clases CSS adicionales */
  className?: string;
  /** Si es true, usa diseño compacto (menos padding, texto más pequeño) */
  compact?: boolean;
}

/**
 * Contenido por defecto para cada tipo de estado vacío
 */
const defaultContent: Record<EmptyStateType, { 
  icon: LucideIcon; 
  title: string; 
  description: string;
}> = {
  search: {
    icon: Search,
    title: "No se encontraron resultados",
    description: "Intenta con otros términos de búsqueda o filtros diferentes"
  },
  empty: {
    icon: PackageOpen,
    title: "No hay contenido disponible",
    description: "Parece que aún no hay nada por aquí"
  },
  error: {
    icon: AlertCircle,
    title: "Algo salió mal",
    description: "Hubo un error al cargar el contenido. Intenta nuevamente"
  },
  offline: {
    icon: CloudOff,
    title: "Sin conexión",
    description: "Verifica tu conexión a internet e intenta nuevamente"
  },
  favorites: {
    icon: Heart,
    title: "No tienes favoritos",
    description: "Guarda tus noticias y jugadores favoritos para verlos aquí"
  },
  notFound: {
    icon: FileX,
    title: "Página no encontrada",
    description: "El contenido que buscas no existe o ha sido eliminado"
  },
  news: {
    icon: Newspaper,
    title: "No hay noticias",
    description: "Aún no hay noticias disponibles en esta categoría"
  },
  players: {
    icon: Users,
    title: "No se encontraron jugadores",
    description: "Intenta ajustar los filtros de búsqueda"
  }
};

/**
 * Componente EmptyState - Estados vacíos informativos
 * 
 * Muestra un estado vacío con icono, título, descripción y acción opcional.
 * Incluye animaciones suaves con Framer Motion.
 * 
 * @param {EmptyStateProps} props - Props del componente
 * @returns {JSX.Element} Componente EmptyState
 */
export function EmptyState({
  type = "empty",
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  action,
  actionLabel,
  onAction,
  className,
  compact = false
}: EmptyStateProps) {
  const content = defaultContent[type];
  const Icon = CustomIcon || content.icon;
  const title = customTitle || content.title;
  const description = customDescription || content.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-12 px-4",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {/* Icon Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-4",
          compact ? "w-16 h-16" : "w-20 h-20"
        )}
      >
        <Icon 
          className={cn(
            "text-muted-foreground",
            compact ? "w-8 h-8" : "w-10 h-10"
          )} 
          strokeWidth={1.5}
        />
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className={cn(
          "font-semibold text-foreground mb-2",
          compact ? "text-base" : "text-lg"
        )}
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "text-muted-foreground max-w-sm",
          compact ? "text-sm mb-4" : "text-base mb-6"
        )}
      >
        {description}
      </motion.p>

      {/* Action */}
      {(action || onAction) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action || (
            onAction && (
              <Button onClick={onAction} size={compact ? "sm" : "default"}>
                {actionLabel || "Intentar nuevamente"}
              </Button>
            )
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Convenience exports for common empty states
export function SearchEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="search" {...props} />;
}

export function ErrorEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="error" {...props} />;
}

export function OfflineEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="offline" {...props} />;
}

export function FavoritesEmptyState(props: Omit<EmptyStateProps, 'type'>) {
  return <EmptyState type="favorites" {...props} />;
}
