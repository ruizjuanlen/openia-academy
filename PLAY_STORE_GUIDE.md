# 🚀 Guía de Publicación en Google Play Store
## OpenIA Academy — APK para Android

---

## 📋 RESUMEN DEL STACK

| Componente | Tecnología |
|---|---|
| Web App | React 18 + Vite + PWA (Service Worker) |
| Native Wrapper | Capacitor 8 |
| Package ID | `com.openia.academy` |
| minSdk | API 24 (Android 7.0 — 98%+ dispositivos) |
| targetSdk | API 36 (Android 16) |
| Build CI/CD | GitHub Actions |

---

## 🔑 PASO 1: Configurar GitHub Secrets

En tu repo → **Settings → Secrets → Actions → New repository secret**:

| Secret Name | Valor | Cómo obtenerlo |
|---|---|---|
| `KEYSTORE_BASE64` | Keystore en base64 | `base64 -i release.keystore` |
| `KEYSTORE_PASSWORD` | Password del keystore | El que usaste al crearlo |
| `KEY_ALIAS` | `openia` | Nombre del alias |
| `KEY_PASSWORD` | Password de la clave | Mismo que keystore |

### Generar el keystore (una sola vez):
```bash
keytool -genkey -v \
  -keystore release.keystore \
  -alias openia \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass TU_PASSWORD_SEGURA \
  -keypass TU_PASSWORD_SEGURA \
  -dname "CN=OpenIA Academy, OU=Mobile, O=TuNombre, L=Madrid, ST=Madrid, C=ES"

# Codificar para el secret de GitHub:
base64 -i release.keystore | tr -d '\n' | pbcopy   # macOS
base64 -w 0 release.keystore                        # Linux
```

> ⚠️ **GUARDA EL KEYSTORE.** Sin él no puedes actualizar la app en Play Store.

---

## 🏗️ PASO 2: Build Local (necesita JDK 17 + Android SDK)

### Opción A: Con script automático
```bash
# Debug APK (para testing)
./build-android.sh

# Release APK (para Play Store)
./build-android.sh release
```

### Opción B: Con npm scripts
```bash
cd frontend

# Debug APK
npm run android:debug

# Release APK
npm run android:release
```

### Opción C: Con Android Studio
```bash
cd frontend
npm run android:open   # Abre Android Studio automáticamente
# Build → Generate Signed Bundle/APK
```

---

## ⚙️ PASO 3: Build en la Nube (sin instalar nada local)

### Via GitHub Actions (recomendado)
```bash
# Dispatch manual desde GitHub UI:
# Actions → "Build Android APK" → Run workflow → release

# O push un tag para auto-release:
git tag v1.0.0
git push origin v1.0.0
```

El workflow descargará el APK firmado desde **Actions → Artifacts**.

---

## 📱 PASO 4: Subir a Google Play Store

### 4.1 Crear cuenta de desarrollador
- Ir a: https://play.google.com/console
- Coste: $25 USD (pago único)
- Verificación: ~48h

### 4.2 Crear nueva app
```
Play Console → Todas las apps → Crear app
- Nombre: OpenIA Academy
- Idioma: Español
- Tipo: Aplicación
- Gratis/Pago: Gratis
```

### 4.3 Assets necesarios para el listing

| Asset | Tamaño | Descripción |
|---|---|---|
| Icono app | 512×512 PNG | ✅ Ya tienes `icon-512.png` |
| Feature graphic | 1024×500 PNG | Banner de la Play Store |
| Screenshots | Min 2, 8 máx | Capturas de pantalla (mín 1080px) |
| Descripción corta | max 80 chars | "Academia IA adaptativa para aprender de cero a AI Architect" |
| Descripción larga | max 4000 chars | Ver plantilla abajo |

### 4.4 Categoría y clasificación
```
Categoría: Educación
Clasificación de contenido: Todos (E)
Política de privacidad: Requerida (ver plantilla)
```

### 4.5 Subir el APK
```
Pruebas internas → Crear nueva versión → Subir APK
→ Revisión → Pruebas cerradas → Producción
```

---

## 📝 PLANTILLA: Descripción para Play Store

```
🧠 OpenIA Academy — Tu academia de inteligencia artificial personalizada

Aprende IA desde cero hasta convertirte en AI Architect con un sistema que
se adapta a TI. Diseñado especialmente para personas con ADHD: sesiones
cortas, alta interactividad y refuerzo constante.

🎯 TRACKS DISPONIBLES:
• Inteligencia Artificial (Fundamentos → Avanzado)
• Prompt Engineering (Básico → Experto)
• ML Engineer (Pipelines, modelos, producción)
• Analytics Engineer (dbt, Spark, datos)
• AI Architect (Sistemas, diseño, estrategia)

✨ CARACTERÍSTICAS:
• Evaluación continua y adaptativa
• Sesiones de 5-15 minutos (ADHD-friendly)
• Sistema de gamificación y logros
• Certificaciones por track
• Funciona offline (PWA)
• Modo oscuro nativo

📊 SIGUE TU PROGRESO:
• Dashboard personalizado
• Streak diario y estadísticas
• Mapas de habilidades interactivos

Gratis. Sin anuncios. Sin suscripción.
```

---

## 🔒 PLANTILLA: Política de Privacidad

Necesitas una URL pública con esta política:

```
POLÍTICA DE PRIVACIDAD — OpenIA Academy

1. DATOS QUE RECOPILAMOS
   - Progreso de aprendizaje (almacenado localmente)
   - Preferencias de la app (almacenado localmente)
   - No recopilamos datos personales identificables

2. USO DE DATOS
   - Solo para mejorar tu experiencia de aprendizaje
   - No compartimos datos con terceros
   - No usamos analytics ni tracking

3. CONTACTO
   [tu-email@dominio.com]
```

---

## 🔄 ACTUALIZAR LA APP (ciclo de vida)

Cada nueva versión:
1. Incrementar `versionCode` en `android/app/build.gradle`
2. Actualizar `versionName` (ej: "1.1.0")
3. Hacer `git tag v1.1.0 && git push origin v1.1.0`
4. GitHub Actions construye y firma automáticamente
5. Subir el nuevo APK en Play Console

---

## 🐛 TROUBLESHOOTING

| Error | Solución |
|---|---|
| `JAVA_HOME not set` | Instalar JDK 17: https://adoptium.net |
| `Android SDK not found` | Instalar Android Studio |
| `Gradle build failed` | `cd android && ./gradlew clean && ./gradlew assembleDebug` |
| `Keystore not found` | Ejecutar `./build-android.sh release` (crea keystore auto) |
| `App rejected by Play Store` | Verificar que targetSdk >= 34 ✅ (ya está en 36) |
