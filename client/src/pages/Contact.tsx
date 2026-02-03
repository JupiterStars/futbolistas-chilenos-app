import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  Mail,
  MessageSquare,
  Send,
  Instagram,
  Twitter,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const contactReasons = [
  { value: "general", label: "Consulta General" },
  { value: "suggestion", label: "Sugerencia" },
  { value: "error", label: "Reportar Error" },
  { value: "press", label: "Prensa/Medios" },
  { value: "business", label: "Negocios/Colaboraciones" },
  { value: "derechos", label: "Derechos de Autor" },
];

const socialLinks = [
  {
    icon: Instagram,
    label: "Instagram",
    handle: "@fchnoticias",
    href: "https://instagram.com/fchnoticias",
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    icon: Twitter,
    label: "Twitter",
    handle: "@fchnoticias",
    href: "https://twitter.com/fchnoticias",
    color: "bg-blue-500",
  },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    reason: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    toast.success("¡Mensaje enviado! Te responderemos pronto.");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 rounded-full bg-[#E30613]/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#E30613]" />
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold mb-4">
            Contacto
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            ¿Tienes algo que contarnos? Estamos aquí para escucharte. 
            Envíanos tu mensaje y te responderemos lo antes posible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardContent className="p-6">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="font-heading text-2xl font-bold mb-2">
                      ¡Mensaje Enviado!
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Gracias por contactarnos. Te responderemos a la brevedad.
                    </p>
                    <Button onClick={() => setIsSubmitted(false)}>
                      Enviar otro mensaje
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Tu nombre"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="tu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Motivo de contacto</Label>
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E30613]"
                      >
                        {contactReasons.map((reason) => (
                          <option key={reason.value} value={reason.value}>
                            {reason.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Escribe tu mensaje aquí..."
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-[#E30613] hover:bg-[#c70510]"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar mensaje
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Social Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#E30613]" />
                  Redes Sociales
                </h3>
                <div className="space-y-3">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                      >
                        <div className={`w-10 h-10 rounded-lg ${social.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{social.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {social.handle}
                          </p>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#E30613]" />
                  ¿Necesitas ayuda?
                </h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>
                    <Link href="/terms" className="hover:text-[#E30613] transition-colors">
                      • Términos y Condiciones
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-[#E30613] transition-colors">
                      • Política de Privacidad
                    </Link>
                  </li>
                  <li>
                    <Link href="/support" className="hover:text-[#E30613] transition-colors">
                      • Apoyar el Proyecto
                    </Link>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Response Time */}
            <div className="bg-[#E30613]/10 rounded-xl p-4 text-center">
              <p className="text-sm text-[#E30613] font-medium">
                ⏱️ Tiempo de respuesta: 24-48 horas
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
