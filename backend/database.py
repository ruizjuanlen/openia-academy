import sqlite3
import json
from datetime import datetime, date
from pathlib import Path

DB_PATH = Path(__file__).parent / "openia_academy.db"


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db():
    conn = get_conn()
    conn.executescript("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 1,
        streak INTEGER DEFAULT 0,
        last_study_date TEXT,
        adhd_mode INTEGER DEFAULT 1,
        total_time_seconds INTEGER DEFAULT 0,
        diagnostic_done INTEGER DEFAULT 0,
        preferences TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS user_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        lesson_id TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        score REAL DEFAULT 0,
        time_spent_seconds INTEGER DEFAULT 0,
        attempts INTEGER DEFAULT 1,
        completed_at TEXT,
        xp_earned INTEGER DEFAULT 0,
        UNIQUE(user_id, lesson_id)
    );

    CREATE TABLE IF NOT EXISTS quiz_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        lesson_id TEXT,
        correct INTEGER NOT NULL,
        response_time_ms INTEGER,
        answered_at TEXT NOT NULL,
        topic TEXT
    );

    CREATE TABLE IF NOT EXISTS diagnostic_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        correct INTEGER NOT NULL,
        response_time_ms INTEGER,
        answered_at TEXT NOT NULL,
        topic TEXT
    );

    CREATE TABLE IF NOT EXISTS topic_mastery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        mastery_score REAL DEFAULT 0.0,
        questions_seen INTEGER DEFAULT 0,
        questions_correct INTEGER DEFAULT 0,
        last_updated TEXT,
        UNIQUE(user_id, topic)
    );

    CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        duration_seconds INTEGER DEFAULT 0,
        lessons_completed INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        achievement_id TEXT NOT NULL,
        unlocked_at TEXT NOT NULL,
        UNIQUE(user_id, achievement_id)
    );
    """)
    conn.commit()
    conn.close()


def row_to_dict(row):
    if row is None:
        return None
    d = dict(row)
    for k, v in d.items():
        if isinstance(v, str):
            try:
                d[k] = json.loads(v)
            except Exception:
                pass
    return d
