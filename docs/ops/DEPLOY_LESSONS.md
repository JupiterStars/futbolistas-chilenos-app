# CHILENOS YOUNG - Lecciones de Deploy a Vercel

## Resumen

Documentación de los problemas encontrados durante el deploy de la app CHILENOS YOUNG a Vercel, con soluciones aplicadas para futuros deployments.

---

## 📋 Checklist de Pre-Deploy (CRITICAL)

### 1. Dependency Management
- **❌ Problema**: pnpm 10.x incompatible con Vercel (error 254)
- **✅ Solución**: Usar `npm install` con `.npmrc` y `legacy-peer-deps=true`
- **File**: `.npmrc`
- **Comando**:
  ```bash
  echo "legacy-peer-deps=true" >> .npmrc
  npm install --legacy-peer-deps
  ```

### 2. Serverless Compatibility
- **❌ Problema**: App no exportada correctamente para Vercel
- **✅ Solución**: Mover app creation fuera de startServer()
- **File**: `server/_core/index.ts`
- **Código**:
  ```typescript
  const app = express();  // Moved outside
  export default app;     // Required for serverless
  if (process.env.NODE_ENV === "development") {
    startServer();  // Only listen in dev
  }
  ```

### 3. Schema Migration (MySQL → PostgreSQL)
- **❌ Problema**: Tipos de datos incompatibles
- **✅ Solución**: Convertir mysqlTable → pgTable
- **File**: `drizzle/schema.ts`
- **Cambios**:
  ```typescript
  // MySQL
  mysqlTable("users", { ... })

  // PostgreSQL
  pgTable("users", { ... })
  ```

### 4. Security (XSS Prevention)
- **❌ Problema**: Contenido HTML vulnerable en NewsDetail
- **✅ Solución**: Agregar DOMPurify sanitization
- **File**: `client/src/pages/NewsDetail.tsx`
- **Código**:
  ```typescript
  import DOMPurify from "dompurify";
  <div dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(news.content.replace(/\n/g, '<br/>'))
  }} />
  ```

### 5. Environment Variables Configuration
- **❌ Problema**: Variables faltando causan "TypeError: Invalid URL"
- **✅ Solución**: Código robusto para valores opcionales
- **File**: `client/src/const.ts`
- **Código**:
  ```typescript
  export const getLoginUrl = () => {
    const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
    const appId = import.meta.env.VITE_APP_ID;

    // If OAuth is not configured, redirect to home
    if (!oauthPortalUrl || !appId) {
      return "/?oauth-not-configured";
    }
    // ... rest of logic
  };
  ```

### 6. Vercel Configuration (SPA + API)
- **❌ Problema**: Catch-all rewrite capturaba rutas API
- **✅ Solución**: Configurar rewrites correctos
- **File**: `vercel.json`
- **Configuración**:
  ```json
  {
    "version": 2,
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/index.js" },
      { "source": "/(.*)", "destination": "/dist/public/index.html" }
    ]
  }
  ```

---

## 🔧 Variables de Entorno Requeridas para Vercel

### obligatorio para producción:
```bash
# Supabase Database
DATABASE_URL=postgresql://...

# JWT Secrets (generar: openssl rand -base64 32)
JWT_SECRET=[32 chars random]
SESSION_SECRET=[32 chars random]

# OAuth Manus (opcional - si se quiere autenticación)
VITE_OAUTH_PORTAL_URL=https://api.manus.dev
VITE_APP_ID=your_app_id
MANUS_OAUTH_CLIENT_ID=client_id
MANUS_OAUTH_CLIENT_SECRET=client_secret

# Site URL
NEXT_PUBLIC_SITE_URL=https://chilenos-young.vercel.app
```

### Opcional:
```bash
# Analytics (para eliminar warnings)
VITE_ANALYTICS_ENDPOINT=https://umami.example.com
VITE_ANALYTICS_WEBSITE_ID=website_id

# AWS S3 (para uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=key
AWS_SECRET_ACCESS_KEY=secret
AWS_S3_BUCKET=bucket_name
```

---

## 🛠️ Comandos Útiles

### Depurar problemas:
```bash
# Ver logs de deployment
vercel inspect [url] --logs

# Re-deploy
vercel redeploy [url]

# Probar local
npm run build
npm start
```

### Seguridad:
```bash
# Fix vulnerabilidades locales
npm audit fix

# Ver OWASP issues
npm audit --audit-level moderate
```

### Database:
```bash
# Push schema changes
pnpm db:push

# Ver tablas
pnpm studio
```

---

## ⚠️ Principales Causas de Falla

1. **Dependencies**: pnpm > npm (Vercel no soporta pnpm 10.x)
2. **Serverless**: Exportación de app obligatoria
3. **Environment**: Variables faltando causan runtime errors
4. **Routing**: Rewrites de Vercel deben manejar SPA + API
5. **Build Order**: Vite + esbuild simultáneamente
6. **TypeScript**: Tipos compatibles con PostgreSQL

---

## ✅ Checklist de Deploy Éxito

- [ ] `.npmrc` con legacy-peer-deps=true
- [ ] `server/_core/index.ts` export default app
- [ ] `vercel.json` rewrites correctos
- [ ] DOMPurify en contenido HTML
- [ `drizzle/schema.ts` adaptado a PostgreSQL
- [ ] Variables de entorno en Vercel panel
- [ ] Build exitoso: `pnpm build`
- [ ] Commit con mensajes limpios
- [ ] `git push` + `vercel --prod`

---

## 📝 Para Futuros Projects

1. Usar siempre `npm` no `pnpm` para Vercel
2. Probar `npm run build` localmente antes de deploy
3. Configurar variables de entorno en Vercel ANTES de deploy
4. Usar expresiones seguras para valores opcionales
5. Verificar compatibilidad serverless con exportación

> **Nota**: Este documento debe mantenerse actualizado con nuevos problemas y soluciones encontrados.