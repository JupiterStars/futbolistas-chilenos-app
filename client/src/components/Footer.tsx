import { Link } from "wouter";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";

const footerLinks = {
  legal: [
    { label: "Términos y Condiciones", href: "/terms" },
    { label: "Política de Privacidad", href: "/privacy" },
    { label: "Descargo de Responsabilidad", href: "/disclaimer" },
    { label: "Contacto", href: "/contact" },
  ],
};

const socialLinks = [
  { 
    label: "Instagram", 
    href: "https://instagram.com/fchnoticias", 
    icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    )
  },
  { 
    label: "TikTok", 
    href: "https://tiktok.com/@fchnoticias", 
    icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    )
  },
  { 
    label: "Twitter", 
    href: "https://twitter.com/fchnoticias", 
    icon: () => (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    )
  },
];

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5">
      <div className="container py-8 md:py-12">
        {/* Main Footer Content - Layout matching reference home3.png */}
        <div className="mb-8">
          {/* Logo and Description */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md shrink-0">
              <img 
                src="/logo.jpg" 
                alt="FCH Noticias" 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-heading font-bold text-xl text-gray-900 dark:text-white">
                FCH Noticias
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6">
            Tu fuente de noticias del fútbol chileno. Cobertura completa de chilenos en el extranjero, la roja y categorías juveniles.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-3 mb-8">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-[#E30613] hover:border-[#E30613]/30 transition-colors"
                  aria-label={link.label}
                >
                  <Icon />
                </motion.a>
              );
            })}
          </div>

          {/* Legal Section */}
          <div className="mb-8">
            <h4 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-4">
              Legal
            </h4>
            <div className="flex flex-col gap-3">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#E30613] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support Card - Matching reference style */}
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-2xl p-5 max-w-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5 text-[#E30613]" />
              </div>
              <div className="flex-1">
                <h4 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-1">
                  Apoya Nuestro Trabajo
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Gracias a ti este proyecto se mantiene vivo.
                </p>
                <Link 
                  href="/support"
                  className="inline-flex items-center gap-1 text-sm font-medium text-[#E30613] hover:gap-2 transition-all"
                >
                  Quiero Apoyar
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-gray-200 dark:border-white/5 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            © {new Date().getFullYear()} FCH Noticias. Todos los derechos reservados.
          </p>
          <p className="text-sm text-gray-400">
            Hecho con{" "}
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="inline-block text-[#E30613]"
            >
              <Heart className="w-3 h-3 inline fill-[#E30613]" />
            </motion.span>{" "}
            por Atlas Tecnologic
          </p>
        </div>
      </div>
    </footer>
  );
}
