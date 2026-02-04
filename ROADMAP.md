# 🚀 ROADMAP - FCH Noticias PWA Production-Ready

## 📊 Análisis Inicial del Codebase

### Stack Tecnológico Confirmado
- **Frontend:** React 19 + TypeScript 5.9 + Vite 7.1 + Tailwind 4.1
- **Backend:** Express 4.21 + tRPC 11.6 + Drizzle ORM 0.44
- **Base de Datos:** PostgreSQL (Vercel Postgres)
- **Navegación:** Wouter 3.3
- **Estado:** TanStack Query 5.90 + React Context
- **UI:** shadcn/ui 53 componentes + Framer Motion 12.23
- **Build:** Esbuild + Vite

### Páginas Identificadas (19)
1. Home - Hero carousel + news grid
2. NewsList - Listado con filtros
3. NewsDetail - Detalle de noticia
4. Category - 9 categorías dinámicas
5. Players - Grid de jugadores
6. PlayerDetail - Perfil con stats
7. Leaderboards - Rankings
8. Transfers - Fichajes
9. Search - Búsqueda global
10. Favorites - Guardados del usuario
11. About - Nosotros
12. Support - Donaciones
13. Terms - Términos
14. Privacy - Privacidad
15. Disclaimer - Descargo
16. Contact - Formulario
17. NotFound - 404
18. ComponentShowcase - Dev
19. Profile - Perfil usuario

### APIs tRPC Existentes
- news.list/featured/bySlug
- categories.list
- players.list/bySlug/stats
- leaderboards.get
- transfers.list
- favorites.list/add/remove
- search.query

### Problemas Críticos Identificados

| Issue | Impacto | Severidad |
|-------|---------|-----------|
| Bundle ~1MB sin gzip | Performance | 🔴 Crítico |
| Sin code splitting | Load time | 🔴 Crítico |
| Sin lazy loading imágenes | LCP | 🔴 Crítico |
| Sin Service Worker efectivo | Offline | 🔴 Crítico |
| Sin IndexedDB | Offline data | 🔴 Crítico |
| Sin skeleton loading | UX | 🟡 Alto |
| BD sin seeds reales | Funcionalidad | 🔴 Crítico |
| FCP ~3s (target <1.5s) | Performance | 🔴 Crítico |
| Sin infinite scroll | UX | 🟡 Medio |
| Sin caché de API | Performance | 🟡 Alto |

---

## 🎯 Objetivos y Constraints

### Targets
- **Bundle:** <500KB gzipped (actual ~1MB)
- **FCP:** <1.5s (actual ~3s)
- **TTI:** <3s
- **Lighthouse:** >90 en todas las categorías
- **Offline:** 50 noticias cached mínimo
- **PWA:** Installable con manifest válido

### Constraints
- TypeScript strict (no any)
- Zero warnings en build
- Reutilizar 53 componentes shadcn/ui existentes
- Functional components only
- Chrome 90+ / Safari 14+
- tRPC type-safe obligatorio
- Drizzle migraciones versionadas

---

## 🏗️ Arquitectura de Ejecución

### FASE 1: PLANNER AGENT (Secuencial) ✅
**Output:** ROADMAP.md (este archivo)
- [x] Análisis de codebase
- [x] Identificación de dependencias
- [x] Roadmap con 5 fases
- [x] Priorización de tareas

### FASE 2: BLOQUE PARALELO (3 sub-agentes simultáneos)

#### Sub-Agent 1: Performance Optimizer
**Input:** 19 páginas, vite.config.ts
**Output:** 
- React.lazy() en 19 páginas
- Vite code splitting configurado
- vite-plugin-compression
- Reporte de bundle size

**Tareas:**
1. Crear `client/src/pages/index.ts` con lazy exports
2. Actualizar `App.tsx` con Suspense + lazy
3. Configurar `vite.config.ts` con manualChunks
4. Agregar `@vitejs/plugin-compression`
5. Optimizar imports (tree shaking)
6. Configurar preload/prefetch crítico

