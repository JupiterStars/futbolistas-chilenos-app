# 🇨🇱 Chilenos Young

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License">
</p>

<p align="center">
  <strong>Portal de noticias y estadísticas de fútbol chileno</strong><br>
  Descubre a las jóvenes promesas del fútbol chileno
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-scripts">Scripts</a> •
  <a href="#-documentation">Docs</a>
</p>

---

## 🌟 Features

### 📰 Sistema de Noticias
- ✅ Publicación de noticias con editor rico
- ✅ Categorías personalizables
- ✅ Noticias destacadas (featured)
- ✅ Búsqueda full-text
- ✅ Vistas y métricas

### ⚽ Gestión de Jugadores
- ✅ Perfiles detallados de jugadores
- ✅ Estadísticas completas (goles, asistencias, partidos)
- ✅ Valor de mercado
- ✅ Posiciones y equipos
- ✅ Clasificaciones (goleadores, asistencias)

### 🔄 Transferencias
- ✅ Tracking de movimientos entre equipos
- ✅ Transferencias, préstamos y fichajes libres
- ✅ Estados: confirmado, rumor, pendiente

### ❤️ Sistema de Favoritos
- ✅ Guardar noticias favoritas
- ✅ Seguir jugadores
- ✅ Persistencia en base de datos
- ✅ Sincronización offline

### 🔐 Autenticación
- ✅ OAuth con Manus
- ✅ JWT tokens seguros
- ✅ Protección de rutas
- ✅ Roles (usuario, admin)

### 📱 PWA & Offline
- ✅ Progressive Web App
- ✅ Soporte offline completo
- ✅ IndexedDB para caché
- ✅ Sincronización en background
- ✅ Instalable en móviles

### 🎨 UI/UX
- ✅ Diseño responsive (mobile-first)
- ✅ Modo oscuro/claro
- ✅ Animaciones con Framer Motion
- ✅ Skeleton loaders
- ✅ Infinite scroll
- ✅ Lazy loading de imágenes
- ✅ Optimización WebP/AVIF

---

## 🛠 Tech Stack

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.2 | UI library |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool |
| Tailwind CSS | 4 | Styling |
| Wouter | 3.3 | Routing |
| TanStack Query | 5.90 | Server state |
| tRPC | 11.6 | Type-safe API |
| Framer Motion | 12 | Animations |
| shadcn/ui | latest | UI components |
| Radix UI | latest | Primitives |

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Express | 4.21 | HTTP server |
| tRPC | 11.6 | API procedures |
| Drizzle ORM | 0.44 | Database ORM |
| PostgreSQL | 15 | Database |
| JWT (jose) | 6.1 | Authentication |
| Zod | 4.1 | Validation |

### DevOps
| Tecnología | Uso |
|------------|-----|
| Vercel | Hosting & Serverless |
| GitHub Actions | CI/CD |
| Drizzle Kit | Migrations |

---

## 🚀 Quick Start

### Prerrequisitos
- Node.js 20.x
- PostgreSQL 15+
- pnpm (recomendado) o npm

### 1. Clonar y instalar

```bash
git clone <repo-url>
cd chilenos-young
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

Variables requeridas:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/fch_noticias
MANUS_OAUTH_CLIENT_ID=tu_client_id
MANUS_OAUTH_CLIENT_SECRET=tu_client_secret
JWT_SECRET=secreto_seguro_32_chars
SESSION_SECRET=otro_secreto_32_chars
```

### 3. Configurar base de datos

```bash
# Crear base de datos
psql -c "CREATE DATABASE fch_noticias;"

# Ejecutar migraciones
pnpm db:push

# (Opcional) Cargar datos de prueba
pnpm db:seed
```

### 4. Iniciar desarrollo

```bash
pnpm dev
```

La aplicación estará disponible en:
- 🌐 Frontend: http://localhost:5173
- 🔌 API: http://localhost:3000/api

---

## 📜 Scripts

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo con hot reload

# Build
pnpm build            # Build de producción (frontend + backend)
pnpm start            # Inicia servidor de producción

# TypeScript
pnpm check            # Verificación de tipos
pnpm format           # Formatear código con Prettier

# Testing
pnpm test             # Ejecutar tests con Vitest

# Base de datos
pnpm db:generate      # Generar migraciones
pnpm db:migrate       # Aplicar migraciones
pnpm db:push          # Generar y aplicar migraciones
pnpm db:seed          # Cargar datos de prueba
pnpm db:studio        # Abrir Drizzle Studio

# Deploy
pnpm deploy:vercel    # Deploy a Vercel (preview)
pnpm deploy:vercel:prod  # Deploy a Vercel (producción)
```

---

## 📚 Documentation

| Documento | Descripción |
|-----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Arquitectura y decisiones técnicas |
| [DATABASE.md](./DATABASE.md) | Schema y operaciones de BD |
| [DEPLOY.md](./DEPLOY.md) | Guía de deployment a Vercel |
| [CHANGELOG.md](./CHANGELOG.md) | Historial de cambios |
| [CLAUDE.md](./CLAUDE.md) | Guía para desarrolladores |

---

## 🏗 Estructura del Proyecto

```
chilenos-young/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas/Rutas
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utilidades y configuración
│   │   └── types/          # Tipos TypeScript
│   └── public/             # Assets estáticos
├── server/                 # Backend Express + tRPC
│   ├── _core/              # Configuración core
│   ├── routers/            # tRPC routers
│   └── db/                 # Schema y conexión
├── shared/                 # Código compartido
├── drizzle/                # Migraciones de BD
└── dist/                   # Build de producción
```

---

## 🎨 Colores del Tema

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo Chile | `#E30613` | Primario, acentos |
| Azul | `#0039A6` | Secundario, links |

---

## 🤝 Contributing

1. Fork el repositorio
2. Crea tu feature branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📄 License

Este proyecto está licenciado bajo MIT License - ver [LICENSE](./LICENSE) para detalles.

---

<p align="center">
  Hecho con ❤️ para el fútbol chileno
</p>
