import { motion, AnimatePresence } from "framer-motion";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  blur?: boolean;
  preventInteraction?: boolean;
}

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

// Full-screen loading overlay variant
interface FullScreenLoadingProps {
  isLoading: boolean;
  text?: string;
  className?: string;
}

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

// Button loading state wrapper
interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}

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
