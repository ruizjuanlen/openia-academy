# OpenIA Academy — Agent Memory

## Project Overview
Personalized AI/ML learning app for a user with ADHD.  
Target: Zero prior knowledge → AI/ML certifications.

## Architecture
- **Backend**: FastAPI on port 8012 (`backend/`)
- **Frontend**: React + Vite on port 8011 (`frontend/`)
- **DB**: SQLite via SQLAlchemy (`backend/learning.db`)
- **AI Tutor**: AWS Bedrock (Claude via boto3) with graceful fallback

## Starting the Services
```bash
# Backend (port 8012)
cd /workspace/project/backend
nohup python main.py > /tmp/backend.log 2>&1 &

# Frontend (port 8011)
cd /workspace/project/frontend
nohup npm run dev > /tmp/frontend.log 2>&1 &
```

## Key Backend Files
- `backend/main.py` — FastAPI app, all routes under `/api/`
- `backend/curriculum.py` — 5 tracks, 14 lessons (full content)
- `backend/adaptive.py` — adaptive engine: XP, mastery, difficulty
- `backend/database.py` — SQLAlchemy models (User, LessonProgress, etc.)

## Key Frontend Files
- `frontend/src/App.jsx` — router, global state, sidebar
- `frontend/src/api.js` — API client (proxy `/api` → localhost:8012)
- `frontend/src/pages/Welcome.jsx` — 2-step onboarding
- `frontend/src/pages/Diagnostic.jsx` — 15-question adaptive diagnostic
- `frontend/src/pages/Dashboard.jsx` — stats, tracks, next lesson
- `frontend/src/pages/LessonPage.jsx` — section-by-section content + quiz
- `frontend/src/pages/SkillTree.jsx` — visual curriculum map
- `frontend/src/pages/Tutor.jsx` — AI chat interface

## Curriculum (5 tracks, 14 lessons)
1. Fundamentos IA — 3 lessons
2. Prompt Engineering — 3 lessons
3. Analytics Engineering — 3 lessons
4. ML Engineering — 3 lessons
5. AI Architecture — 2 lessons

## API Endpoints
- `POST /api/users` — create user
- `GET /api/users/{id}/dashboard` — full dashboard data
- `GET /api/diagnostic` — 15 diagnostic questions
- `POST /api/users/{id}/diagnostic` — submit diagnostic, get profile
- `GET /api/lessons/{id}` — lesson with content + quiz questions
- `POST /api/users/{id}/quiz` — submit quiz answers, earn XP
- `GET /api/users/{id}/next-lesson` — adaptive next lesson
- `POST /api/tutor` — AI tutor chat (Bedrock/Claude)

## Design System
Dark theme: `--bg: #0a0a14`, primary: `#6366f1` (indigo), secondary: `#8b5cf6`  
Font: Inter (body), JetBrains Mono (code)  
ADHD UX: short sessions, XP gamification, progress bars, streak tracking

## Ports (Docker → Host mapping)
- Port 8011 → Frontend (http://localhost:49197 from host)
- Port 8012 → Backend (http://localhost:54805 from host)

## Environment
- Python 3.13 (backend)
- Node v22 (frontend)
- AWS Bedrock region: from `$AWS_REGION`
- Auth: `$AWS_BEARER_TOKEN_BEDROCK`

---

## PWA & Android APK (COMPLETE ✅)

### PWA Status
- `vite-plugin-pwa` configured in `vite.config.js` (autoUpdate, Workbox, manifest)
- 8 icons generated in `public/` (72×72 → 512×512)
- `manifest.webmanifest` with `standalone`, `portrait`, `education`
- `index.html` with full PWA meta tags + iOS splash screens
- Service Worker precaches 23 entries (298.14 KiB)
- Install banner in `Welcome.jsx` + install button in `Sidebar`
- `beforeinstallprompt` captured in `App.jsx` context

### Capacitor / Android Status
- Capacitor 8 installed: `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`
- Config: `frontend/capacitor.config.json` — appId `com.openia.academy`
- Android project generated: `frontend/android/`
- Icons copied to all mipmap densities (mdpi→xxxhdpi)
- Dark purple theme applied in `android/app/src/main/res/values/styles.xml`
- Release signing config in `android/app/build.gradle` (env-var or keystore file)
- `.gitignore` blocks `*.keystore` and `*.jks`

### Build Commands
```bash
# Sync web assets to Android project
cd frontend && npm run android:sync

# Build debug APK (testing)
cd frontend && npm run android:debug
# → android/app/build/outputs/apk/debug/app-debug.apk

# Build release APK (Play Store)
cd frontend && npm run android:release

# Or use the root script (handles keystore generation too)
./build-android.sh           # debug
./build-android.sh release   # release + signed
```

### GitHub Actions CI/CD
- Workflow: `.github/workflows/build-apk.yml`
- Triggers: push to main, version tags (`v*`), manual dispatch
- Debug build: uploads APK as artifact (30-day retention)
- Release build: signs with keystore, creates GitHub Release on tag push
- Required secrets: `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`

### Play Store Info
- Package: `com.openia.academy`
- Category: Education
- minSdk: 24 (Android 7.0 — 98%+ devices)
- targetSdk: 36 (Android 16)
- Full guide: `PLAY_STORE_GUIDE.md`

---

## 💾 SESSION CHECKPOINT — 2026-05-11

### ✅ 100% COMPLETADO
- Full React app (5 tracks, 14 lessons, adaptive engine, AI tutor)
- Backend FastAPI + SQLite + AWS Bedrock (Claude)
- PWA: vite-plugin-pwa, Workbox SW, manifest, 8 icons, install prompt
- Capacitor 8: Android project generated, icons, dark theme, signing config
- GitHub Actions workflow: `.github/workflows/build-apk.yml`
- Local build script: `build-android.sh`
- npm scripts: `android:sync`, `android:debug`, `android:release`, `android:open`
- Play Store guide: `PLAY_STORE_GUIDE.md`
- All 75 files committed to git (commit: `001de71`)

### 🔜 PENDIENTE PARA MAÑANA
1. **Subir repo a GitHub** — el workflow de CI/CD necesita un remote
2. **Generar keystore** y añadir los 4 GitHub Secrets (ver `PLAY_STORE_GUIDE.md`)
3. **Primer build en GitHub Actions** — validar que el APK sale bien
4. **Play Store listing assets**:
   - Feature graphic 1024×500 px
   - Screenshots (mínimo 2)
   - Política de privacidad en URL pública
5. **Registro en Google Play Console** ($25 USD, si no está hecho)
6. **Subir APK** a pruebas internas → cerradas → producción

### 🚦 ESTADO ACTUAL DE SERVICIOS
- Frontend dev: `http://localhost:8011` (también `http://172.17.0.3:8011`)
- Backend: `http://localhost:8012`
- Production build: `frontend/dist/` (23 entries, 298.14 KiB precached)
- Android project: `frontend/android/` (sincronizado con dist)

### ▶️ PARA REANUDAR MAÑANA
```bash
# Arrancar servicios
cd /workspace/project/backend && nohup python main.py > /tmp/backend.log 2>&1 &
cd /workspace/project/frontend && nohup npm run dev > /tmp/frontend.log 2>&1 &

# Verificar que todo funciona
curl -s http://localhost:8012/api/lessons | python3 -m json.tool | head -20

# Cuando tengas el remote de GitHub:
git remote add origin https://github.com/TU_USER/openia-academy.git
git push -u origin master

# Para re-sincronizar Capacitor si cambias código:
cd frontend && npm run android:sync
```

