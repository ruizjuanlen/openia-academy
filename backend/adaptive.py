"""
Motor adaptativo: analiza el rendimiento del usuario y decide
qué estudiar a continuación, ajusta la dificultad, y calcula
el "estado mental" para personalizar la experiencia TDAH.
"""
import json
from datetime import datetime, date
from database import get_conn, row_to_dict
from curriculum import LESSONS, TRACKS, DIAGNOSTIC_QUESTIONS


# XP necesario para cada nivel
LEVEL_XP = {1: 0, 2: 200, 3: 500, 4: 900, 5: 1400,
            6: 2000, 7: 2700, 8: 3500, 9: 4400, 10: 5500}

ACHIEVEMENTS = [
    {"id": "first_lesson",    "name": "Primera lección",  "icon": "🎯", "xp": 50,  "condition": "lessons_completed >= 1"},
    {"id": "streak_3",        "name": "3 días seguidos",   "icon": "🔥", "xp": 100, "condition": "streak >= 3"},
    {"id": "streak_7",        "name": "Semana completa",   "icon": "⚡", "xp": 200, "condition": "streak >= 7"},
    {"id": "foundations_done","name": "Fundamentos IA",    "icon": "🧠", "xp": 300, "condition": "track_foundations_done"},
    {"id": "prompt_master",   "name": "Prompt Master",     "icon": "✍️", "xp": 400, "condition": "track_prompt_done"},
    {"id": "sql_debut",       "name": "SQL Debut",         "icon": "📊", "xp": 100, "condition": "lesson_ae02_done"},
    {"id": "xp_500",          "name": "500 XP",            "icon": "💎", "xp": 50,  "condition": "xp >= 500"},
    {"id": "xp_1000",         "name": "1.000 XP",          "icon": "🏆", "xp": 100, "condition": "xp >= 1000"},
    {"id": "perfect_quiz",    "name": "Quiz perfecto",     "icon": "⭐", "xp": 75,  "condition": "perfect_score"},
    {"id": "speed_demon",     "name": "Respuesta rápida",  "icon": "🚀", "xp": 30,  "condition": "fast_answer"},
]


def get_user_stats(user_id: str) -> dict:
    conn = get_conn()
    user = row_to_dict(conn.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ).fetchone())
    if not user:
        conn.close()
        return None

    # Progreso por lección
    progress = conn.execute(
        "SELECT lesson_id, completed, score, xp_earned, time_spent_seconds "
        "FROM user_progress WHERE user_id = ?", (user_id,)
    ).fetchall()
    progress_map = {r["lesson_id"]: dict(r) for r in progress}

    # Dominio por tema
    mastery = conn.execute(
        "SELECT topic, mastery_score, questions_seen, questions_correct "
        "FROM topic_mastery WHERE user_id = ?", (user_id,)
    ).fetchall()
    mastery_map = {r["topic"]: dict(r) for r in mastery}

    # Logros
    achievements = [r["achievement_id"] for r in conn.execute(
        "SELECT achievement_id FROM achievements WHERE user_id = ?", (user_id,)
    ).fetchall()]

    conn.close()

    completed = [lid for lid, p in progress_map.items() if p["completed"]]
    total_xp = user["xp"]
    current_level = 1
    for lvl, req_xp in LEVEL_XP.items():
        if total_xp >= req_xp:
            current_level = lvl

    # XP para el siguiente nivel
    next_level_xp = LEVEL_XP.get(current_level + 1, LEVEL_XP[10])
    prev_level_xp = LEVEL_XP.get(current_level, 0)
    level_progress = 0
    if next_level_xp > prev_level_xp:
        level_progress = (total_xp - prev_level_xp) / (next_level_xp - prev_level_xp)

    return {
        "user": user,
        "progress": progress_map,
        "completed_lessons": completed,
        "mastery": mastery_map,
        "achievements": achievements,
        "level": current_level,
        "next_level_xp": next_level_xp,
        "level_progress": round(level_progress, 3),
        "lessons_completed_count": len(completed),
    }


