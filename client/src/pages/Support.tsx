/**
 * Support.tsx - Página de Apoyo integrada
 * Features: FullScreenLoading, toast
 */
import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FullScreenLoading } from "@/components/LoadingOverlay";
import { toast } from "@/lib/toast";
import {
  Heart,
  Coffee,
  Gift,
  Star,
  ChevronLeft,
  Check,
  MessageCircle,
} from "lucide-react";

const supportOptions = [
  {
    icon: Coffee,
    title: "Invítanos un café",
    description: "Una pequeña contribución que nos ayuda a mantener el servidor funcionando.",
    amount: "$3.000 CLP",
    features: ["Acceso anticipado a noticias", "Mención en agradecimientos"],
    popular: false,
  },
  {
    icon: Heart,
    title: "Socio Mensual",
    description: "Conviértete en socio y apoya el proyecto de forma recurrente.",
    amount: "$10.000 CLP/mes",
    features: [
      "Todo lo anterior",
      "Badge especial en comentarios",
      "Acceso a grupo exclusivo",
      "Noticias sin publicidad",
    ],
    popular: true,
  },
  {
    icon: Star,
    title: "Patrocinador",
    description: "Apoyo empresarial para quienes quieren mayor visibilidad.",
    amount: "$50.000 CLP/mes",
    features: [
      "Todo lo anterior",
      "Logo en la página de inicio",
      "Menciones en redes sociales",
      "Reportajes exclusivos",
    ],
    popular: false,
  },
];

const whySupport = [
  "Mantenimiento de servidores y hosting",
  "Desarrollo de nuevas funcionalidades",
  "Cobertura de eventos deportivos",
  "Análisis y estadísticas avanzadas",
  "App móvil para iOS y Android",
];

export default function Support() {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSupport = async (option: string) => {
    setSelectedOption(option);
    setIsProcessing(true);
    
    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast.success("¡Gracias por tu apoyo!", {
      description: `Has seleccionado: ${option}`,
    });
    
    setIsProcessing(false);
    setSelectedOption(null);
  };

  return (
    <Layout>
      <FullScreenLoading 
        isLoading={isProcessing} 
        text={`Procesando ${selectedOption ? selectedOption.toLowerCase() : 'apoyo'}...`}
      />
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

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-[#E30613]/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-[#E30613]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Apoya <span className="text-[#E30613]">FCH</span> Noticias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Tu apoyo nos permite mantener la plataforma funcionando y mejorar constantemente. 
            Gracias a ti podemos seguir informando sobre el fútbol chileno.
          </p>
        </motion.div>

        {/* Why Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-white/5 mb-12"
        >
          <h2 className="font-heading text-xl font-bold text-center mb-6">
            ¿En qué usamos tu apoyo?
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whySupport.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-[#E30613]/10 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-[#E30613]" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Support Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="font-heading text-xl font-bold text-center mb-8">
            Elige cómo apoyar
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {supportOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <Card className={`relative h-full ${option.popular ? 'border-[#E30613] shadow-lg shadow-[#E30613]/10' : ''}`}>
                    {option.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-[#E30613] text-white text-xs font-bold px-3 py-1 rounded-full">
                          MÁS POPULAR
                        </span>
                      </div>
                    )}
                    <CardHeader className="text-center pb-4">
                      <div className={`w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center ${option.popular ? 'bg-[#E30613]' : 'bg-[#E30613]/10'}`}>
                        <Icon className={`w-6 h-6 ${option.popular ? 'text-white' : 'text-[#E30613]'}`} />
                      </div>
                      <CardTitle className="font-heading text-xl">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                        {option.description}
                      </p>
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {option.amount}
                      </div>
                      <ul className="space-y-2 mb-6 text-left">
                        {option.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Check className="w-4 h-4 text-[#E30613] shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        onClick={() => handleSupport(option.title)}
                        disabled={isProcessing}
                        className={`w-full ${option.popular ? 'bg-[#E30613] hover:bg-[#c70510]' : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/5 dark:text-white dark:hover:bg-white/10'}`}
                      >
                        Elegir
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Other ways to support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E30613]/10 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-[#E30613]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">Comparte la app</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Ayúdanos a crecer compartiendo FCH Noticias con tus amigos y familiares hinchas.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'FCH Noticias',
                          text: 'Mira esta app de noticias del fútbol chileno',
                          url: window.location.origin,
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.origin);
                        toast.success("Enlace copiado al portapapeles");
                      }
                    }}
                  >
                    Compartir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#E30613]/10 flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5 text-[#E30613]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg mb-2">Envía tus ideas</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    ¿Tienes sugerencias para mejorar? Nos encantaría escucharte.
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm">
                      Contactar
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Thank you */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400">
            Gracias por considerar apoyar nuestro proyecto. ❤️
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
