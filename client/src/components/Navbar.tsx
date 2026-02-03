import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  Sun,
  Moon,
  User,
  Heart,
  LogOut,
  Search,
  Home,
  Newspaper,
  Trophy,
  Users,
  ArrowRightLeft,
  X,
  ChevronRight,
  HeartHandshake,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const categoryLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/category/la-roja", label: "LA ROJA", icon: Newspaper },
  { href: "/category/extranjero", label: "Extranjero", icon: Newspaper },
  { href: "/category/u20", label: "U20", icon: Newspaper },
  { href: "/category/u18", label: "U18", icon: Newspaper },
  { href: "/category/u17", label: "U17", icon: Newspaper },
  { href: "/category/u16", label: "U16", icon: Newspaper },
  { href: "/category/u15", label: "U15", icon: Newspaper },
  { href: "/category/entrevistas", label: "Entrevistas", icon: Newspaper },
  { href: "/category/mercado", label: "Mercado de Pases", icon: ArrowRightLeft },
];

const navLinks = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/players", label: "Jugadores", icon: Users },
  { href: "/leaderboards", label: "Rankings", icon: Trophy },
  { href: "/transfers", label: "Fichajes", icon: ArrowRightLeft },
];

export default function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: categories } = trpc.categories.list.useQuery();
  const { data: trendingNews } = trpc.news.list.useQuery({ limit: 5 });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <>
      {/* Main Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="sticky top-0 z-50 w-full bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5"
      >
        <div className="container flex h-16 items-center justify-between">
          {/* Left - Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 dark:hover:bg-white/5">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#09090b]">
              <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md">
                      <img 
                        src="/logo.jpg" 
                        alt="FCH Noticias" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-heading font-bold text-xl">
                      <span className="text-[#E30613]">FCH</span>
                      <span className="text-gray-900 dark:text-white"> Noticias</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Search in Sidebar */}
              <div className="p-4">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Buscar noticias..."
                      className="pl-10 bg-gray-100 dark:bg-white/5 border-0 focus-visible:ring-[#E30613]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </form>
              </div>

              {/* Categories Section */}
              <div className="px-4 pb-2">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Categorías
                </p>
              </div>
              <nav className="px-2 pb-4">
                {categoryLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive
                            ? "bg-[#E30613]/10 text-[#E30613] font-medium"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </div>
                    </Link>
                  );
                })}
              </nav>

              {/* Other Links */}
              <div className="border-t border-gray-200 dark:border-white/10 p-2">
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    Nosotros
                  </div>
                </Link>
                <Link href="/support" onClick={() => setMobileMenuOpen(false)}>
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
                    Apoya el Proyecto
                  </div>
                </Link>
              </div>

              {/* Dark Mode Toggle */}
              {toggleTheme && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#09090b]">
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                  >
                    {theme === "dark" ? (
                      <>
                        <Sun className="w-4 h-4" />
                        Modo Claro
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4" />
                        Modo Oscuro
                      </>
                    )}
                  </button>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Center - Logo */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-red-500/20">
                <img 
                  src="/logo.jpg" 
                  alt="FCH Noticias" 
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </Link>

          {/* Right - Theme Toggle & User */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
              onClick={toggleTheme}
              disabled={!toggleTheme}
            >
              <AnimatePresence mode="wait">
                {theme === "dark" ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>

            {/* User Avatar (if authenticated) */}
            {isAuthenticated && user && (
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-[#E30613]/20">
                  <AvatarImage src={user.avatar || undefined} />
                  <AvatarFallback className="bg-[#E30613] text-white text-xs">
                    {user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}
          </div>
        </div>
      </motion.header>
    </>
  );
}
