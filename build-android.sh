#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────
# build-android.sh — Build OpenIA Academy APK
# Requires: Node.js 18+, JDK 17+, Android SDK (ANDROID_HOME set)
# Usage:
#   ./build-android.sh          → debug APK
#   ./build-android.sh release  → signed release APK
# ──────────────────────────────────────────────────────────────────────
set -e

BUILD_TYPE="${1:-debug}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND="$SCRIPT_DIR/frontend"
ANDROID="$FRONTEND/android"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   🧠  OpenIA Academy — Android Builder   ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Prereqs ─────────────────────────────────────────────────────────
check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌ '$1' not found. $2"
    exit 1
  fi
}
check_cmd node   "Install Node.js 18+ from https://nodejs.org"
check_cmd java   "Install JDK 17 from https://adoptium.net"
check_cmd npm    "npm should ship with Node.js"

if [[ -z "$ANDROID_HOME" ]] && [[ -z "$ANDROID_SDK_ROOT" ]]; then
  echo "⚠️  ANDROID_HOME not set."
  echo "   Install Android Studio → https://developer.android.com/studio"
  echo "   Then run: export ANDROID_HOME=~/Library/Android/sdk"
  exit 1
fi

echo "✅ Node $(node -v) | Java $(java -version 2>&1 | head -1)"
echo ""

# ── 1. Install deps ─────────────────────────────────────────────────
echo "📦 Installing npm dependencies..."
cd "$FRONTEND"
npm ci --legacy-peer-deps --silent

# ── 2. Web build ────────────────────────────────────────────────────
echo "🔨 Building web app (Vite + PWA)..."
npm run build

# ── 3. Capacitor sync ───────────────────────────────────────────────
echo "🔄 Syncing Capacitor to Android..."
npx cap sync android

# ── 4. Generate keystore (first time only) ──────────────────────────
if [[ "$BUILD_TYPE" == "release" ]]; then
  KEYSTORE="$ANDROID/release.keystore"
  if [[ ! -f "$KEYSTORE" ]]; then
    echo "🔑 Generating release keystore (first time only)..."
    keytool -genkey -v \
      -keystore "$KEYSTORE" \
      -alias openia \
      -keyalg RSA \
      -keysize 2048 \
      -validity 10000 \
      -storepass openia2024 \
      -keypass openia2024 \
      -dname "CN=OpenIA Academy, OU=Mobile, O=OpenIA, L=Madrid, ST=Madrid, C=ES"
    echo "✅ Keystore generated at $KEYSTORE"
    echo "⚠️  Save this file securely — you'll need it for every future release!"
  fi
fi

# ── 5. Build APK ────────────────────────────────────────────────────
cd "$ANDROID"
chmod +x ./gradlew

if [[ "$BUILD_TYPE" == "release" ]]; then
  echo "🏗️  Building RELEASE APK..."
  ./gradlew assembleRelease \
    -Pandroid.injected.signing.store.file="$ANDROID/release.keystore" \
    -Pandroid.injected.signing.store.password=openia2024 \
    -Pandroid.injected.signing.key.alias=openia \
    -Pandroid.injected.signing.key.password=openia2024
  APK="$ANDROID/app/build/outputs/apk/release/app-release.apk"
else
  echo "🏗️  Building DEBUG APK..."
  ./gradlew assembleDebug
  APK="$ANDROID/app/build/outputs/apk/debug/app-debug.apk"
fi

# ── Done ────────────────────────────────────────────────────────────
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✅  BUILD SUCCESSFUL                   ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "📱 APK location:"
echo "   $APK"
echo ""
echo "📲 To install on connected Android device:"
echo "   adb install -r \"$APK\""
echo ""
if [[ "$BUILD_TYPE" == "release" ]]; then
  echo "🚀 To upload to Play Store:"
  echo "   1. Go to https://play.google.com/console"
  echo "   2. Create app → Upload APK under 'Internal testing'"
  echo "   3. Fill store listing and submit for review"
fi
