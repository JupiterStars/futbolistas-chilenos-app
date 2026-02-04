/**
 * PageErrorBoundary - Error boundary específico para páginas lazy
 * Captura errores de carga de chunks y permite reintentar
 */
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Component, ReactNode } from "react";
import { Link } from "wouter";

interface Props {
  children: ReactNode;
  /**
   * Callback opcional cuando ocurre un error
   */
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

/**
 * Error boundary específico para páginas con lazy loading
 * Detecta errores de carga de chunks (código dividido) y permite reintentar
 */
class PageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isChunkError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Detectar si es un error de carga de chunk (lazy loading)
    const isChunkError =
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Failed to fetch dynamically imported module") ||
      error.message?.includes("Importing a module script failed");

    return { hasError: true, error, isChunkError };
  }

  componentDidCatch(error: Error) {
    // Log del error para debugging
    console.error("[PageErrorBoundary] Error capturado:", error);

    // Notificar al padre si hay callback
    this.props.onError?.(error);

    // Si es un error de chunk, intentar recargar automáticamente después de 3 segundos
    if (
      error.message?.includes("Loading chunk") ||
      error.message?.includes("Failed to fetch dynamically imported module")
    ) {
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, isChunkError: false });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-md p-8 text-center">
            <div
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mb-6",
                this.state.isChunkError ? "bg-orange-500/10" : "bg-destructive/10"
              )}
            >
              <AlertTriangle
                size={32}
                className={cn(
                  this.state.isChunkError ? "text-orange-500" : "text-destructive"
                )}
              />
            </div>

            <h2 className="text-xl font-semibold mb-2">
              {this.state.isChunkError
                ? "Error al cargar la página"
                : "Ha ocurrido un error"}
            </h2>

            <p className="text-muted-foreground mb-6">
              {this.state.isChunkError
                ? "No se pudo cargar el contenido. Esto puede deberse a una actualización de la aplicación. Se recargará automáticamente..."
                : "Lo sentimos, algo salió mal al cargar esta página."}
            </p>

            {this.state.error && process.env.NODE_ENV === "development" && (
              <div className="p-4 w-full rounded bg-muted overflow-auto mb-6 text-left">
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap break-all">
                  {this.state.error.message}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={this.handleRetry}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary text-primary-foreground",
                  "hover:opacity-90 cursor-pointer transition-opacity"
                )}
              >
                <RefreshCw size={16} />
                Intentar de nuevo
              </button>

              <Link
                href="/"
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
                  "bg-secondary text-secondary-foreground",
                  "hover:bg-secondary/80 cursor-pointer transition-colors"
                )}
              >
                <Home size={16} />
                Ir al inicio
              </Link>
            </div>

            <button
              onClick={this.handleReload}
              className="mt-4 text-sm text-muted-foreground hover:text-foreground underline"
            >
              Recargar página completamente
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
