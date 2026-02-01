import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  Twitter, 
  Instagram, 
  Youtube,
  Mail,
} from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Inicio", href: "/" },
    { label: "Jugadores", href: "/players" },
    { label: "Rankings", href: "/leaderboards" },
    { label: "Fichajes", href: "/transfers" },
  ],
  legal: [
    { label: "Términos de Uso", href: "#" },
    { label: "Privacidad", href: "#" },
    { label: "Cookies", href: "#" },
  ],
  social: [
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "Instagram", href: "#", icon: Instagram },
    { label: "YouTube", href: "#", icon: Youtube },
    { label: "Email", href: "#", icon: Mail },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full gradient-chile flex items-center justify-center">
                <img src="/soccer-ball.png" alt="Logo" className="w-6 h-6 invert" />
              </div>
              <span className="font-bold text-xl">
                <span className="text-primary">Chilenos</span>
                <span className="text-secondary"> Young</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              La plataforma definitiva para seguir a las jóvenes promesas del fútbol chileno. 
              Noticias, estadísticas y análisis en tiempo real.
            </p>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-2">
              {footerLinks.platform.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social links */}
          <div>
            <h4 className="font-semibold mb-4">Síguenos</h4>
            <div className="flex gap-3">
              {footerLinks.social.map((link) => {
                const Icon = link.icon;
                return (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Chilenos Young. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Hecho con</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="text-primary"
            >
              ❤️
            </motion.span>
            <span className="text-sm text-muted-foreground">en Chile</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
