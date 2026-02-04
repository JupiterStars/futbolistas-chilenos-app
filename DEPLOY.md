# 🚀 Guía de Deployment

Guía completa para desplegar Chilenos Young en Vercel.

## Tabla de Contenidos

- [Deployment a Vercel](#deployment-a-vercel)
- [Variables de Entorno](#variables-de-entorno)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Dominio Personalizado](#dominio-personalizado)
- [Troubleshooting](#troubleshooting)

---

## Deployment a Vercel

### Paso 1: Preparar el Proyecto

1. **Asegúrate de tener el código en GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Verifica que el proyecto compila localmente**
   ```bash
   pnpm build
   ```

### Paso 2: Importar en Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Click en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Selecciona el proyecto `chilenos-young`

### Paso 3: Configurar Build Settings

En la página de configuración del proyecto:

| Setting | Valor |
|---------|-------|
| **Framework Preset** | `Other` |
| **Build Command** | `npm run build` o `pnpm build` |
| **Output Directory** | `dist` |
| **Install Command** | `pnpm install` |

### Paso 4: Configurar Variables de Entorno

Ve a **Settings > Environment Variables** y agrega:

#### Variables Requeridas

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | URL de conexión PostgreSQL |
| `JWT_SECRET` | `openssl rand -hex 64` | Secreto JWT (generar) |
| `SESSION_SECRET` | `openssl rand -hex 64` | Secreto de sesión (generar) |
| `MANUS_OAUTH_CLIENT_ID` | `tu_client_id` | Client ID de Manus OAuth |
| `MANUS_OAUTH_CLIENT_SECRET` | `tu_client_secret` | Client Secret de Manus |
| `MANUS_OAUTH_REDIRECT_URI` | `https://tusitio.vercel.app/api/oauth/callback` | URL de callback |
| `OAUTH_SERVER_URL` | `https://account.manus.im` | URL del servidor OAuth |
| `NEXT_PUBLIC_SITE_URL` | `https://tusitio.vercel.app` | URL pública del sitio |
| `NODE_ENV` | `production` | Modo producción |

#### Generar Secretos Seguros

```bash
# Generar JWT_SECRET
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generar SESSION_SECRET  
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Paso 5: Deploy

1. Click en **Deploy**
2. Espera a que el build complete (2-3 minutos)
3. Verifica que no haya errores en el log

---

## Variables de Entorno

### Desarrollo (.env.local)

```env
# Base de datos local
DATABASE_URL=postgresql://postgres:password@localhost:5432/fch_noticias

# OAuth Manus (desarrollo)
MANUS_OAUTH_CLIENT_ID=tu_dev_client_id
MANUS_OAUTH_CLIENT_SECRET=tu_dev_client_secret
MANUS_OAUTH_REDIRECT_URI=http://localhost:3000/api/oauth/callback

# JWT
JWT_SECRET=dev_secret_minimo_32_caracteres_para_jwt
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=dev_session_secret_minimo_32_chars

# URL
NEXT_PUBLIC_SITE_URL=http://localhost:5173

# OAuth
OAUTH_SERVER_URL=https://account.manus.im

# Modo
NODE_ENV=development
PORT=3000
```

### Producción (Vercel)

```env
# Base de datos (Vercel Postgres o externa)
DATABASE_URL=postgresql://user:pass@host.vercel-storage.com:5432/db

# OAuth Manus (producción)
MANUS_OAUTH_CLIENT_ID=tu_prod_client_id
MANUS_OAUTH_CLIENT_SECRET=tu_prod_client_secret
MANUS_OAUTH_REDIRECT_URI=https://tudominio.com/api/oauth/callback

# JWT (usar valores generados)
JWT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...
JWT_EXPIRES_IN=7d

# Session (usar valores generados)
SESSION_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx...

# URL
NEXT_PUBLIC_SITE_URL=https://tudominio.com

# OAuth
OAUTH_SERVER_URL=https://account.manus.im

# Modo
NODE_ENV=production
```

---

## Configuración de Base de Datos

### Opción 1: Vercel Postgres (Recomendado)

1. En el dashboard de Vercel, ve a **Storage**
2. Click en **Create Database** > **Postgres**
3. Selecciona tu proyecto y conecta
4. La variable `DATABASE_URL` se configurará automáticamente

### Opción 2: PostgreSQL Externo

1. Configura una instancia PostgreSQL (Railway, Supabase, AWS RDS)
2. Obtén la URL de conexión
3. Agrega la variable `DATABASE_URL` manualmente

### Ejecutar Migraciones

```bash
# Local
pnpm db:push

# En Vercel (usando CLI)
vercel env pull .env.production.local
pnpm db:push
```

O ejecuta manualmente:

```bash
# Conectar a BD de producción
export DATABASE_URL="postgresql://..."
pnpm drizzle-kit migrate
```

### Verificar Conexión

```bash
# Test de conexión
curl https://tusitio.vercel.app/api/health

# Debería retornar: {"status":"ok","timestamp":"..."}
```

---

## Dominio Personalizado

### Configurar en Vercel

1. Ve a **Settings > Domains**
2. Agrega tu dominio: `tudominio.com`
3. Sigue las instrucciones para configurar DNS:
   - Tipo: `CNAME`
   - Nombre: `www` o `@`
   - Valor: `cname.vercel-dns.com`

### Actualizar Variables de Entorno

Actualiza estas variables con tu dominio:

```env
NEXT_PUBLIC_SITE_URL=https://tudominio.com
MANUS_OAUTH_REDIRECT_URI=https://tudominio.com/api/oauth/callback
```

### Configurar OAuth Manus

En el dashboard de Manus OAuth:
1. Agrega tu dominio a los **Authorized Redirect URIs**
2. Agrega tu dominio a los **Authorized JavaScript Origins**

---

## Troubleshooting

### Error: "DATABASE_URL is not defined"

**Causa:** Falta la variable de entorno de base de datos

**Solución:**
```bash
# Verificar variables en Vercel
vercel env ls

# Agregar si falta
vercel env add DATABASE_URL
```

### Error: "JWT_SECRET must be at least 32 characters"

**Causa:** El secreto JWT es muy corto

**Solución:**
```bash
# Generar nuevo secreto
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Error: "Build failed: Cannot find module"

**Causa:** Dependencias no instaladas

**Solución:**
1. Verifica `package.json` esté en el root
2. Reinstala dependencias:
   ```bash
   rm -rf node_modules
   pnpm install
   ```

### Error: "Database connection failed"

**Causa:** La BD no está accesible desde Vercel

**Solución:**
- Si usas Vercel Postgres: Verifica que esté conectada al proyecto
- Si usas BD externa: Asegúrate de que permita conexiones desde cualquier IP
- Verifica que el string de conexión sea correcto

### Error: "OAuth callback failed"

**Causa:** URL de callback mal configurada

**Solución:**
1. Verifica `MANUS_OAUTH_REDIRECT_URI` coincide exactamente con la URL de Manus
2. Asegúrate de incluir `https://`
3. No debe terminar en `/`

### Build muy lento

**Solución:**
```bash
# Limpiar caché de Vercel
vercel --force

# O desde el dashboard:
# Settings > Git > Reconnect Repository
```

### Error 500 en API routes

**Causa:** Error en el código del servidor

**Solución:**
1. Revisar logs en Vercel Dashboard > Functions
2. Verificar que todas las variables estén configuradas
3. Asegurarse de que la BD esté migrada

```bash
# Ver logs en tiempo real
vercel logs --json
```

---

## Checklist Pre-Deploy

- [ ] Todas las variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] OAuth configurado con URL de producción
- [ ] Build local exitoso (`pnpm build`)
- [ ] Tests pasando (`pnpm test`)
- [ ] Código pusheado a GitHub

## Post-Deploy Verification

- [ ] Homepage carga correctamente
- [ ] API health check responde
- [ ] OAuth login funciona
- [ ] Noticias se cargan desde BD
- [ ] PWA se puede instalar
- [ ] Modo offline funciona

---

## Contacto

Si tienes problemas con el deployment:
1. Revisa los logs en Vercel Dashboard
2. Consulta la documentación de [Vercel](https://vercel.com/docs)
3. Abre un issue en el repositorio
