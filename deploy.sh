#!/bin/bash
# =============================================================================
# Chilenos Young - Deploy Script para Vercel
# =============================================================================
# Ejecuta el build, deploy y smoke tests en un solo comando
#
# Uso:
#   ./deploy.sh              # Deploy preview
#   ./deploy.sh --prod       # Deploy a produccion
# =============================================================================

set -e  # Exit on error
set -o pipefail  # Exit on pipe failure

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funciones de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si pnpm está instalado
check_pnpm() {
    log_info "Verificando pnpm..."
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm no está instalado. Ejecuta: npm install -g pnpm"
        exit 1
    fi
}

# Verificar si vercel CLI está instalado
check_vercel() {
    log_info "Verificando Vercel CLI..."
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI no está instalado. Ejecuta: npm install -g vercel"
        exit 1
    fi
}

# Build del proyecto
build_project() {
    log_info "Ejecutando build del proyecto..."
    pnpm install
    pnpm build

    # Verificar que se generó dist/index.js
    if [ ! -f "dist/index.js" ]; then
        log_error "Build falló: no se encontró dist/index.js"
        exit 1
    fi

    # Verificar que se generaron los assets del frontend
    if [ ! -d "dist/public" ]; then
        log_error "Build falló: no se encontró dist/public"
        exit 1
    fi

    log_info "Build exitoso ✓"
}

# Deploy a Vercel
deploy_vercel() {
    local is_prod=$1

    log_info "Deploying a Vercel..."

    if [ "$is_prod" = "--prod" ]; then
        log_warn "⚠️  Deploy a PRODUCCIÓN"
        vercel --prod
    else
        log_info "Deploy a PREVIEW"
        vercel
    fi
}

# Smoke tests post-deploy
run_smoke_tests() {
    log_info "Ejecutando smoke tests..."

    # Obtener la URL del deploy más reciente
    DEPLOY_URL=$(vercel ls | head -1 | awk '{print $2}')

    if [ -z "$DEPLOY_URL" ]; then
        log_error "No se pudo obtener la URL del deploy"
        exit 1
    fi

    log_info "URL del deploy: $DEPLOY_URL"

    # Test 1: Homepage responde
    log_info "Test 1: Verificando homepage..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        log_info "✓ Homepage responde con HTTP 200"
    else
        log_error "✗ Homepage respondió con HTTP $HTTP_CODE"
        exit 1
    fi

    # Test 2: API endpoint existe
    log_info "Test 2: Verificando API endpoint..."
    API_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL/api/trpc" || echo "000")

    if [ "$API_CODE" = "404" ] || [ "$API_CODE" = "405" ]; then
        log_info "✓ API endpoint responde (esperado 404/405 para tRPC)"
    else
        log_warn "API respondió con HTTP $API_CODE (puede ser normal)"
    fi

    # Test 3: Headers de seguridad
    log_info "Test 3: Verificando headers de seguridad..."
    HEADERS=$(curl -s -I "$DEPLOY_URL")

    if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
        log_info "✓ Headers de seguridad presentes"
    else
        log_warn "Algunos headers de seguridad pueden faltar"
    fi

    log_info "✓ Todos los smoke tests pasaron"
}

# Main script
main() {
    echo ""
    echo "========================================="
    echo "  Chilenos Young - Deploy Script"
    echo "========================================="
    echo ""

    # Determinar si es deploy a producción
    IS_PROD=""
    if [ "$1" = "--prod" ]; then
        IS_PROD="--prod"
    fi

    # Ejecutar pasos
    check_pnpm
    check_vercel
    build_project
    deploy_vercel "$IS_PROD"
    run_smoke_tests

    echo ""
    echo "========================================="
    log_info "✓ Deploy completado exitosamente!"
    echo "========================================="
    echo ""

    # Obtener y mostrar la URL final
    DEPLOY_URL=$(vercel ls | head -1 | awk '{print $2}')
    echo "URL: $DEPLOY_URL"
    echo ""
}

# Ejecutar main con argumentos
main "$@"
