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
