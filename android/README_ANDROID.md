# 📱 FCH Noticias - Android App (TWA)

Proyecto Android usando **Trusted Web Activity (TWA)** que empaqueta la PWA como app nativa.

---

## 🚀 Instrucciones Rápidas

### 1. Abrir en Android Studio

1. Abre **Android Studio**
2. Selecciona **"Open an Existing Project"**
3. Navega a: `chilenos-young/android/`
4. Haz clic en **OK**

### 2. Configurar Emulador (si no tienes)

1. Ve a **Tools → Device Manager**
2. Haz clic en **Create Device**
3. Selecciona **Pixel 6** → **Next**
4. Selecciona **Android 14 (API 34)** → **Download** si es necesario
5. Haz clic en **Finish**

### 3. Ejecutar la App

1. Selecciona el emulador en la barra superior
2. Haz clic en el botón **▶ Run** (verde)
3. Espera a que compile y se instale

**Tiempo estimado:** 2-3 minutos primera vez

---

## 🔧 Configuración para Producción

### Paso 1: Generar Keystore (Firma)

```bash
cd android
keytool -genkey -v -keystore fchnoticias.keystore -alias fchnoticias -keyalg RSA -keysize 2048 -validity 10000
```

Guarda el archivo `fchnoticias.keystore` en lugar seguro.

### Paso 2: Configurar Firma

Crea `android/keystore.properties`:

```properties
storeFile=fchnoticias.keystore
storePassword=TU_PASSWORD
keyAlias=fchnoticias
keyPassword=TU_PASSWORD
```

### Paso 3: Generar APK Release

```bash
./gradlew assembleRelease
```

El APK estará en: `app/build/outputs/apk/release/app-release.apk`

---

## 📋 Requisitos

- **Android Studio:** Hedgehog (2023.1.1) o superior
- **SDK mínimo:** API 24 (Android 7.0)
- **SDK objetivo:** API 34 (Android 14)
- **Espacio en disco:** ~2GB para Android Studio + SDK

---

## 🌐 Dominio Digital Asset Links

Para que el TWA funcione correctamente en producción, necesitas agregar `assetlinks.json` en tu dominio:

**URL:** `https://fchnoticias.vercel.app/.well-known/assetlinks.json`

**Contenido:**

```json
[{
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
        "namespace": "android",
        "package_name": "com.fchnoticias.app",
        "sha256_cert_fingerprints": [
            "TU_SHA256_FINGERPRINT_AQUI"
        ]
    }
}]
```

### Obtener SHA256 Fingerprint:

```bash
keytool -list -v -keystore fchnoticias.keystore -alias fchnoticias
```

Copia el valor `SHA256` y pégalo en el JSON.

---

## 🎨 Personalización

### Cambiar URL de la PWA

Edita `app/src/main/java/com/fchnoticias/app/MainActivity.kt`:

```kotlin
override fun getLaunchingUrl() = "https://tu-dominio.com"
```

### Cambiar Icono

Reemplaza los archivos en:
- `app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`

### Cambiar Nombre

Edita `app/src/main/res/values/strings.xml`:

```xml
<string name="app_name">FCH Noticias</string>
```

---

## 🐛 Solución de Problemas

### Error: "Gradle sync failed"

**Solución:**
```bash
File → Invalidate Caches → Invalidate and Restart
```

### Error: "Emulator not found"

**Solución:**
```bash
Tools → SDK Manager → SDK Tools → Install Emulator
```

### Error: "App not installed"

**Solución:**
1. Desinstala la app anterior del emulador
2. Ve a `Settings → Apps → FCH Noticias → Uninstall`
3. Vuelve a ejecutar desde Android Studio

### La app muestra navegador en vez de TWA

**Causa:** El dominio no tiene `assetlinks.json` configurado

**Solución temporal:** La app funcionará igual, pero mostrará barra de navegación.

---

## 📦 Archivos Generados

| Archivo | Descripción |
|---------|-------------|
| `app-debug.apk` | Versión de desarrollo (sin firmar) |
| `app-release.apk` | Versión de producción (firmada) |
| `fchnoticias.keystore` | Clave de firma (¡guardar seguro!) |

---

## 🚀 Publicar en Google Play Store

### Paso 1: Crear Cuenta de Desarrollador
- Ve a https://play.google.com/console
- Paga $25 USD (única vez)

### Paso 2: Crear App
1. Haz clic en **Create App**
2. Nombre: **FCH Noticias**
3. Idioma: **Español**

### Paso 3: Subir APK/AAB
1. Ve a **Production → Create New Release**
2. Sube `app-release.aab` (Android App Bundle)
3. Completa la información de la app

### Paso 4: Generar AAB (recomendado)

```bash
./gradlew bundleRelease
```

Archivo en: `app/build/outputs/bundle/release/app-release.aab`

---

## 📚 Recursos

- **Trusted Web Activity Docs:** https://developer.chrome.com/docs/android/trusted-web-activity
- **Android Developer:** https://developer.android.com
- **PWA Builder:** https://www.pwabuilder.com

---

**¿Problemas?** Revisa el archivo `STATUS.md` en la raíz del proyecto o el `DEPLOY.md` para la configuración del backend.
