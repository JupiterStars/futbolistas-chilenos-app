import { Link } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Shield, Lock, Eye, Trash2, Cookie } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "1. Información que Recopilamos",
    content: `En FCH Noticias recopilamos diferentes tipos de información para proporcionar y mejorar nuestros servicios:

Información proporcionada por ti:
• Nombre y correo electrónico (al registrarte)
• Preferencias de notificaciones
• Contenido que compartes en comentarios

Información recopilada automáticamente:
• Dirección IP y ubicación aproximada
• Tipo de navegador y dispositivo
• Páginas visitadas y tiempo de permanencia
• Interacciones con el contenido`
  },
  {
    icon: Lock,
    title: "2. Cómo Usamos tu Información",
    content: `Utilizamos la información recopilada para:

• Proporcionar y mantener nuestros servicios
• Personalizar tu experiencia de usuario
• Enviar notificaciones sobre noticias importantes
• Analizar el uso de la plataforma para mejoras
• Prevenir actividades fraudulentas o maliciosas
• Cumplir con obligaciones legales

No vendemos ni alquilamos tu información personal a terceros.`
  },
  {
    icon: Cookie,
    title: "3. Cookies y Tecnologías Similares",
    content: `Utilizamos cookies y tecnologías similares para:

• Mantener tu sesión iniciada
• Recordar tus preferencias
• Analizar el tráfico y uso del sitio
• Personalizar el contenido mostrado

Tipos de cookies que usamos:
• Esenciales: Necesarias para el funcionamiento básico
• Preferencias: Guardan tus configuraciones
• Analíticas: Nos ayudan a entender cómo usas la plataforma
• Publicitarias: Para mostrar contenido relevante (si aplica)

Puedes desactivar las cookies en la configuración de tu navegador, aunque esto puede afectar la funcionalidad.`
  },
  {
    icon: Shield,
    title: "4. Seguridad de la Información",
    content: `La seguridad de tu información es nuestra prioridad:

• Utilizamos encriptación HTTPS para todas las conexiones
• Implementamos medidas de seguridad técnicas y organizativas
• Realizamos copias de seguridad regulares
• Limitamos el acceso a la información solo a personal autorizado

Sin embargo, ningún sistema es 100% seguro. Te recomendamos:
• Usar contraseñas fuertes y únicas
• No compartir tus credenciales
• Mantener tu software actualizado`
  },
  {
    icon: Trash2,
    title: "5. Tus Derechos",
    content: `De acuerdo con la ley de protección de datos, tienes derecho a:

• Acceder a tu información personal
• Rectificar datos incorrectos
• Solicitar la eliminación de tus datos
• Oponerte al procesamiento de tu información
• Solicitar la portabilidad de tus datos
• Retirar tu consentimiento en cualquier momento

Para ejercer estos derechos, contáctanos a través de nuestra página de contacto.`
  },
];

const dataRetention = [
  "Datos de cuenta: Hasta que elimines tu cuenta",
  "Comentarios: Indefinidamente (a menos que solicites eliminación)",
  "Logs de servidor: 12 meses",
  "Cookies: De sesión hasta 1 año",
  "Análisis anónimos: 24 meses",
];

export default function Privacy() {
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
          <div className="w-16 h-16 rounded-full bg-[#E30613]/10 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-[#E30613]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Última actualización: {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5 mb-8"
        >
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            En FCH Noticias nos tomamos muy en serio tu privacidad. Esta política explica 
            cómo recopilamos, usamos y protegemos tu información personal cuando utilizas 
            nuestra plataforma. Al usar nuestros servicios, aceptas las prácticas descritas 
            en esta política.
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
                  <div className="w-10 h-10 rounded-lg bg-[#E30613]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#E30613]" />
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

        {/* Data Retention */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5 mt-6"
        >
          <h2 className="font-heading text-xl font-bold mb-4 text-gray-900 dark:text-white">
            Retención de Datos
          </h2>
          <ul className="space-y-2">
            {dataRetention.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <span className="text-[#E30613] mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center bg-gray-50 dark:bg-white/5 rounded-xl p-6"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Tienes preguntas sobre nuestra política de privacidad?
          </p>
          <Link href="/contact">
            <Button>Contactar con nosotros</Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
