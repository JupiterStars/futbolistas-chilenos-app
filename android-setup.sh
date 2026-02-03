#!/bin/bash
# Script para preparar la PWA para Android Studio

echo "📱 FCH Noticias - Configuración para Android"
echo "============================================"

# Verificar que el servidor esté corriendo
if ! curl -s http://localhost:5173/ > /dev/null; then
    echo "❌ El servidor no está corriendo. Iniciando..."
    cd "$(dirname "$0")"
    npx vite --host 0.0.0.0 --port 5173 &
    sleep 5
fi

echo ""
echo "✅ Servidor corriendo en:"
echo "   - Local: http://localhost:5173/"
echo "   - Red: http://192.168.1.167:5173/"
echo ""

# Verificar si Android Studio está instalado
ANDROID_STUDIO_PATH=""

if [ -d "/opt/android-studio" ]; then
    ANDROID_STUDIO_PATH="/opt/android-studio"
elif [ -d "$HOME/android-studio" ]; then
    ANDROID_STUDIO_PATH="$HOME/android-studio"
elif [ -d "/usr/share/android-studio" ]; then
    ANDROID_STUDIO_PATH="/usr/share/android-studio"
fi

if [ -n "$ANDROID_STUDIO_PATH" ]; then
    echo "✅ Android Studio encontrado en: $ANDROID_STUDIO_PATH"
    echo ""
    echo "🚀 Opciones para probar la app:"
    echo ""
    echo "   1. ABrir Android Studio:"
    echo "      $ANDROID_STUDIO_PATH/bin/studio.sh"
    echo ""
    echo "   2. Usar Chrome DevTools (más fácil):"
    echo "      - Abre Chrome en: http://localhost:5173/"
    echo "      - Presiona F12 → Toggle Device Toolbar (Ctrl+Shift+M)"
    echo "      - Selecciona un dispositivo móvil (Pixel 5, iPhone SE, etc.)"
    echo ""
    echo "   3. Generar APK con Trusted Web Activity (TWA):"
    echo "      - Ve a: https://github.com/GoogleChromeLabs/bubblewrap"
    echo "      - O usa: npx @bubblewrap/cli init --manifest=http://localhost:5173/manifest.json"
    echo ""
else
    echo "⚠️  Android Studio no encontrado"
    echo ""
    echo "🌐 Puedes ver la app en el navegador:"
    echo "   http://localhost:5173/"
    echo ""
    echo "📲 Para simular móvil en Chrome:"
    echo "   1. Abre http://localhost:5173/"
    echo "   2. Presiona F12"
    echo "   3. Click en el icono de móvil (o Ctrl+Shift+M)"
    echo "   4. Selecciona 'Pixel 5' o 'iPhone SE'"
    echo ""
fi

echo ""
echo "📋 Verificación de archivos PWA:"
echo "================================"
FILES=(
    "client/public/manifest.json"
    "client/public/sw.js"
    "client/public/logo.jpg"
    "client/public/logo-192x192.png"
    "client/public/logo-512x512.png"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (falta)"
    fi
done

echo ""
echo "🔗 URLs importantes:"
echo "   - App: http://localhost:5173/"
echo "   - Manifest: http://localhost:5173/manifest.json"
echo "   - SW: http://localhost:5173/sw.js"
echo "   - Logo: http://localhost:5173/logo.jpg"
