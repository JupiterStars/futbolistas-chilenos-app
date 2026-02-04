/**
 * NotFound.tsx - Página 404 integrada
 * Features: Layout, EmptyState
 */
import { useLocation } from "wouter";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/EmptyState";
import { Home, AlertCircle } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <Layout>
      <div className="container py-16">
        <EmptyState
          type="notFound"
          title="Página no encontrada"
          description="La página que buscas no existe o ha sido movida a otra ubicación."
          action={
            <Button onClick={handleGoHome} className="gap-2">
              <Home className="w-4 h-4" />
              Volver al inicio
            </Button>
          }
        />
      </div>
    </Layout>
  );
}
