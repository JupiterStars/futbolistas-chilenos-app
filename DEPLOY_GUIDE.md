# Guía de Deploy - Chilenos Young App en Vercel

## 1. Preparación Local

### 1.1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 1.2. Autenticarse en Vercel
```bash
vercel login
```

### 1.3. Verificar Build Localmente
```bash
# Instalar dependencias
pnpm install

# Ejecutar build
pnpm build

# Verificar que se generó la carpeta dist/
ls -la dist/
```

---

## 2. Configurar Variables de Entorno en Vercel

### 2.1. Opción A: Via CLI (Recomendado)

```bash
# Base de datos (OBLIGATORIO)
vercel env add DATABASE_URL

# OAuth Manus (OBLIGATORIO para autenticación)
vercel env add MANUS_OAUTH_CLIENT_ID
vercel env add MANUS_OAUTH_CLIENT_SECRET
vercel env add MANUS_OAUTH_REDIRECT_URI

# JWT (OBLIGATORIO - generar valores únicos)
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN  # Valor: 7d

# Session (OBLIGATORIO)
vercel env add SESSION_SECRET

# Site URL
vercel env add NEXT_PUBLIC_SITE_URL
```

### 2.2. Valores para Variables

| Variable | Valor | Entorno |
|----------|-------|---------|
| `DATABASE_URL` | Tu connection string MySQL | Production |
| `MANUS_OAUTH_CLIENT_ID` | Obtenido de Manus OAuth | Production |
| `MANUS_OAUTH_CLIENT_SECRET` | [SECRET] Manus | Production |
| `MANUS_OAUTH_REDIRECT_URI` | `https://tu-dom.vercel.app/api/oauth/callback` | Production |
| `JWT_SECRET` | [SECRET] Generar con: `openssl rand -base64 32` | Production |
| `JWT_EXPIRES_IN` | `7d` | Production |
| `SESSION_SECRET` | [SECRET] Generar con: `openssl rand -base64 32` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://tu-dom.vercel.app` | Production |

### 2.3. Generar Secretos Seguros

```bash
# Generar JWT_SECRET
openssl rand -base64 32

# Generar SESSION_SECRET
openssl rand -base64 32
```

---

## 3. Deploy Inicial

### 3.1. Deploy Preview
```bash
vercel
```

### 3.2. Deploy a Producción
```bash
vercel --prod
```

### 3.3. Alias Personalizado (Opcional)
```bash
vercel alias set chilenos-young.vercel.app tudominio.com
```

---

## 4. Post-Deploy Checklist

### 4.1. Smoke Tests (Ejecutar después de cada deploy)

```bash
# Test 1: Homepage responde
curl -I https://tu-dominio.vercel.app
# Esperado: HTTP 200

# Test 2: API tRPC responde
curl -I https://tu-dominio.vercel.app/api/trpc
# Esperado: HTTP 404 (tRPC requiere POST, pero 404 indica que el server está up)

# Test 3: Health check si existe endpoint
curl https://tu-dominio.vercel.app/api/health
# Esperado: {"status":"ok"}

# Test 4: Static assets cargan
curl -I https://tu-dominio.vercel.app/assets/
# Esperado: HTTP 200
```

### 4.2. Verificación Manual en Browser

1. [ ] Abrir `https://tu-dominio.vercel.app`
2. [ ] Verificar que carga el homepage
3. [ ] Abrir DevTools > Console (no errores)
4. [ ] Verificar Network tab (no 404 en assets)
5. [ ] Testear login OAuth si aplica
6. [ ] Navegar a 2-3 páginas internas

### 4.3. Monitoreo Básico

**Vercel Dashboard:**
- [ ] Verificar Function Duration (< 1000ms ideal)
- [ ] Verificar errores en Logs tab
- [ ] Check Deployments tab (último deploy verde)

**Base de datos:**
```sql
-- Verificar conexión desde el server
SELECT NOW();
-- Debe retornar timestamp actual
```

---

## 5. Rollback Plan

### 5.1. Rollback a Deploy Anterior (Vía Dashboard)

1. Ir a Vercel Dashboard > Project
2. Ir a Deployments tab
3. Encontrar el último deploy funcional (verde)
4. Click "Promote to Production"

### 5.2. Rollback Vía CLI

