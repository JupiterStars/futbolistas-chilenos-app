import { Link } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, AlertTriangle, Scale, Copyright, ExternalLink } from "lucide-react";

const sections = [
  {
    icon: AlertTriangle,
    title: "1. Naturaleza de la Información",
    content: `El contenido publicado en FCH Noticias tiene fines exclusivamente informativos y de entretenimiento:

• Las noticias se basan en fuentes públicas y verificables
• Las opiniones expresadas son personales de los autores
• La información deportiva puede cambiar rápidamente
• No garantizamos la exactitud absoluta de todos los datos

Te recomendamos verificar información crítica con fuentes oficiales.`
  },
  {
    icon: Copyright,
    title: "2. Derechos de Autor y Propiedad Intelectual",
    content: `Respecto al contenido de terceros:

• Las imágenes de jugadores y equipos pertenecen a sus respectivos dueños
• Los logos de clubes y federaciones son propiedad de las organizaciones correspondientes
• Las fotografías se utilizan bajo principios de uso justo/informativo
• Las marcas mencionadas son propiedad de sus titulares

Si eres titular de derechos y consideras que hay un uso inapropiado, contáctanos para resolverlo.`
  },
  {
    icon: Scale,
    title: "3. Limitación de Responsabilidad",
    content: `FCH Noticias no se hace responsable por:

• Decisiones tomadas basadas en la información publicada
• Daños directos o indirectos derivados del uso de la plataforma
• Contenido de sitios web de terceros enlazados
• Interrupciones temporales del servicio
• Pérdida de datos o información

El uso de esta plataforma es bajo tu propio riesgo y responsabilidad.`
  },
  {
    icon: ExternalLink,
    title: "4. Enlaces Externos",
    content: `Nuestra plataforma puede contener enlaces a sitios externos:

• No controlamos ni somos responsables del contenido externo
• Los enlaces no implican endoso ni afiliación
• Las políticas de privacidad de sitios externos son independientes
• Te recomendamos revisar los términos de uso de cualquier sitio externo

Al hacer clic en enlaces externos, abandonas nuestra plataforma.`
  },
];

const dataSources = [
  "Sitios web oficiales de clubes y federaciones",
  "Agencias de noticias deportivas",
  "Redes sociales oficiales de jugadores y equipos",
  "Transmisiones públicas de partidos",
  "Bases de datos estadísticas deportivas",
];

export default function Disclaimer() {
  return (
    <Layout>
      <div className="container py-6 max-w-4xl">
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Descargo de Responsabilidad
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Información importante sobre el uso de FCH Noticias
          </p>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-6 mb-8"
        >
          <h2 className="font-heading font-bold text-lg text-amber-900 dark:text-amber-100 mb-2">
            Aviso Importante
          </h2>
          <p className="text-amber-800 dark:text-amber-200 text-sm leading-relaxed">
            FCH Noticias es un sitio de aficionados dedicado al fútbol chileno. No estamos 
            afiliados oficialmente con la ANFP, FIFA, ni ningún club de fútbol. Todo el 
            contenido se proporciona con fines informativos y de entretenimiento únicamente.
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="prose dark:prose-invert max-w-none">
                  {section.content.split('\n\n').map((paragraph, i) => (
                    <p key={i} className="text-gray-600 dark:text-gray-400 mb-4 last:mb-0 whitespace-pre-line">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </motion.div>

        {/* Data Sources */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5 mt-6"
        >
          <h2 className="font-heading text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Fuentes de Información
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Nuestras noticias se basan en información de las siguientes fuentes:
          </p>
          <ul className="space-y-2">
            {dataSources.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <span className="text-amber-600 dark:text-amber-400 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Affiliation Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 dark:bg-white/5 rounded-xl p-6 mt-6 text-center"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            <strong>Nota de Afiliación:</strong> FCH Noticias es un proyecto independiente 
            sin afiliación oficial con la ANFP, FIFA, CONMEBOL, ni ningún club de fútbol 
            profesional. Todas las marcas registradas son propiedad de sus respectivos dueños.
          </p>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12 text-center bg-gray-50 dark:bg-white/5 rounded-xl p-6"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Si tienes alguna pregunta sobre este descargo de responsabilidad
          </p>
          <Link href="/contact">
            <Button>Contactar con nosotros</Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
