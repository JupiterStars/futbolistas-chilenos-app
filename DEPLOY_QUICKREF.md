# Deploy Quick Reference - Chilenos Young

## Comandos Rápidos

```bash
# Deploy completo (build + deploy + tests)
./deploy.sh              # Preview
./deploy.sh --prod       # Producción

# O usando pnpm scripts
pnpm deploy:preview      # Preview
pnpm deploy:prod         # Producción

# Deploy directo via Vercel CLI
vercel                   # Preview
vercel --prod            # Producción
```

## Variables de Entorno Requeridas

Copiar desde `.env.example` y configurar en Vercel:

```
DATABASE_URL (obligatorio)
MANUS_OAUTH_CLIENT_ID (obligatorio)
MANUS_OAUTH_CLIENT_SECRET (obligatorio)
MANUS_OAUTH_REDIRECT_URI (obligatorio)
JWT_SECRET (obligatorio - generar con openssl)
SESSION_SECRET (obligatorio - generar con openssl)
NEXT_PUBLIC_SITE_URL
```

## Generar Secretos

```bash
openssl rand -base64 32  # Para JWT_SECRET y SESSION_SECRET
```

## Configurar en Vercel

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Agregar variables
vercel env add DATABASE_URL
vercel env add MANUS_OAUTH_CLIENT_ID
# ... etc

# Deploy inicial
vercel --prod
```

## Smoke Tests

```bash
# Test básico
curl -I https://tu-dominio.vercel.app

# Esperado: HTTP 200
```

## Rollback

```bash
# Vía CLI
vercel rollback [deployment-url]

# Vía Dashboard
# Vercel > Deployments > Seleccionar deploy funcional > "Promote to Production"
```

## Ver Logs

```bash
vercel logs
```

---

Documentación completa: `DEPLOY_GUIDE.md`
