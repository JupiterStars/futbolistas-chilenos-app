/**
 * About.tsx - Página Sobre Nosotros integrada
 * Features: OptimizedImage
 */
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  Target,
  Eye,
  Heart,
  Users,
  TrendingUp,
  Newspaper,
  ChevronLeft,
  Award,
  Globe,
  Zap,
} from "lucide-react";

const stats = [
  { label: "Noticias Publicadas", value: "500+", icon: Newspaper },
  { label: "Jugadores en Base de Datos", value: "100+", icon: Users },
  { label: "Categorías Cubiertas", value: "9", icon: Target },
  { label: "Visitas Mensuales", value: "50K+", icon: TrendingUp },
];

const values = [
  {
    icon: Heart,
    title: "Pasión por el Fútbol",
    description: "Amamos el fútbol chileno y trabajamos con pasión para mantenerte informado.",
  },
  {
    icon: Target,
    title: "Cobertura Completa",
    description: "Desde La Roja hasta las categorías juveniles, cubrimos todo el espectro del fútbol nacional.",
  },
  {
    icon: Globe,
    title: "Alcance Internacional",
    description: "Seguimiento de chilenos en el extranjero, de Europa a Sudamérica.",
  },
  {
    icon: Zap,
    title: "Velocidad",
    description: "Noticias en tiempo real, apenas sucede, tú lo sabes.",
  },
  {
    icon: Award,
    title: "Calidad",
    description: "Información verificada y contenido de calidad para verdaderos fanáticos.",
  },
  {
    icon: Users,
    title: "Comunidad",
    description: "Construimos una comunidad de hinchas apasionados por La Roja.",
  },
];

const team = [
  {
    name: "Equipo Editorial",
    role: "Redacción y Contenido",
    description: "Periodistas deportivos dedicados a traerte las mejores historias del fútbol chileno.",
  },
  {
    name: "Equipo Técnico",
    role: "Desarrollo y Tecnología",
    description: "Desarrolladores y diseñadores que mantienen la plataforma funcionando perfectamente.",
  },
];

export default function About() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="min-h-screen" />;
  return (
    <Layout>
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

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-2xl overflow-hidden mx-auto mb-6 shadow-lg">
            <OptimizedImage
              src="/logo.jpg"
              alt="FCH Noticias"
              width={80}
              height={80}
              className="object-cover"
              priority
            />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Sobre <span className="text-[#E30613]">FCH</span> Noticias
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
            Tu fuente confiable de noticias del fútbol chileno. Nacimos de la pasión por La Roja 
            y el compromiso de mantener informados a los verdaderos hinchas.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white dark:bg-[#111] rounded-xl p-6 text-center border border-gray-200 dark:border-white/5"
              >
                <div className="w-10 h-10 rounded-lg bg-[#E30613]/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-[#E30613]" />
                </div>
                <div className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#E30613] to-[#b8050f] rounded-2xl p-6 md:p-8 text-white"
          >
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-3">Nuestra Misión</h2>
            <p className="text-white/80 leading-relaxed">
              Ser la plataforma líder de noticias del fútbol chileno, proporcionando información 
              actualizada, precisa y de calidad sobre La Roja, jugadores chilenos en el extranjero 
              y todas las categorías juveniles.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-[#111] rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-white/5"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E30613]/10 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-[#E30613]" />
            </div>
            <h2 className="font-heading text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              Nuestra Visión
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              Consolidarnos como la comunidad más grande de fanáticos del fútbol chileno, 
              conectando a hinchas de todo el mundo con las noticias y estadísticas más 
              completas del fútbol nacional.
            </p>
          </motion.div>
        </div>

        {/* Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            Nuestros Valores
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5 hover:border-[#E30613]/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#E30613]/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#E30613]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-2 text-gray-900 dark:text-white">
                    {value.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-heading text-2xl font-bold text-center mb-8">
            Nuestro Equipo
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5"
              >
                <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-[#E30613] text-sm font-medium mb-3">{member.role}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#E30613] rounded-2xl p-8 text-center"
        >
          <h2 className="font-heading text-2xl font-bold text-white mb-3">
            ¿Quieres ser parte?
          </h2>
          <p className="text-white/80 max-w-md mx-auto mb-6">
            Estamos siempre buscando colaboradores apasionados por el fútbol chileno.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact">
              <Button variant="secondary" className="bg-white text-[#E30613] hover:bg-white/90">
                Contáctanos
              </Button>
            </Link>
            <Link href="/support">
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                Apoyar el Proyecto
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