def get_next_lesson(user_id: str) -> dict:
    """Decide qué lección es la más adecuada para estudiar ahora."""
    stats = get_user_stats(user_id)
    if not stats:
        return None

    completed = set(stats["completed_lessons"])
    mastery = stats["mastery"]

    # Ordenar lecciones por track y orden
    all_lessons = sorted(LESSONS, key=lambda l: (
        next((t["order"] for t in TRACKS if t["id"] == l["track_id"]), 99),
        l["order"]
    ))

    # Lecciones que el usuario puede hacer (prerequisites cumplidos)
    available_tracks = set()
    for track in TRACKS:
        requires = track.get("requires", [])
        if not requires:
            available_tracks.add(track["id"])
        else:
            # Comprobar si completó todas las lecciones de los tracks requeridos
            for req in requires:
                req_lessons = [l["id"] for l in LESSONS if l["track_id"] == req]
                if req_lessons and all(l in completed for l in req_lessons):
                    available_tracks.add(track["id"])

    candidates = []
    for lesson in all_lessons:
        if lesson["id"] in completed:
            continue
        if lesson["track_id"] not in available_tracks:
            continue
        candidates.append(lesson)

    if not candidates:
        return None

    # Priorizar por: tema más débil → lección de menor orden en ese tema
    topic_scores = {t: mastery.get(t, {}).get("mastery_score", 0.5) for t in
                    set(l["track_id"] for l in candidates)}
    weakest_topic = min(topic_scores, key=topic_scores.get)

    # Primero intentar seguir el track más débil
    topic_candidates = [l for l in candidates if l["track_id"] == weakest_topic]
    if topic_candidates:
        return topic_candidates[0]
    return candidates[0]


def process_quiz_result(user_id: str, lesson_id: str, answers: list,
                         time_spent_seconds: int) -> dict:
    """Procesa las respuestas de un quiz y actualiza el perfil del usuario."""
    conn = get_conn()

    lesson = next((l for l in LESSONS if l["id"] == lesson_id), None)
    if not lesson:
        conn.close()
        return {"error": "Lesson not found"}

    total = len(answers)
    correct = sum(1 for a in answers if a.get("correct", False))
    score = correct / total if total > 0 else 0
    xp_base = lesson["xp_reward"]
    xp_multiplier = 1.0 + (score - 0.5)  # 0.5x → 1.5x según score
    xp_earned = max(int(xp_base * xp_multiplier), int(xp_base * 0.3))

    now = datetime.utcnow().isoformat()

    # Guardar respuestas individuales
    for ans in answers:
        conn.execute(
            "INSERT INTO quiz_answers (user_id, question_id, lesson_id, correct, "
            "response_time_ms, answered_at, topic) VALUES (?,?,?,?,?,?,?)",
            (user_id, ans.get("question_id", ""), lesson_id,
             1 if ans.get("correct") else 0,
             ans.get("response_time_ms", 0), now, lesson["track_id"])
        )

    # Actualizar o crear progreso de lección
    conn.execute("""
        INSERT INTO user_progress (user_id, lesson_id, completed, score,
            time_spent_seconds, xp_earned, completed_at)
        VALUES (?,?,1,?,?,?,?)
        ON CONFLICT(user_id, lesson_id) DO UPDATE SET
            completed=1, score=MAX(score, excluded.score),
            attempts=attempts+1, time_spent_seconds=excluded.time_spent_seconds,
            xp_earned=MAX(xp_earned, excluded.xp_earned),
            completed_at=excluded.completed_at
    """, (user_id, lesson_id, score, time_spent_seconds, xp_earned, now))

    # Actualizar dominio del tema
    topic = lesson["track_id"]
    conn.execute("""
        INSERT INTO topic_mastery (user_id, topic, mastery_score,
            questions_seen, questions_correct, last_updated)
        VALUES (?,?,?,?,?,?)
        ON CONFLICT(user_id, topic) DO UPDATE SET
            questions_seen=questions_seen+excluded.questions_seen,
            questions_correct=questions_correct+excluded.questions_correct,
            mastery_score=(questions_correct+excluded.questions_correct) * 1.0 /
                          (questions_seen+excluded.questions_seen),
            last_updated=excluded.last_updated
    """, (user_id, topic, score, total, correct, now))

    # Actualizar usuario: XP + streak
    user = row_to_dict(conn.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ).fetchone())

    today = date.today().isoformat()
    last = user.get("last_study_date")
    streak = user.get("streak", 0)

    if last == today:
        pass  # ya estudió hoy
    elif last == str(date.fromordinal(date.today().toordinal() - 1)):
        streak += 1  # ayer estudió, continuamos racha
    else:
        streak = 1  # racha rota o nuevo

    conn.execute("""
        UPDATE users SET
            xp = xp + ?,
            streak = ?,
            last_study_date = ?,
            total_time_seconds = total_time_seconds + ?
        WHERE id = ?
    """, (xp_earned, streak, today, time_spent_seconds, user_id))

    conn.commit()

    # Verificar logros
    new_achievements = _check_achievements(user_id, conn, score == 1.0)
    conn.commit()
    conn.close()

    return {
        "score": score,
        "correct": correct,
        "total": total,
        "xp_earned": xp_earned,
        "new_streak": streak,
        "new_achievements": new_achievements,
        "lesson_id": lesson_id,
    }


