# Bundle Analysis Report

**Fecha:** 2026-02-04  
**Projecto:** FCH Noticias - Fútbol Chileno  
**Total Bundle Size:** ~25MB (sin comprimir) / ~4.5MB (gzipped)

---

## Top 20 Chunks por Tamaño (Sin comprimir)

| # | Chunk | Tamaño | Gzipped | Tipo |
|---|-------|--------|---------|------|
| 1 | lib-CbPRCuB8.js | 998 KB | 284 KB | ⚠️ Grande |
| 2 | emacs-lisp-BcpYGiHp.js | 780 KB | 196 KB | ⚠️ Grande |
| 3 | cpp-BmKY377x.js | 627 KB | 45 KB | ✅ Bien |
| 4 | wasm--yL7jHw-.js | 622 KB | 228 KB | ⚠️ Grande |
| 5 | vendor-core-zZU_nqfv.js | 555 KB | 164 KB | ⚠️ Grande |
| 6 | cytoscape.esm-1kS17NkT.js | 431 KB | 136 KB | ⚠️ Grande |
| 7 | mermaid.core-5Z0ytNwC.js | 384 KB | 100 KB | ⚠️ Grande |
| 8 | pages-D0K2uPcK.js | 356 KB | 76 KB | ✅ Bien |
| 9 | vendor-charts-DLrH2RJ6.js | 342 KB | 92 KB | ⚠️ Grande |
| 10 | wolfram-1xJNnwe2.js | 262 KB | 76 KB | ✅ Bien |
| 11 | vue-vine-2Gx6KHOr.js | 190 KB | - | ✅ Bien |
| 12 | angular-ts-5zO4eZho.js | 184 KB | - | ✅ Bien |
| 13 | typescript-DI7mmMRd.js | 181 KB | - | ✅ Bien |
| 14 | jsx-g2NrEQII.js | 178 KB | - | ✅ Bien |
| 15 | code-block-IT6T5CEO-DRPMOP4G.js | 177 KB | 56 KB | ✅ Bien |
| 16 | tsx-DYwE5ssU.js | 176 KB | - | ✅ Bien |
| 17 | javascript-DFyEbC5y.js | 175 KB | - | ✅ Bien |
| 18 | objective-cpp-DKXr-AK_.js | 172 KB | 32 KB | ✅ Bien |
| 19 | architectureDiagram-VXUJARFQ-Cv-ikABb.js | 146 KB | 40 KB | ✅ Bien |
| 20 | mdx-C8C9IGe9.js | 136 KB | 24 KB | ✅ Bien |

---

## Análisis de Chunks Grandes (>500KB)

### 1. lib-CbPRCuB8.js (998 KB / 284 KB gzipped)
**Contenido:** Librerías core de la aplicación
**Recomendación:** 
- Revisar qué dependencias están incluidas
- Considerar tree-shaking más agresivo
- Separar dependencias de terceros en chunks independientes

### 2. emacs-lisp-BcpYGiHp.js (780 KB / 196 KB gzipped)
**Contenido:** Parser de Emacs Lisp para syntax highlighting
**Recomendación:**
- Este lenguaje es raramente usado
- Cargar bajo demanda solo si es necesario

### 3. wasm--yL7jHw-.js (622 KB / 228 KB gzipped)
**Contenido:** WebAssembly runtime
**Recomendación:**
- Necesario para ciertas funcionalidades
- Considerar prefetching

### 4. vendor-core-zZU_nqfv.js (555 KB / 164 KB gzipped)
**Contenido:** Dependencias principales (React, etc.)
**Recomendación:**
- Dividir en React + Otras librerías
- Usar React.lazy para componentes no críticos

---

## Problemas Detectados

### Circular Chunks
```
⚠️ Circular chunk: lib -> vendor-core -> lib
⚠️ Circular chunk: hooks -> pages -> ui-components -> hooks
⚠️ Circular chunk: hooks -> pages -> hooks
```

**Impacto:** Puede causar problemas de carga y duplicación de código
**Solución:** Revisar importaciones y ajustar manualChunks en vite.config.ts

---

## Distribución del Bundle

```
┌─────────────────────────────────────────────────────────────┐
│ BUNDLE COMPOSITION                                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ████████████████████████████████████  Lib Core    ~1 MB   │
│  ████████████████████████              Languages   ~3 MB   │
│  ██████████████                        Vendor      ~1.5 MB │
│  ██████████                            Pages       ~1 MB   │
│  ███████                               Charts      ~0.5 MB │
│  █████                                 UI          ~0.4 MB │
│  ███                                   Utils       ~0.2 MB │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Recomendaciones

### 1. Code Splitting
```javascript
// Implementar en vite.config.ts
manualChunks: {
  'react-vendor': ['react', 'react-dom', 'react-router-dom'],
  'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', ...],
  'charts': ['recharts'],
  'mermaid-core': ['mermaid'],
  // Lenguajes de Mermaid cargados bajo demanda
}
```

### 2. Dynamic Imports para Lenguajes
```javascript
// Cargar lenguajes de sintaxis solo cuando se necesiten
const loadLanguage = (lang) => import(`./languages/${lang}.js`);
```

### 3. Preloading Estratégico
```html
<link rel="preload" href="/assets/vendor-core-xxx.js" as="script">
<link rel="preload" href="/assets/lib-xxx.js" as="script">
```

### 4. Tree Shaking
Verificar que las importaciones sean específicas:
```javascript
// ❌ Mal
import * as Recharts from 'recharts';

// ✅ Bien
import { LineChart, Line } from 'recharts';
```

---

## Métricas de Compresión

| Formato | Tamaño Total | Reducción |
|---------|-------------|-----------|
| Sin comprimir | ~25 MB | - |
| Gzip | ~4.5 MB | 82% |
| Brotli | ~3.8 MB | 85% |

---

## Archivos Generados

- 📊 `bundle-stats.html` - Visualización interactiva del bundle
- 📁 `dist/assets/` - 200+ chunks generados
- 📦 Precache: 377 entries (16MB aprox)

---

## Conclusión

El bundle es **aceptable pero optimizable**. Los principales problemas son:
1. Chunks circulares que pueden causar duplicación
2. Inclusión de todos los lenguajes de Mermaid
3. Algún chunk >500KB

**Prioridad de optimización:** MEDIA