#### Sub-Agent 2: Image Optimizer
**Input:** 19 páginas con imágenes
**Output:**
- `OptimizedImage.tsx` componente
- Soporte WebP/AVIF con fallback
- Lazy loading nativo
- srcset responsive

**Tareas:**
1. Crear `client/src/components/OptimizedImage.tsx`
2. Implementar `loading="lazy"` + `decoding="async"`
3. Configurar srcset con 320w/640w/1024w
4. WebP con fallback JPG/PNG
5. Placeholder blur/skeleton mientras carga
6. Reemplazar todas las `<img>` por `<OptimizedImage>`

#### Sub-Agent 3: Backend Schema Designer
**Input:** Requerimientos de noticias/jugadores/categorías
**Output:**
- Schema Drizzle completo (6 tablas)
- Relaciones FK definidas
- Índices estratégicos
- Tipos TypeScript compartidos

**Tareas:**
1. Crear `server/db/schema.ts`
2. Tabla `news` con campos: id, title, slug, excerpt, content, imageUrl, categoryId, authorId, publishedAt, views, createdAt, updatedAt
3. Tabla `categories` con campos: id, name, slug, description, color, icon, createdAt
4. Tabla `players` con campos: id, name, slug, position, team, nationality, age, height, weight, imageUrl, stats JSON, marketValue, createdAt
5. Tabla `transfers` con campos: id, playerId, fromTeam, toTeam, date, fee, type, status, createdAt
6. Tabla `favorites` con campos: id, userId, newsId?, playerId?, createdAt
7. Tabla `leaderboards` con campos: id, type, data JSON, updatedAt
8. Índices: slug (unique), categoryId, publishedAt, playerId
9. Relaciones: news.categoryId → categories.id, transfers.playerId → players.id, favorites.newsId → news.id, favorites.playerId → players.id

### FASE 3: BLOQUE PARALELO (4 sub-agentes simultáneos)

#### Sub-Agent 4: Backend Implementer
**Input:** Schema, APIs tRPC existentes
**Output:**
- Migraciones aplicadas a Vercel Postgres
- `seed.ts` con 50 noticias + 30 jugadores + 9 categorías
- CORS y rate limiting configurados
- tRPC queries optimizados

**Tareas:**
1. Ejecutar `drizzle-kit generate` con nuevo schema
2. Crear `server/db/seed.ts` con datos reales de fútbol chileno
3. Configurar CORS en Express
4. Implementar rate limiting (100 req/min)
5. Optimizar tRPC queries con select() específico
6. Crear comando `npm run seed`

#### Sub-Agent 5: PWA Service Worker Architect
**Input:** manifest.json existente
**Output:**
- Workbox configurado
- Cache-First para assets
- Network-First para API
- Precaching shell app
- Runtime caching imágenes/API
- Fallback offline

**Tareas:**
1. Instalar `workbox-build`, `workbox-window`
2. Crear `workbox-config.js`
3. Generar SW con precaching de shell
4. Runtime cache para `/api/trpc/*` (NetworkFirst)
5. Runtime cache para imágenes (CacheFirst, max 50)
6. Fallback offline page
7. Background Sync para favoritos

#### Sub-Agent 6: IndexedDB Manager
**Input:** Requerimientos offline
**Output:**
- Wrapper IndexedDB con `idb` library
- Caché automático 50 noticias
- Sincronización bidireccional
- Limpieza caché >7 días
- Hook `useOfflineData`

**Tareas:**
1. Instalar `idb` (IndexedDB wrapper)
2. Crear `client/src/lib/db.ts` con schema IndexedDB
3. Crear `client/src/hooks/useOfflineData.ts`
4. Funciones: cacheNews(), getCachedNews(), syncWithBackend()
5. Limpieza automática de noticias viejas
6. Integrar con tRPC para cache offline

