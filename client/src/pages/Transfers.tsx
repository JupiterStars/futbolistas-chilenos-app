import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRightLeft,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";

function TransferCard({ transfer }: { transfer: any }) {
  const { data: details } = trpc.transfers.getById.useQuery(
    { id: transfer.id },
    { enabled: !!transfer.id }
  );

  const player = details?.player?.player;
  const fromTeam = details?.fromTeam;
  const toTeam = details?.toTeam;

  const formatFee = (fee: string | null, feeType: string) => {
    if (feeType === "free") return "Gratis";
    if (feeType === "loan") return "Préstamo";
    if (feeType === "undisclosed" || !fee) return "No revelado";
    return `€${Number(fee).toLocaleString()}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmado</Badge>;
      case "official":
        return <Badge className="bg-primary">Oficial</Badge>;
      case "rumor":
        return <Badge variant="secondary">Rumor</Badge>;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="bg-card rounded-xl border border-border p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        {getStatusBadge(transfer.status)}
        <span className="text-sm text-muted-foreground flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {transfer.announcedAt 
            ? new Date(transfer.announcedAt).toLocaleDateString('es-CL')
            : new Date(transfer.createdAt).toLocaleDateString('es-CL')
          }
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* From Team */}
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            {fromTeam?.logo ? (
              <img src={fromTeam.logo} alt={fromTeam.name} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {fromTeam?.shortName?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <p className="text-sm font-medium truncate">
            {fromTeam?.name || "Desconocido"}
          </p>
        </div>

        {/* Arrow and Player */}
        <div className="flex flex-col items-center gap-2">
          {player && (
            <Link href={`/players/${player.slug}`}>
              <Avatar className="w-20 h-20 border-4 border-primary cursor-pointer hover:scale-105 transition-transform">
                <AvatarImage src={player.imageUrl || undefined} />
                <AvatarFallback className="text-xl">
                  {player.name?.charAt(0) || "?"}
                </AvatarFallback>
              </Avatar>
            </Link>
          )}
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-0.5 bg-primary" />
            <ArrowRight className="w-5 h-5" />
            <div className="w-8 h-0.5 bg-primary" />
          </div>
          {player && (
            <Link href={`/players/${player.slug}`}>
              <p className="font-bold hover:text-primary transition-colors cursor-pointer">
                {player.name}
              </p>
            </Link>
          )}
        </div>

        {/* To Team */}
        <div className="flex-1 text-center">
          <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-muted flex items-center justify-center">
            {toTeam?.logo ? (
              <img src={toTeam.logo} alt={toTeam.name} className="w-12 h-12 object-contain" />
            ) : (
              <span className="text-2xl font-bold text-muted-foreground">
                {toTeam?.shortName?.charAt(0) || "?"}
              </span>
            )}
          </div>
          <p className="text-sm font-medium truncate">
            {toTeam?.name || "Desconocido"}
          </p>
        </div>
      </div>

      {/* Transfer details */}
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-1 text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold text-foreground">
            {formatFee(transfer.fee, transfer.feeType)}
          </span>
        </div>
        {transfer.contractYears && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <FileText className="w-4 h-4" />
            <span>{transfer.contractYears} años</span>
          </div>
        )}
        {transfer.source && (
          <span className="text-xs text-muted-foreground">
            Fuente: {transfer.source}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function Transfers() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: allTransfers, isLoading: loadingAll } = trpc.transfers.list.useQuery({ limit: 50 });
  const { data: confirmedTransfers, isLoading: loadingConfirmed } = trpc.transfers.list.useQuery({ 
    status: "confirmed", 
    limit: 50 
  });
  const { data: rumorTransfers, isLoading: loadingRumors } = trpc.transfers.list.useQuery({ 
    status: "rumor", 
    limit: 50 
  });

  const getTransfers = () => {
    switch (activeTab) {
      case "confirmed":
        return { data: confirmedTransfers, loading: loadingConfirmed };
      case "rumors":
        return { data: rumorTransfers, loading: loadingRumors };
      default:
        return { data: allTransfers, loading: loadingAll };
    }
  };

  const { data: transfers, loading } = getTransfers();

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full gradient-chile flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeft className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Mercado de Fichajes</h1>
          <p className="text-muted-foreground">
            Sigue los movimientos de los jugadores chilenos
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-center mb-8">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Todos
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirmados
            </TabsTrigger>
            <TabsTrigger value="rumors" className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4" />
              Rumores
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full rounded-xl" />
                ))}
              </div>
            ) : transfers && transfers.length > 0 ? (
              <div className="space-y-4">
                {transfers.map((transfer, index) => (
                  <motion.div
                    key={transfer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TransferCard transfer={transfer} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <ArrowRightLeft className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No hay fichajes disponibles
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
