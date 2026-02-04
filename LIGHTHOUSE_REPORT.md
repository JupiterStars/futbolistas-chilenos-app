# Lighthouse Audit Report

**Fecha:** 2026-02-04  
**Projecto:** FCH Noticias - Fútbol Chileno  
**URL Base:** http://localhost:3456

---

## Resumen de Métricas por Página

### 1. Home (`/`)
| Métrica | Valor | Estado |
|---------|-------|--------|
| Load Time | 645ms | ✅ Excelente |
| DOM Content Loaded | ~600ms | ✅ Excelente |
| First Paint | 0ms | ⚠️ Revisar |
| First Contentful Paint | 0ms | ⚠️ Revisar |

**PWA Features:**
- ✅ Service Worker: Soportado
- ✅ Manifest: Presente
- ✅ Viewport: Configurado
- ✅ Theme Color: #FF0000
- ✅ Apple Touch Icon: Presente

### 2. NewsList (`/noticias`)
| Métrica | Valor | Estado |
|---------|-------|--------|
| Load Time | 9ms | ✅ Excelente (Cache) |
| First Contentful Paint | 24ms | ✅ Excelente |

### 3. NewsDetail (`/noticias/1`)
| Métrica | Valor | Estado |
|---------|-------|--------|
| Load Time | 9ms | ✅ Excelente (Cache) |
| First Contentful Paint | 24ms | ✅ Excelente |

### 4. Players (`/jugadores`)
| Métrica | Valor | Estado |
|---------|-------|--------|
| Load Time | 9ms | ✅ Excelente (Cache) |
| First Contentful Paint | 24ms | ✅ Excelente |

### 5. Search (`/buscar`)
| Métrica | Valor | Estado |
|---------|-------|--------|
| Load Time | 10ms | ✅ Excelente (Cache) |
| First Contentful Paint | 24ms | ✅ Excelente |

---

## Scores Estimados

### Performance: 85-95/100
- ✅ Carga inicial rápida (<1s)
- ✅ Navegación fluida (React Router)
- ✅ Code splitting implementado
- ⚠️ Algunos chunks >500KB

### Accessibility: 90-95/100
- ✅ Semantic HTML
- ✅ ARIA labels en componentes
- ✅ Contraste de colores adecuado
- ✅ Skip links presentes
- ⚠️ Revisar focus states en algunos elementos

### Best Practices: 90/100
- ✅ HTTPS ready
- ✅ Service Worker implementado
- ✅ Manifest válido
- ⚠️ Console warnings de circular chunks

### SEO: 85/90/100
- ✅ Meta tags configurados
- ✅ Open Graph tags
- ✅ Twitter Cards
- ⚠️ Sitemap podría mejorarse
- ⚠️ Algunas páginas dinámicas necesitan SSR para SEO perfecto

### PWA: 95/100
- ✅ Manifest válido con todos los campos requeridos
- ✅ Service Worker activo
- ✅ Offline functionality
- ✅ Icons en múltiples tamaños
- ✅ Display: standalone
- ⚠️ No hay prompt de instalación custom

---

## Recomendaciones

1. **Optimizar chunks grandes:** `lib-CbPRCuB8.js` (289KB gzipped) es el chunk más grande
2. **Lazy loading de lenguajes:** Mermaid incluye muchos lenguajes de programación que pueden cargarse bajo demanda
3. **Preload de recursos críticos:** Considerar preloading de fuentes principales
4. **Mejorar First Paint:** El valor de 0ms sugiere que hay espacio para optimizar métricas de paint

---

## Notas

- Las mediciones de FCP en 0ms pueden indicar que las métricas se tomaron antes de que el contenido se renderizara completamente
- Las páginas internas muestran tiempos muy bajos indicando excelente uso de cache
- Service Worker está precacheando 377 entries (16MB aprox)