def process_diagnostic(user_id: str, answers: list) -> dict:
    """Procesa el diagnóstico inicial y construye el perfil base."""
    conn = get_conn()
    now = datetime.utcnow().isoformat()

    topic_results = {}
    for ans in answers:
        qid = ans.get("question_id")
        q = next((q for q in DIAGNOSTIC_QUESTIONS if q["id"] == qid), None)
        if not q:
            continue
        is_correct = ans.get("answer") == q["correct"]
        topic = q["topic"]
        if topic not in topic_results:
            topic_results[topic] = {"correct": 0, "total": 0}
        topic_results[topic]["total"] += 1
        if is_correct:
            topic_results[topic]["correct"] += 1

        conn.execute(
            "INSERT INTO diagnostic_results (user_id, question_id, correct, "
            "response_time_ms, answered_at, topic) VALUES (?,?,?,?,?,?)",
            (user_id, qid, 1 if is_correct else 0,
             ans.get("response_time_ms", 0), now, topic)
        )

    # Crear mastery inicial por topic
    for topic, res in topic_results.items():
        mastery = res["correct"] / res["total"] if res["total"] > 0 else 0
        conn.execute("""
            INSERT INTO topic_mastery (user_id, topic, mastery_score,
                questions_seen, questions_correct, last_updated)
            VALUES (?,?,?,?,?,?)
            ON CONFLICT(user_id, topic) DO UPDATE SET
                mastery_score=excluded.mastery_score,
                questions_seen=excluded.questions_seen,
                questions_correct=excluded.questions_correct,
                last_updated=excluded.last_updated
        """, (user_id, topic, mastery, res["total"], res["correct"], now))

    conn.execute(
        "UPDATE users SET diagnostic_done=1 WHERE id=?", (user_id,)
    )
    conn.commit()
    conn.close()

    # Determinar nivel inicial y primera recomendación
    weak_topics = [t for t, r in topic_results.items()
                   if r["total"] > 0 and r["correct"] / r["total"] < 0.6]
    strong_topics = [t for t, r in topic_results.items()
                     if r["total"] > 0 and r["correct"] / r["total"] >= 0.8]

    return {
        "topic_results": {t: {
            "score": r["correct"] / r["total"] if r["total"] > 0 else 0,
            "correct": r["correct"], "total": r["total"]
        } for t, r in topic_results.items()},
        "weak_topics": weak_topics,
        "strong_topics": strong_topics,
        "next_lesson": get_next_lesson(user_id),
    }


