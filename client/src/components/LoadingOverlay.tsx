/**
 * FCH Noticias - Componente LoadingOverlay
 * 
 * Componentes para mostrar estados de carga con diferentes variantes:
 * - LoadingOverlay: Superposición sobre contenido existente
 * - FullScreenLoading: Pantalla completa de carga
 * - ButtonLoading: Wrapper para estado de carga en botones
 * 
 * @example
 * ```tsx
 * // Overlay sobre contenido
 * <LoadingOverlay isLoading={isLoading} text="Guardando...">
 *   <Form>...</Form>
 * </LoadingOverlay>
 * 
 * // Pantalla completa
 * <FullScreenLoading isLoading={isSubmitting} text="Iniciando sesión..." />
 * 
 * // Botón con estado de carga
 * <ButtonLoading isLoading={isSaving} loadingText="Guardando">
 *   <Button>Guardar cambios</Button>
 * </ButtonLoading>
 * ```
 * 
 * @module client/src/components/LoadingOverlay
 */

import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * Props para el componente LoadingOverlay
 */
interface LoadingOverlayProps {
  /** Si se debe mostrar el overlay */
  isLoading: boolean;
  /** Texto a mostrar durante la carga */
  text?: string;
  /** Contenido sobre el que se superpone el loader */
  children: React.ReactNode;
  /** Clases CSS adicionales para el contenedor */
  className?: string;
  /** Clases CSS adicionales para el overlay */
  overlayClassName?: string;
  /** Si se debe aplicar blur al fondo */
  blur?: boolean;
  /** Si se debe prevenir interacción con el contenido (default: true) */
  preventInteraction?: boolean;
}

/**
 * LoadingOverlay - Superposición de carga sobre contenido
 * 
 * Muestra un spinner centrado sobre el contenido mientras isLoading es true.
 * Incluye animaciones de entrada/salida suaves.
 * 
 * @param {LoadingOverlayProps} props - Props del componente
 * @returns {JSX.Element} Componente LoadingOverlay
 */
export function LoadingOverlay({
  isLoading,
  text = "Cargando...",
  children,
  className,
  overlayClassName,
  blur = false,
  preventInteraction = true
}: LoadingOverlayProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "absolute inset-0 z-50 flex flex-col items-center justify-center",
              "bg-background/80 dark:bg-background/90",
              blur && "backdrop-blur-sm",
              preventInteraction && "pointer-events-auto",
              overlayClassName
            )}
            role="alert"
            aria-live="polite"
            aria-busy="true"
            aria-label={text}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-4"
            >
              <Spinner className="w-8 h-8 text-primary" />
              {text && (
                <p className="text-sm font-medium text-muted-foreground">
                  {text}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Props para el componente FullScreenLoading
 */
interface FullScreenLoadingProps {
  /** Si se debe mostrar el loader de pantalla completa */
  isLoading: boolean;
  /** Texto a mostrar durante la carga */
  text?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * FullScreenLoading - Pantalla completa de carga
 * 
 * Muestra un spinner centrado en toda la pantalla.
 * Útil para carga inicial o transiciones de página.
 * 
 * @param {FullScreenLoadingProps} props - Props del componente
 * @returns {JSX.Element|null} Componente FullScreenLoading
 */
export function FullScreenLoading({
  isLoading,
  text = "Cargando...",
  className
}: FullScreenLoadingProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center",
            "bg-background/90 backdrop-blur-sm",
            className
          )}
          role="alert"
          aria-live="polite"
          aria-busy="true"
          aria-label={text}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <Spinner className="w-10 h-10 text-primary" />
            </div>
            {text && (
              <p className="text-base font-medium text-foreground">
                {text}
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Props para el componente ButtonLoading
 */
interface ButtonLoadingProps {
  /** Si el botón está en estado de carga */
  isLoading: boolean;
  /** Contenido del botón (visible cuando no está cargando) */
  children: React.ReactNode;
  /** Texto a mostrar durante la carga (opcional) */
  loadingText?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * ButtonLoading - Wrapper para estado de carga en botones
 * 
 * Envuelve un botón y muestra un spinner durante la carga,
 * manteniendo el espacio del botón para evitar saltos de layout.
 * 
 * @param {ButtonLoadingProps} props - Props del componente
 * @returns {JSX.Element} Componente ButtonLoading
 */
export function ButtonLoading({
  isLoading,
  children,
  loadingText,
  className
}: ButtonLoadingProps) {
  return (
    <div className={cn("relative inline-flex", className)}>
      <div className={cn(isLoading && "opacity-0")}>
        {children}
      </div>
      
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center gap-2"
          >
            <Spinner className="w-4 h-4" />
            {loadingText && (
              <span className="text-sm">{loadingText}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
