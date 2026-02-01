# Chilenos Young - Deploy en Vercel

## Variables de Entorno Requeridas

Configura estas variables en Vercel Dashboard > Settings > Environment Variables:

### Críticas (sin estas no funciona)

| Variable | Descripcion | Como generar |
|----------|-------------|--------------|
| `DATABASE_URL` | Tu conexion MySQL | Formato: `mysql://user:pass@host:3306/dbname` |
| `JWT_SECRET` | Secret para JWT tokens | `openssl rand -base64 32` |
| `SESSION_SECRET` | Secret para sesiones | `openssl rand -base64 32` |

### OAuth Manus (requerido para autenticacion)

| Variable | Descripcion | Valor ejemplo |
|----------|-------------|---------------|
| `MANUS_OAUTH_CLIENT_ID` | OAuth Client ID | Obtenido desde Manus Dashboard |
| `MANUS_OAUTH_CLIENT_SECRET` | OAuth Client Secret | Obtenido desde Manus Dashboard |
| `MANUS_OAUTH_REDIRECT_URI` | URL de callback | `https://tu-dominio.vercel.app/api/oauth/callback` |

### Sitio

| Variable | Descripcion | Valor ejemplo |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SITE_URL` | URL publica del sitio | `https://tu-dominio.vercel.app` |

## Pasos Pre-Deploy

### 1. Instalar Vercel CLI
```bash
npm install -g vercel
```

### 2. Autenticarse
```bash
vercel login
```

### 3. Configurar variables de entorno
Ve a: `Vercel Dashboard > Project > Settings > Environment Variables`
- Agrega TODAS las variables listadas arriba
- Selecciona los entornos apropiados (Production, Preview, Development)

### 4. Actualizar vercel.json con tu dominio
**IMPORTANTE:** Antes de hacer deploy, edita `vercel.json` y cambia:

```json
"Access-Control-Allow-Origin": "YOUR_DOMAIN_HERE"
```

Por tu dominio real:
```json
"Access-Control-Allow-Origin": "https://tu-dominio.vercel.app"
```

**NO uses `"*"` (wildcard) en produccion - esto es un riesgo de seguridad.**

## Comando de Deploy

```bash
vercel --prod
```

## Checklist Antes de Deploy

- [ ] Todas las variables de entorno configuradas en Vercel Dashboard
- [ ] `vercel.json` tiene tu dominio real (no "YOUR_DOMAIN_HERE" ni "*")
- [ ] Base de datos MySQL accesible desde Vercel (firewall permite IPs de Vercel)
- [ ] OAuth redirect URI configurado correctamente en Manus Dashboard
- [ ] `JWT_SECRET` y `SESSION_SECRET` son valores unicos y seguros

## Fixes de Seguridad Aplicados

| Issue | Fix | Estado |
|-------|-----|--------|
| XSS (Cross-Site Scripting) | DOMPurify agregado para sanitizar HTML | ✅ |
| CORS Wildcard | Placeholder YOUR_DOMAIN_HERE en lugar de "*" | ✅ |
| Serverless Export | Export de app corregido para serverless | ✅ |
| Cookies sameSite | Configurado a "lax" para proper session handling | ✅ |
| CSP Header | Content-Security-Policy agregado | ✅ |
| HSTS Header | Strict-Transport-Security agregado | ✅ |
| Permissions Policy | Header de permisos agregado | ✅ |

## Headers de Seguridad Configurados

### Para rutas API (`/api/*`)
- `Access-Control-Allow-Origin`: YOUR_DOMAIN_HERE (configurar)
- `Access-Control-Allow-Methods`: GET, POST, PUT, DELETE, OPTIONS
- `Access-Control-Allow-Headers`: Content-Type, Authorization

### Para todo el sitio (`/*`)
- `X-Content-Type-Options`: nosniff
- `X-Frame-Options`: DENY
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Content-Security-Policy`: Politica restrictiva
- `Strict-Transport-Security`: max-age=31536000; includeSubDomains; preload
- `Permissions-Policy`: Restringe acceso a camara, microfono, geolocalizacion, pagos

### Para assets estaticos (`/assets/*`)
- `Cache-Control`: public, max-age=31536000, immutable (1 año)

## Troubleshooting

### Error: Database connection failed
- Verifica que `DATABASE_URL` sea correcta
- Confirma que tu base de datos permite conexiones desde IPs de Vercel
- Revisa logs en Vercel Dashboard

### Error: OAuth callback invalid
- Verifica que `MANUS_OAUTH_REDIRECT_URI` coincida exactamente con la URL de Vercel
- Confirma la configuracion en Manus Dashboard

### Error: CORS issues
- Asegurate de haber reemplazado `YOUR_DOMAIN_HERE` con tu dominio real
- No uses `"*"` en produccion

### Deploy fallido
- Verifica que `pnpm build` funcione localmente
- Revisa logs de build en Vercel Dashboard

## Seguridad Adicional

1. **Nunca commitear** `.env` ni secretos al repositorio
2. **Rotar secrets** periodicamente (JWT_SECRET, SESSION_SECRET)
3. **Monitorear** Vercel logs por actividad sospechosa
4. **Usar** variables de entorno especificas por entorno (prod/staging/dev)

## Comandos Utiles

```bash
# Ver deploy preview
vercel

# Ver logs en tiempo real
vercel logs

# Listar deployments
vercel ls

# Eliminar deployment antiguo
vercel rm <deployment-url>
```

---

**Documentacion actualizada:** 2026-02-01
