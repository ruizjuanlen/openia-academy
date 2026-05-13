import json
import uuid
import random
import boto3
import os
from datetime import datetime
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Any

from database import init_db, get_conn, row_to_dict
from curriculum import TRACKS, LESSONS, DIAGNOSTIC_QUESTIONS, LESSON_QUESTIONS
from adaptive import (
    get_user_stats, get_next_lesson, process_quiz_result,
    process_diagnostic, get_performance_insights, ACHIEVEMENTS, LEVEL_XP
)

app = FastAPI(title="OpenIA Academy", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()


# ─────────────────────────────────────────────────────
# MODELOS PYDANTIC
# ─────────────────────────────────────────────────────

class CreateUser(BaseModel):
    name: str
    adhd_mode: bool = True

class DiagnosticAnswer(BaseModel):
    question_id: str
    answer: int
    response_time_ms: int = 0

class DiagnosticSubmit(BaseModel):
    answers: List[DiagnosticAnswer]

class QuizAnswer(BaseModel):
    question_id: str
    correct: bool
    response_time_ms: int = 0

class QuizSubmit(BaseModel):
    lesson_id: str
    answers: List[QuizAnswer]
    time_spent_seconds: int = 0

class TutorMessage(BaseModel):
    user_id: str
    message: str
    context_lesson_id: Optional[str] = None


# ─────────────────────────────────────────────────────
# USUARIOS
# ─────────────────────────────────────────────────────

@app.post("/api/users")
def create_user(body: CreateUser):
    user_id = str(uuid.uuid4())[:8]
    now = datetime.utcnow().isoformat()
    conn = get_conn()
    conn.execute(
        "INSERT INTO users (id, name, created_at, adhd_mode) VALUES (?,?,?,?)",
        (user_id, body.name, now, 1 if body.adhd_mode else 0)
    )
    conn.commit()
    conn.close()
    return {"user_id": user_id, "name": body.name}


@app.get("/api/users/{user_id}")
def get_user(user_id: str):
    stats = get_user_stats(user_id)
    if not stats:
        raise HTTPException(404, "Usuario no encontrado")
    return stats


@app.get("/api/users/{user_id}/dashboard")
def get_dashboard(user_id: str):
    stats = get_user_stats(user_id)
    if not stats:
        raise HTTPException(404, "Usuario no encontrado")

    # Construir datos del dashboard
    user = stats["user"]
    tracks_progress = []
    for track in TRACKS:
        track_lessons = [l for l in LESSONS if l["track_id"] == track["id"]]
        completed = sum(1 for l in track_lessons
                       if l["id"] in stats["completed_lessons"])
        tracks_progress.append({
            **track,
            "lessons_total": len(track_lessons),
            "lessons_completed": completed,
            "progress_pct": round(completed / len(track_lessons) * 100, 1) if track_lessons else 0,
            "mastery": round(stats["mastery"].get(track["id"], {}).get("mastery_score", 0) * 100, 1),
        })

    next_lesson = get_next_lesson(user_id)
    insights = get_performance_insights(user_id)

    # Logros del usuario con metadata
    ach_ids = set(stats["achievements"])
    all_achievements = []
    for ach in ACHIEVEMENTS:
        all_achievements.append({
            **ach,
            "unlocked": ach["id"] in ach_ids,
        })

    return {
        "user": {
            "id": user["id"],
            "name": user["name"],
            "xp": user["xp"],
            "level": stats["level"],
            "streak": user["streak"],
            "level_progress": stats["level_progress"],
            "next_level_xp": stats["next_level_xp"],
            "current_level_xp": LEVEL_XP.get(stats["level"], 0),
            "lessons_completed": stats["lessons_completed_count"],
            "diagnostic_done": bool(user.get("diagnostic_done")),
            "adhd_mode": bool(user.get("adhd_mode")),
        },
        "tracks": tracks_progress,
        "next_lesson": next_lesson,
        "insights": insights,
        "achievements": all_achievements,
        "total_lessons": len(LESSONS),
    }


# ─────────────────────────────────────────────────────
# CURRÍCULO
# ─────────────────────────────────────────────────────

@app.get("/api/curriculum")
def get_curriculum():
    return {"tracks": TRACKS, "lessons_count": len(LESSONS)}


@app.get("/api/lessons/{lesson_id}")
def get_lesson(lesson_id: str, user_id: Optional[str] = None):
    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson:
        raise HTTPException(404, "Lección no encontrada")

    # Prefer lesson-specific bank, fall back to diagnostic pool by track
    pool = LESSON_QUESTIONS.get(lesson_id) or [
        q for q in DIAGNOSTIC_QUESTIONS if q["topic"] == lesson["track_id"]
    ]

    # Random sample: 5-7 questions per quiz (ADHD-friendly, unpredictable)
    target = min(len(pool), random.randint(5, 7))
    selected = random.sample(pool, target) if len(pool) >= target else list(pool)

    # Shuffle options for each question → eliminates position/length bias
    quiz_questions = []
    for q in selected:
        opts = list(q["options"])
        correct_text = opts[q["correct"]]
        random.shuffle(opts)
        quiz_questions.append({
            **q,
            "options": opts,
            "correct": opts.index(correct_text),
        })

    lesson_data = {k: v for k, v in lesson.items()}
    result = {**lesson_data, "quiz_questions": quiz_questions}

    if user_id:
        conn = get_conn()
        progress = conn.execute(
            "SELECT * FROM user_progress WHERE user_id=? AND lesson_id=?",
            (user_id, lesson_id)
        ).fetchone()
        conn.close()
        result["user_progress"] = dict(progress) if progress else None

    return result


@app.get("/api/tracks/{track_id}/lessons")
def get_track_lessons(track_id: str, user_id: Optional[str] = None):
    lessons = sorted(
        [l for l in LESSONS if l["track_id"] == track_id],
        key=lambda l: l["order"]
    )
    if not lessons:
        raise HTTPException(404, "Track no encontrado")

    if user_id:
        stats = get_user_stats(user_id)
        completed = stats["completed_lessons"] if stats else []
        for l in lessons:
            l["completed"] = l["id"] in completed
            l["score"] = stats["progress"].get(l["id"], {}).get("score", 0) if stats else 0

    return {"track_id": track_id, "lessons": lessons}


# ─────────────────────────────────────────────────────
# DIAGNÓSTICO
# ─────────────────────────────────────────────────────

@app.get("/api/diagnostic")
def get_diagnostic():
    return {"questions": DIAGNOSTIC_QUESTIONS, "total": len(DIAGNOSTIC_QUESTIONS)}


@app.post("/api/users/{user_id}/diagnostic")
def submit_diagnostic(user_id: str, body: DiagnosticSubmit):
    conn = get_conn()
    user = conn.execute("SELECT id FROM users WHERE id=?", (user_id,)).fetchone()
    conn.close()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    answers = [a.model_dump() for a in body.answers]
    result = process_diagnostic(user_id, answers)
    return result


# ─────────────────────────────────────────────────────
# PROGRESO Y QUIZZES
# ─────────────────────────────────────────────────────

@app.post("/api/users/{user_id}/quiz")
def submit_quiz(user_id: str, body: QuizSubmit):
    answers = [a.model_dump() for a in body.answers]
    result = process_quiz_result(
        user_id, body.lesson_id, answers, body.time_spent_seconds
    )
    return result


@app.get("/api/users/{user_id}/next-lesson")
def next_lesson(user_id: str):
    lesson = get_next_lesson(user_id)
    return {"lesson": lesson}


@app.get("/api/users/{user_id}/insights")
def user_insights(user_id: str):
    return get_performance_insights(user_id)


@app.get("/api/users/{user_id}/progress")
def user_progress(user_id: str):
    stats = get_user_stats(user_id)
    if not stats:
        raise HTTPException(404, "Usuario no encontrado")
    return {
        "completed_lessons": stats["completed_lessons"],
        "mastery": stats["mastery"],
        "progress": stats["progress"],
    }


# ─────────────────────────────────────────────────────
# TUTOR IA (AWS Bedrock — Claude)
# ─────────────────────────────────────────────────────

@app.post("/api/tutor")
def ask_tutor(body: TutorMessage):
    stats = get_user_stats(body.user_id)
    user_name = stats["user"]["name"] if stats else "estudiante"
    level = stats["level"] if stats else 1
    mastery = stats["mastery"] if stats else {}

    # Contexto de la lección si está estudiando una
    lesson_context = ""
    if body.context_lesson_id:
        lesson = next((l for l in LESSONS if l["id"] == body.context_lesson_id), None)
        if lesson:
            lesson_context = f"\n\nEl estudiante está en la lección: '{lesson['title']}' (Track: {lesson['track_id']}, Dificultad: {lesson['difficulty']})"

    weak = [t for t, m in mastery.items() if isinstance(m, dict) and m.get("mastery_score", 1) < 0.6]
    weak_str = ", ".join(weak) if weak else "ninguno identificado aún"

    system_prompt = f"""Eres el tutor IA de OpenIA Academy, una plataforma de aprendizaje de IA y Machine Learning.

Tu estudiante se llama {user_name} y tiene TDAH. Esto significa:
- Respuestas CORTAS: máximo 3-4 párrafos pequeños
- Usa bullet points y emojis para estructurar
- Una idea por párrafo
- Termina con UNA pregunta de reflexión o UN ejercicio práctico concreto
- Tono: directo, motivador, sin condescendencia
- Usa analogías y ejemplos del mundo real, evita jerga abstracta

Su nivel actual: {level}/10
Sus temas más débiles: {weak_str}{lesson_context}

Responde siempre en español. Si la pregunta es técnica, da un ejemplo de código breve cuando sea relevante.
Adapta la complejidad de tu respuesta a su nivel: nivel {level} significa {'principiante absoluto' if level <= 2 else 'intermedio' if level <= 5 else 'avanzado'}."""

    try:
        region = os.environ.get("AWS_REGION", "us-east-1")
        bedrock = boto3.client("bedrock-runtime", region_name=region)

        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-5-haiku-20241022-v1:0",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 600,
                "system": system_prompt,
                "messages": [{"role": "user", "content": body.message}]
            }),
            contentType="application/json",
            accept="application/json"
        )
        result = json.loads(response["body"].read())
        reply = result["content"][0]["text"]
    except Exception as e:
        err_msg = str(e)[:100]
        reply = f"⚠️ El tutor IA no está disponible ahora ({err_msg}). Revisa la sección de conceptos de la lección actual."

    return {"reply": reply, "user_id": body.user_id}


