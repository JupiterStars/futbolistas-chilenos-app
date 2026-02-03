import { Link } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText, AlertCircle } from "lucide-react";

const sections = [
  {
    title: "1. Aceptación de los Términos",
    content: `Al acceder y utilizar FCH Noticias, aceptas estar sujeto a estos Términos y Condiciones de Uso. Si no estás de acuerdo con alguna parte de estos términos, te solicitamos que no utilices nuestra plataforma.

Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor inmediatamente después de su publicación. Es tu responsabilidad revisar periódicamente estos términos.`
  },
  {
    title: "2. Uso de la Plataforma",
    content: `FCH Noticias es una plataforma de información deportiva dedicada al fútbol chileno. Al utilizar nuestros servicios, te comprometes a:

• Utilizar la plataforma únicamente para fines lícitos
• No interferir con el funcionamiento normal del sitio
• No intentar acceder a áreas restringidas sin autorización
• No utilizar la plataforma para distribuir malware o contenido dañino
• Respetar los derechos de propiedad intelectual de terceros`
  },
  {
    title: "3. Propiedad Intelectual",
    content: `Todo el contenido publicado en FCH Noticias, incluyendo pero no limitado a textos, imágenes, logotipos, gráficos, y código, está protegido por derechos de autor y otras leyes de propiedad intelectual.

• El contenido de terceros se utiliza bajo los principios de uso justo o con permiso expreso
• Puedes compartir nuestros artículos siempre que cites la fuente
• No está permitida la reproducción masiva sin autorización previa`
  },
  {
    title: "4. Cuentas de Usuario",
    content: `Algunas funcionalidades de FCH Noticias requieren crear una cuenta. Al registrarte:

• Debes proporcionar información veraz y actualizada
• Eres responsable de mantener la confidencialidad de tus credenciales
• Notificarás inmediatamente cualquier uso no autorizado de tu cuenta
• Tienes al menos 13 años de edad`
  },
  {
    title: "5. Contenido Generado por Usuarios",
    content: `Si la plataforma permite comentarios o contenido generado por usuarios:

• Mantén un tono respetuoso en todas las interacciones
• No publiques contenido ofensivo, discriminatorio o ilegal
• No hagas spam ni promoción no autorizada
• Nos reservamos el derecho de eliminar contenido que viole estas normas
• Eres responsable del contenido que publicas`
  },
  {
    title: "6. Limitación de Responsabilidad",
    content: `FCH Noticias se esfuerza por proporcionar información precisa y actualizada, pero:

• No garantizamos la exactitud absoluta de toda la información
• Las opiniones expresadas son de los autores y no necesariamente representan nuestra postura
• No nos hacemos responsables por decisiones tomadas basadas en nuestra información
• El uso de la plataforma es bajo tu propio riesgo`
  },
  {
    title: "7. Enlaces a Terceros",
    content: `Nuestra plataforma puede contener enlaces a sitios externos:

• No tenemos control sobre el contenido de sitios de terceros
• No respaldamos necesariamente las opiniones expresadas en sitios enlazados
• Te recomendamos revisar los términos de uso de cualquier sitio externo`
  },
  {
    title: "8. Terminación",
    content: `Nos reservamos el derecho de:

• Suspender o terminar tu acceso a la plataforma
• Eliminar contenido que viole estos términos
• Tomar medidas legales en caso de uso inapropiado

Estos términos constituyen el acuerdo completo entre tú y FCH Noticias.`
  },
];

export default function Terms() {
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
            <FileText className="w-8 h-8 text-[#E30613]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Última actualización: {new Date().toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Alert */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 mb-8 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Importante:</strong> Al utilizar FCH Noticias, aceptas estos términos. 
              Si tienes alguna duda, por favor <Link href="/contact" className="underline">contáctanos</Link>.
            </p>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {sections.map((section, index) => (
            <motion.section
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="bg-white dark:bg-[#111] rounded-xl p-6 border border-gray-200 dark:border-white/5"
            >
              <h2 className="font-heading text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {section.title}
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                {section.content.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-gray-600 dark:text-gray-400 mb-4 last:mb-0 whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.section>
          ))}
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center bg-gray-50 dark:bg-white/5 rounded-xl p-6"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            ¿Tienes preguntas sobre estos términos?
          </p>
          <Link href="/contact">
            <Button>Contactar con nosotros</Button>
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
}
