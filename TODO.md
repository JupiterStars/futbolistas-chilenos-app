# 📝 TODO - FCH Noticias

## 🚨 URGENTE - Para que la app funcione correctamente

### 1. Backend y Base de Datos

#### 1.1 Configurar variables de entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Base de datos (MySQL/PostgreSQL)
DATABASE_URL=mysql://usuario:password@host:3306/fchnoticias

# OAuth (opcional para auth)
MANUS_OAUTH_CLIENT_ID=
MANUS_OAUTH_CLIENT_SECRET=
MANUS_OAUTH_REDIRECT_URI=http://localhost:5173/api/oauth/callback
OAUTH_SERVER_URL=

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

#### 1.2 Configurar base de datos
- [ ] Crear base de datos MySQL/PostgreSQL
- [ ] Ejecutar migraciones: `npm run db:push`
- [ ] Ejecutar seed: `node seed-data.mjs`

#### 1.3 Iniciar servidor backend
```bash
npm run dev
```
Esto inicia el servidor en el puerto 3000 con la API.

---

### 2. Configuración PWA para Producción

#### 2.1 Actualizar URLs en manifest.json
Editar `client/public/manifest.json`:
- Cambiar `og:url` y `twitter:url` a tu dominio real
- Actualizar `shortcuts` con URLs correctas
- Agregar screenshots reales de la app

#### 2.2 Configurar Service Worker
El archivo `client/public/sw.js` está creado pero necesita:
- [ ] Probar funcionamiento offline
- [ ] Configurar cache de imágenes
- [ ] Configurar push notifications (opcional)

#### 2.3 Iconos PWA
- [x] ✅ Logo 192x192 creado
- [x] ✅ Logo 512x512 creado
- [ ] Verificar que los iconos se ven bien en móvil

---

### 3. Funcionalidades Pendientes

#### 3.1 Página de Contacto
El formulario de contacto (`client/src/pages/Contact.tsx`) necesita:
- [ ] Conectar con backend para enviar emails
- [ ] O integrar servicio como Formspree/EmailJS

#### 3.2 Página de Soporte/Donaciones
`client/src/pages/Support.tsx` necesita:
- [ ] Integrar plataforma de pagos (MercadoPago, PayPal, etc.)
- [ ] Crear planes de suscripción

#### 3.3 Notificaciones Push
- [ ] Configurar VAPID keys para push notifications
- [ ] Crear UI para suscribirse a notificaciones
- [ ] Backend endpoint para enviar pushes

---

### 4. Optimizaciones

#### 4.1 Performance
- [ ] Lazy loading de imágenes
- [ ] Code splitting por rutas
- [ ] Optimizar imágenes (WebP)
- [ ] Preconnect a dominios externos

#### 4.2 SEO
- [ ] Sitemap.xml
- [ ] robots.txt
- [ ] Meta tags dinámicos por página
- [ ] Structured data (JSON-LD)

#### 4.3 Accesibilidad
- [ ] ARIA labels
- [ ] Contraste de colores
- [ ] Navegación por teclado
- [ ] Screen reader support

---

### 5. Contenido

#### 5.1 Datos de prueba necesarios
Ejecutar para poblar la BD:
```bash
node seed-data.mjs
```

#### 5.2 Categorías requeridas
- Últimas Noticias
- Fichajes
- Análisis Tácticos
- Selección
- Ligas Europeas

#### 5.3 Imágenes faltantes
- [ ] Favicon.ico
- [ ] Apple touch icon
- [ ] Imágenes de jugadores
- [ ] Imágenes de equipos

---

### 6. Testing

#### 6.1 Tests unitarios
```bash
npm test
```

#### 6.2 Tests E2E
- [ ] Configurar Playwright/Cypress
- [ ] Test de navegación
- [ ] Test de formularios

#### 6.3 Testing en dispositivos
- [ ] Android (Chrome)
- [ ] iOS (Safari)
- [ ] Tablets
- [ ] Desktop

---

### 7. Deployment

#### 7.1 Build de producción
```bash
npm run build
```

#### 7.2 Deployment a Vercel
```bash
vercel --prod
```

#### 7.3 Configuración DNS
- [ ] Dominio personalizado
- [ ] SSL certificate
- [ ] CDN para assets estáticos

---

### 8. Monitoreo

#### 8.1 Analytics
- [ ] Google Analytics 4
- [ ] Umami (self-hosted)
- [ ] Hotjar/Microsoft Clarity

#### 8.2 Error tracking
- [ ] Sentry
- [ ] LogRocket

#### 8.3 Uptime monitoring
- [ ] UptimeRobot
- [ ] Pingdom

---

## 🎯 Checklist Pre-Launch

### Funcionalidad Core
- [ ] Home carga correctamente
- [ ] Navegación entre páginas funciona
- [ ] Noticias se muestran correctamente
- [ ] Jugadores se muestran correctamente
- [ ] Búsqueda funciona
- [ ] Filtros por categoría funcionan
- [ ] Modo oscuro/claro funciona
- [ ] PWA instalable (Add to Home Screen)

### Legal
- [ ] Términos y Condiciones actualizados
- [ ] Política de Privacidad actualizada
- [ ] Descargo de Responsabilidad actualizado
- [ ] Cookies notice (si aplica)

### Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] Cumulative Layout Shift < 0.1

---

## 🐛 Bugs Conocidos

1. **Error useContext en wouter**: ✅ Solucionado - mantener App.tsx como estaba originalmente
2. **Páginas nuevas sin datos**: Necesitan backend corriendo o mocks
3. **Carga lenta inicial**: Optimizar bundle size

---

## 📚 Documentación

- `CLAUDE.md` - Información del proyecto
- `DEPLOY_GUIDE.md` - Guía de deployment
- `DEPLOY_INSTRUCTIONS.md` - Instrucciones detalladas
- `security-report.md` - Reporte de seguridad

---

## 🔗 URLs Importantes

- Local dev: http://localhost:5173/
- API local: http://localhost:3000/
- GitHub: [AGREGAR REPO URL]
- Producción: [AGREGAR URL]

---

## 🆘 Comandos útiles

```bash
# Instalar dependencias
npm install

# Desarrollo (frontend + backend)
npm run dev

# Solo frontend
npx vite --host 0.0.0.0 --port 5173

# Build producción
npm run build

# Tests
npm test

# Database
npm run db:push

# Deploy Vercel
vercel --prod
```

---

*Última actualización: 2026-02-03*
