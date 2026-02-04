/**
 * App.tsx - Configuración principal con lazy loading y Suspense
 * Optimizado para code splitting y carga progresiva de páginas
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { Suspense, lazy } from "react";

// Importar componentes críticos de forma estática (no lazy)
import ErrorBoundary from "./components/ErrorBoundary";
import { PageLoader } from "./components/PageLoader";
import PageErrorBoundary from "./components/PageErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

// Lazy imports de todas las páginas para code splitting
const Home = lazy(() => import("./pages/Home"));
const NewsList = lazy(() => import("./pages/NewsList"));
const NewsDetail = lazy(() => import("./pages/NewsDetail"));
const Players = lazy(() => import("./pages/Players"));
const PlayerDetail = lazy(() => import("./pages/PlayerDetail"));
const Leaderboards = lazy(() => import("./pages/Leaderboards"));
const Transfers = lazy(() => import("./pages/Transfers"));
const Search = lazy(() => import("./pages/Search"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Profile = lazy(() => import("./pages/Profile"));
const Category = lazy(() => import("./pages/Category"));
const About = lazy(() => import("./pages/About"));
const Support = lazy(() => import("./pages/Support"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Disclaimer = lazy(() => import("./pages/Disclaimer"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));

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
          <Suspense fallback={<PageLoader />}>
            <Router />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