def _check_achievements(user_id: str, conn, perfect_score: bool = False) -> list:
    user = row_to_dict(conn.execute(
        "SELECT * FROM users WHERE id = ?", (user_id,)
    ).fetchone())
    if not user:
        return []

    existing = {r["achievement_id"] for r in conn.execute(
        "SELECT achievement_id FROM achievements WHERE user_id = ?", (user_id,)
    ).fetchall()}

    completed_count = conn.execute(
        "SELECT COUNT(*) as c FROM user_progress WHERE user_id=? AND completed=1",
        (user_id,)
    ).fetchone()["c"]

    track_done = {}
    for track in TRACKS:
        track_lessons = [l["id"] for l in LESSONS if l["track_id"] == track["id"]]
        completed_in_track = conn.execute(
            f"SELECT COUNT(*) as c FROM user_progress WHERE user_id=? "
            f"AND completed=1 AND lesson_id IN ({','.join('?' * len(track_lessons))})",
            [user_id] + track_lessons
        ).fetchone()["c"] if track_lessons else 0
        track_done[track["id"]] = completed_in_track >= len(track_lessons)

    now = datetime.utcnow().isoformat()
    new_achievements = []

    checks = {
        "first_lesson": completed_count >= 1,
        "streak_3": user.get("streak", 0) >= 3,
        "streak_7": user.get("streak", 0) >= 7,
        "foundations_done": track_done.get("foundations", False),
        "prompt_master": track_done.get("prompt_engineering", False),
        "sql_debut": conn.execute(
            "SELECT 1 FROM user_progress WHERE user_id=? AND lesson_id='ae02' AND completed=1",
            (user_id,)
        ).fetchone() is not None,
        "xp_500": user.get("xp", 0) >= 500,
        "xp_1000": user.get("xp", 0) >= 1000,
        "perfect_quiz": perfect_score,
        "speed_demon": False,  # se activa con respuesta < 5 seg
    }

    for ach in ACHIEVEMENTS:
        if ach["id"] not in existing and checks.get(ach["id"], False):
            conn.execute(
                "INSERT INTO achievements (user_id, achievement_id, unlocked_at) VALUES (?,?,?)",
                (user_id, ach["id"], now)
            )
            conn.execute(
                "UPDATE users SET xp=xp+? WHERE id=?",
                (ach["xp"], user_id)
            )
            new_achievements.append({
                "id": ach["id"],
                "name": ach["name"],
                "icon": ach["icon"],
                "xp": ach["xp"],
            })

    return new_achievements


def get_performance_insights(user_id: str) -> dict:
    """Genera insights personalizados sobre el rendimiento del usuario."""
    conn = get_conn()
    mastery = conn.execute(
        "SELECT topic, mastery_score, questions_seen, questions_correct "
        "FROM topic_mastery WHERE user_id=? ORDER BY mastery_score ASC",
        (user_id,)
    ).fetchall()

    recent_answers = conn.execute(
        "SELECT correct, topic, answered_at FROM quiz_answers "
        "WHERE user_id=? ORDER BY answered_at DESC LIMIT 50",
        (user_id,)
    ).fetchall()

    conn.close()

    if not mastery:
        return {"message": "Completa el diagnóstico para ver tus insights"}

    weakest = [dict(r) for r in mastery[:2]]
    strongest = [dict(r) for r in mastery[-2:]] if len(mastery) >= 2 else []

    # Tendencia reciente (últimas 10 vs anteriores 10)
    recent_10 = [r["correct"] for r in recent_answers[:10]]
    prev_10 = [r["correct"] for r in recent_answers[10:20]]
    trend = "mejorando" if (sum(recent_10) > sum(prev_10) and prev_10) else "estable"

    topic_labels = {
        "foundations": "Fundamentos IA",
        "prompt_engineering": "Prompt Engineering",
        "analytics": "Analytics Engineering",
        "ml_engineering": "ML Engineering",
        "ai_architecture": "AI Architecture",
    }

    return {
        "weakest_topics": [{
            "topic": r["topic"],
            "label": topic_labels.get(r["topic"], r["topic"]),
            "score": round(r["mastery_score"] * 100, 1),
        } for r in weakest if r["mastery_score"] < 0.7],
        "strongest_topics": [{
            "topic": r["topic"],
            "label": topic_labels.get(r["topic"], r["topic"]),
            "score": round(r["mastery_score"] * 100, 1),
        } for r in strongest],
        "trend": trend,
        "total_questions_answered": sum(r["questions_seen"] for r in mastery),
    }