# ─────────────────────────────────────────────────────
# GENERADOR DE EXPLICACIONES IA
# ─────────────────────────────────────────────────────

@app.post("/api/explain")
async def explain_concept(data: dict):
    concept = data.get("concept", "")
    user_id = data.get("user_id", "")
    stats = get_user_stats(user_id) if user_id else None
    level = stats["level"] if stats else 1

    try:
        region = os.environ.get("AWS_REGION", "us-east-1")
        bedrock = boto3.client("bedrock-runtime", region_name=region)

        prompt = f"""Explica '{concept}' para alguien con nivel {level}/10 en IA/ML.
        
Formato OBLIGATORIO:
1. Una oración que define qué es (sin tecnicismos)
2. Una analogía del mundo real (2-3 oraciones)  
3. Por qué importa en la práctica (1-2 oraciones)
4. Un ejemplo concreto (código o caso real)

Máximo 200 palabras. En español."""

        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-5-haiku-20241022-v1:0",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 400,
                "messages": [{"role": "user", "content": prompt}]
            }),
            contentType="application/json",
            accept="application/json"
        )
        result = json.loads(response["body"].read())
        explanation = result["content"][0]["text"]
    except Exception as e:
        explanation = f"Concepto: {concept}. Consulta la lección para más detalles."

    return {"explanation": explanation, "concept": concept}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8012)