#### Sub-Agent 7: UX Components Creator
**Input:** 53 componentes shadcn/ui existentes
**Output:**
- 5 Skeletons (NewsCard, PlayerCard, List, Grid, Detail)
- InfiniteScroll con IntersectionObserver
- EmptyState con SVG y CTAs
- LoadingOverlay
- ToastManager

**Tareas:**
1. Crear `client/src/components/skeletons/NewsCardSkeleton.tsx`
2. Crear `client/src/components/skeletons/PlayerCardSkeleton.tsx`
3. Crear `client/src/components/skeletons/ListSkeleton.tsx`
4. Crear `client/src/components/skeletons/GridSkeleton.tsx`
5. Crear `client/src/components/skeletons/DetailSkeleton.tsx`
6. Crear `client/src/components/InfiniteScroll.tsx` con IntersectionObserver
7. Crear `client/src/components/EmptyState.tsx` con ilustraciones SVG
8. Crear `client/src/components/LoadingOverlay.tsx`
9. Configurar Sonner ToastManager global

### FASE 4: INTEGRATION MASTER (Secuencial)

**Input:** Todos los outputs de Fases 2 y 3
**Output:** App integrada y funcional

**Tareas:**
1. Integrar lazy loading con Suspense + Skeleton en 19 páginas
2. Reemplazar `<img>` por `<OptimizedImage>` en todas las páginas
3. Implementar InfiniteScroll en NewsList y Players
4. Integrar `cacheNews()` en NewsDetail
5. Conectar Service Worker con manifest
6. Agregar EmptyState en todas las listas vacías
7. Implementar toasts en todas las mutaciones tRPC
8. Validar tRPC con caché TanStack Query
9. Testing manual completo de flujos críticos

**Orden de integración:**
1. Performance (lazy loading) → 2. Imágenes → 3. Skeletons → 4. InfiniteScroll → 5. IndexedDB → 6. Service Worker → 7. Toasts → 8. Testing

### FASE 5: BLOQUE PARALELO (2 sub-agentes simultáneos)

#### Sub-Agent 8: QA Testing Engineer
**Input:** App integrada
**Output:**
- Reporte Lighthouse 5 páginas
- Testing responsive 5 breakpoints
- Testing offline completo
- Testing PWA installability
- Reporte accesibilidad axe-core
- Medición bundle vite-bundle-visualizer

**Tareas:**
1. Lighthouse CI en Home, NewsList, NewsDetail, Players, Search
2. Screenshots responsive: 320px, 375px, 768px, 1024px, 1920px
3. Testing offline: desconectar WiFi, navegar, verificar caché
4. Testing PWA: Chrome Android, Safari iOS, Add to Home Screen
5. axe-core accesibilidad audit
6. vite-bundle-visualizer reporte
7. Testing edge cases: empty states, errores de red, slow 3G

#### Sub-Agent 9: Documentation Writer
**Input:** Proyecto completo
**Output:**
- README.md actualizado
- DEPLOY.md
- DATABASE.md
- ARCHITECTURE.md
- CHANGELOG.md
- JSDoc en componentes
- .env.example

**Tareas:**
1. README.md: setup, features, tech stack, screenshots
2. DEPLOY.md: paso a paso Vercel, variables de entorno, dominio
3. DATABASE.md: schema, migraciones, seeds, backups
4. ARCHITECTURE.md: diagramas de flujo, decisiones técnicas
5. CHANGELOG.md: v1.0.0 features
6. JSDoc en 10 componentes principales
7. .env.example completo

---

## 📦 Deliverables Finales

### Código
- [ ] 19 páginas con lazy loading + Suspense
- [ ] 7 componentes UX nuevos
- [ ] 1 componente OptimizedImage
- [ ] Service Worker Workbox funcional
- [ ] IndexedDB manager completo
- [ ] Schema 6 tablas Drizzle
- [ ] Seed.ts con 50 noticias + 30 jugadores + 9 categorías