```bash
# Listar deploys recientes
vercel ls

# Rollback a un deployment específico
vercel rollback [deployment-url]
```

### 5.3. Rollback via Git

```bash
# Revertir último commit
git revert HEAD

# Push para trigger nuevo deploy
git push origin main
```

---

## 6. Comandos Útiles

### 6.1. Logs en Tiempo Real

```bash
# Logs de producción
vercel logs

# Logs específicos de un deployment
vercel logs [deployment-url]
```

### 6.2. Ver Configuración Actual

```bash
vercel inspect
```

### 6.3. Actualizar Dominio

```bash
# Agregar dominio personalizado
vercel domains add tudominio.com
```

---

## 7. Troubleshooting

### Problema: "Cannot find module '../dist/index.js'"

**Causa:** El build no generó la carpeta dist/

**Solución:**
```bash
# Verificar build localmente
pnpm build

# Verificar que existe dist/index.js
ls dist/index.js

# Si no existe, revisar errores de build
pnpm build 2>&1 | tee build.log
```

### Problema: "DATABASE_URL not set"

**Causa:** Variable de entorno no configurada en Vercel

**Solución:**
```bash
# Verificar variables configuradas
vercel env ls

# Agregar si falta
vercel env add DATABASE_URL
```

### Problema: Error 502 / 504 Timeout

**Causa:** Función serverless excede tiempo límite

**Solución:**
1. Aumentar `maxDuration` en `vercel.json` (ya está en 30s)
2. Optimizar queries pesadas de base de datos
3. Considerar migrar a Vercel Edge Functions para operaciones simples

### Problema: OAuth redirect URI mismatch

**Causa:** `MANUS_OAUTH_REDIRECT_URI` no coincide con Vercel URL

**Solución:**
```bash
# Obtener la URL correcta de Vercel
vercel ls

# Actualizar variable
vercel env add MANUS_OAUTH_REDIRECT_URI
# Usar: https://proyecto-xyz.vercel.app/api/oauth/callback
```

---

## 8. Deploy Automatizado con GitHub

### 8.1. Conectar Repo a Vercel

1. Dashboard > Import Project
2. Seleccionar repo de GitHub
3. Vercel detecta automáticamente la configuración de `vercel.json`

### 8.2. Branch Protection Rule (Recomendado)

```
Main branch settings:
- Require pull request reviews
- Require status checks to pass
- "Vercel" deployment check required
```

### 8.3. Deploy Preview en PRs

Cada PR a main genera automáticamente un preview deployment.

---

## 9. Script de Deploy Completo

```bash
#!/bin/bash
# deploy.sh - Script completo de deploy

set -e  # Exit on error

echo "=== Chilenos Young Deploy Script ==="

# 1. Build local
echo "Step 1: Building..."
pnpm build

# 2. Verify build
echo "Step 2: Verifying build..."
if [ ! -f "dist/index.js" ]; then
  echo "ERROR: dist/index.js not found!"
  exit 1
fi

# 3. Deploy to Vercel
echo "Step 3: Deploying to Vercel..."
vercel --prod

# 4. Run smoke tests
echo "Step 4: Running smoke tests..."
DEPLOY_URL=$(vercel ls --prod | head -1 | awk '{print $2}')

echo "Testing $DEPLOY_URL..."
curl -f -I "$DEPLOY_URL" || exit 1

echo "=== Deploy Complete! ==="
echo "URL: $DEPLOY_URL"
```

Guarda como `deploy.sh` y ejecuta:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 10. Resumen de Archivos Creados

| Archivo | Propósito |
|---------|-----------|
| `vercel.json` | Configuración de build, rewrites, headers |
| `.vercelignore` | Excluir archivos innecesarios del deploy |
| `.env.example` | Template de variables de entorno |
| `api/index.js` | Entry point para serverless functions |
| `DEPLOY_GUIDE.md` | Esta guía |

---

## Checklist Final Antes de Deploy

- [ ] Build local exitoso (`pnpm build`)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Base de datos accesible desde Vercel
- [ ] OAuth redirect URI correcta
- [ ] Secretos generados (JWT_SECRET, SESSION_SECRET)
- [ ] `.env.example` actualizado sin secretos reales
- [ ] `vercel.json` configurado correctamente
- [ ] Smoke tests definidos
- [ ] Plan de rollback documentado
