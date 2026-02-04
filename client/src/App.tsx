/**
 * App.tsx - Entry Point de FCH Noticias
 * 
 * Configuración principal con:
 * - Lazy loading desde barrel file pages/index.ts
 * - Suspense con PageLoader como fallback
 * - Error Boundaries en cada ruta
 * - Service Worker update notifications
 * - Online/Offline status indicators
 */
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";

// Importar componentes críticos de forma estática (no lazy)
import ErrorBoundary from "./components/ErrorBoundary";
import { PageLoader } from "./components/PageLoader";
import PageErrorBoundary from "./components/PageErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { toast } from "./lib/toast";

// Lazy imports desde barrel file para code splitting
import {
  Home,
  NewsList,
  NewsDetail,
  Players,
  PlayerDetail,
  Category,
  Leaderboards,
  Transfers,
  Search,
  Favorites,
  Profile,
  About,
  Support,
  Terms,
  Privacy,
  Disclaimer,
  Contact,
  NotFound,
  ComponentShowcase,
} from "./pages";

/**
 * Componente para manejar notificaciones del Service Worker
 * Muestra toasts cuando hay actualizaciones disponibles
 */
function ServiceWorkerNotifications() {
  const { isUpdated, isOnline, updateApp } = useServiceWorker();

  // Notificar cuando hay una actualización disponible
  useEffect(() => {
    if (isUpdated) {
      toast.info("Actualización disponible", {
        description: "Hay una nueva versión de la app disponible",
        action: {
          label: "Actualizar",
          onClick: () => updateApp(),
        },
        duration: 10000,
      });
    }
  }, [isUpdated, updateApp]);

  // Notificar cuando se pierde/restaura la conexión
  useEffect(() => {
    const handleOffline = () => {
      toast.warning("Sin conexión", {
        description: "Estás en modo offline. Algunas funciones pueden no estar disponibles.",
        duration: 5000,
      });
    };

    const handleOnline = () => {
      toast.success("¡Conexión restaurada!", {
        description: "Sincronizando datos...",
        duration: 3000,
      });
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}

/**
 * Router con Suspense para lazy loading de páginas
 * Cada ruta envuelve su componente en un PageErrorBoundary específico
 */
function Router() {
  return (
    <Switch>
      <Route path="/">
        {() => (
          <PageErrorBoundary>
            <Home />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/news">
        {() => (
          <PageErrorBoundary>
            <NewsList />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/news/:slug">
        {() => (
          <PageErrorBoundary>
            <NewsDetail />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/category/:slug">
        {() => (
          <PageErrorBoundary>
            <Category />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/players">
        {() => (
          <PageErrorBoundary>
            <Players />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/players/:slug">
        {() => (
          <PageErrorBoundary>
            <PlayerDetail />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/leaderboards">
        {() => (
          <PageErrorBoundary>
            <Leaderboards />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/transfers">
        {() => (
          <PageErrorBoundary>
            <Transfers />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/search">
        {() => (
          <PageErrorBoundary>
            <Search />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/favorites">
        {() => (
          <PageErrorBoundary>
            <Favorites />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/profile">
        {() => (
          <PageErrorBoundary>
            <Profile />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/about">
        {() => (
          <PageErrorBoundary>
            <About />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/support">
        {() => (
          <PageErrorBoundary>
            <Support />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/terms">
        {() => (
          <PageErrorBoundary>
            <Terms />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/privacy">
        {() => (
          <PageErrorBoundary>
            <Privacy />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/disclaimer">
        {() => (
          <PageErrorBoundary>
            <Disclaimer />
          </PageErrorBoundary>
        )}
      </Route>

      <Route path="/contact">
        {() => (
          <PageErrorBoundary>
            <Contact />
          </PageErrorBoundary>
        )}
      </Route>

      {/* Ruta de desarrollo - solo en development */}
      {import.meta.env.DEV && (
        <Route path="/components">
          {() => (
            <PageErrorBoundary>
              <ComponentShowcase />
            </PageErrorBoundary>
          )}
        </Route>
      )}

      <Route path="/404">
        {() => (
          <PageErrorBoundary>
            <NotFound />
          </PageErrorBoundary>
        )}
      </Route>

      <Route>
        {() => (
          <PageErrorBoundary>
            <NotFound />
          </PageErrorBoundary>
        )}
      </Route>
    </Switch>
  );
}

/**
 * App principal con configuración de Suspense y providers
 * Suspense muestra PageLoader mientras se cargan los chunks lazy
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" switchable>
        <TooltipProvider>
          <Toaster />
          <ServiceWorkerNotifications />
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