### Performance
- [ ] Bundle <500KB gzipped
- [ ] FCP <1.5s
- [ ] TTI <3s
- [ ] Lighthouse >90
- [ ] 50 noticias offline

### Documentación
- [ ] README.md
- [ ] DEPLOY.md
- [ ] DATABASE.md
- [ ] ARCHITECTURE.md
- [ ] CHANGELOG.md
- [ ] JSDoc componentes
- [ ] .env.example

### Testing
- [ ] Reporte Lighthouse 5 páginas
- [ ] Reporte responsive 5 breakpoints
- [ ] Reporte offline testing
- [ ] Reporte PWA installability
- [ ] Reporte accesibilidad
- [ ] Reporte bundle analysis

---

## 🎯 Checklist de Éxito

### Antes de empezar
- [x] Análisis de codebase completado
- [x] ROADMAP.md creado
- [x] 9 sub-agentes definidos
- [x] 5 fases planificadas

### Fase 2 (Paralelo)
- [ ] Performance Optimizer: lazy loading + code splitting
- [ ] Image Optimizer: OptimizedImage componente
- [ ] Backend Schema: 6 tablas con relaciones

### Fase 3 (Paralelo)
- [ ] Backend Implementer: BD con seeds
- [ ] PWA Architect: Service Worker Workbox
- [ ] IndexedDB Manager: caché offline
- [ ] UX Creator: 5 skeletons + InfiniteScroll

### Fase 4 (Integración)
- [ ] Integración lazy loading en 19 páginas
- [ ] Integración OptimizedImage
- [ ] Integración Skeletons
- [ ] Integración InfiniteScroll
- [ ] Integración IndexedDB
- [ ] Integración Service Worker
- [ ] Testing manual

### Fase 5 (Paralelo)
- [ ] QA Testing: Lighthouse + responsive + offline
- [ ] Documentation: 7 documentos completos

### Post-entrega
- [ ] Build producción exitoso
- [ ] Deploy en Vercel
- [ ] BD Vercel Postgres configurada
- [ ] Dominio configurado
- [ ] SSL activo
- [ ] PWA installable

---

## ⏱️ Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|--------------|
| FASE 1: Planner | 30 min | Ninguna ✅ |
| FASE 2: Paralelo (3 agents) | 2-3 horas | Fase 1 |
| FASE 3: Paralelo (4 agents) | 3-4 horas | Fase 2 |
| FASE 4: Integration | 2-3 horas | Fase 3 |
| FASE 5: Paralelo (2 agents) | 1-2 horas | Fase 4 |
| **TOTAL** | **~10-12 horas** | Secuencial |

---

## 🎨 Estética y UX Guidelines

### Paleta de Colores
- **Primario:** `#E30613` (Rojo Chile)
- **Secundario:** `#FFA500` (Naranja/Amber)
- **Fondo claro:** `#FFFFFF`
- **Fondo oscuro:** `#0A0A0A`
- **Texto claro:** `#171717`
- **Texto oscuro:** `#FAFAFA`
- **Skeleton:** `#E5E5E5` / `#262626`

### Tipografía
- **Headings:** Oswald (font-heading)
- **Body:** Inter (font-sans)

### Espaciado
- Container: max-w-7xl mx-auto
- Padding: px-4 sm:px-6 lg:px-8
- Gap entre cards: gap-4

### Animaciones
- **Entrada:** opacity 0→1, y: 20→0, duration: 0.3s
- **Hover:** scale 1.02, transition: 0.2s
- **Skeleton:** pulse animation

### Componentes shadcn/ui a reutilizar
- Button (variants: default, outline, ghost)
- Card (CardHeader, CardContent, CardFooter)
- Badge (para categorías)
- Skeleton (para loading states)
- Input (para búsqueda)
- Dialog (para modales)
- Sheet (para menú móvil)
- Tabs (para filtros)

---

*Generado por PLANNER AGENT - FCH Noticias PWA Transformation*
*Fecha: 2026-02-03*
*Versión: 1.0*
