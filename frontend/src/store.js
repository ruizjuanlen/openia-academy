/**
 * store.js — Motor offline completo que reemplaza el backend.
 * Todo se guarda en localStorage. Sin servidor, sin red requerida.
 */
import { CURRICULUM } from './data/curriculum.js'

const { TRACKS, LESSONS, DIAGNOSTIC_QUESTIONS, LESSON_QUESTIONS } = CURRICULUM

// ─── Constantes ──────────────────────────────────────────────────────────────
const KEY = 'openia_store_v2'

export const LEVEL_XP = { 1: 0, 2: 200, 3: 500, 4: 900, 5: 1400,
                           6: 2000, 7: 2700, 8: 3500, 9: 4400, 10: 5500 }

export const ACHIEVEMENTS = [
  { id: 'first_lesson',     name: 'Primera lección',   icon: '🎯', xp: 50  },
  { id: 'streak_3',         name: '3 días seguidos',    icon: '🔥', xp: 100 },
  { id: 'streak_7',         name: 'Semana completa',    icon: '⚡', xp: 200 },
  { id: 'foundations_done', name: 'Fundamentos IA',     icon: '🧠', xp: 300 },
  { id: 'prompt_master',    name: 'Prompt Master',      icon: '✍️', xp: 400 },
  { id: 'sql_debut',        name: 'SQL Debut',          icon: '📊', xp: 100 },
  { id: 'xp_500',           name: '500 XP',             icon: '💎', xp: 50  },
  { id: 'xp_1000',          name: '1.000 XP',           icon: '🏆', xp: 100 },
  { id: 'xp_2000',          name: '2.000 XP',           icon: '👑', xp: 200 },
  { id: 'perfect_quiz',     name: 'Quiz perfecto',      icon: '⭐', xp: 75  },
  { id: 'speed_demon',      name: 'Respuesta rápida',   icon: '🚀', xp: 30  },
  { id: 'lessons_5',        name: '5 lecciones',        icon: '📚', xp: 150 },
  { id: 'lessons_10',       name: '10 lecciones',       icon: '🎓', xp: 300 },
]

// ─── Persistencia ────────────────────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function save(store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)) } catch {}
}

function getUser(uid) {
  const store = load()
  return store[uid] || null
}

function saveUser(uid, userData) {
  const store = load()
  store[uid] = userData
  save(store)
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uid8() {
  return Math.random().toString(36).slice(2, 10)
}

function computeLevel(xp) {
  let level = 1
  for (const [lvl, req] of Object.entries(LEVEL_XP)) {
    if (xp >= req) level = Number(lvl)
  }
  return level
}

function computeLevelProgress(xp) {
  const level = computeLevel(xp)
  const cur = LEVEL_XP[level] ?? 0
  const next = LEVEL_XP[level + 1] ?? LEVEL_XP[10]
  if (next <= cur) return 1
  return Math.min(1, (xp - cur) / (next - cur))
}

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function shuffleWithCorrect(options, correctIdx) {
  const correctText = options[correctIdx]
  const shuffled = [...options].sort(() => Math.random() - 0.5)
  return { options: shuffled, correct: shuffled.indexOf(correctText) }
}

// ─── API pública ─────────────────────────────────────────────────────────────

/** Crea un usuario nuevo y devuelve { user_id, name } */
export function createUser(name) {
  const user_id = uid8()
  const now = new Date().toISOString()
  const userData = {
    id: user_id,
    name: name.trim(),
    created_at: now,
    xp: 0,
    streak: 0,
    last_study_date: null,
    adhd_mode: true,
    total_time_seconds: 0,
    diagnostic_done: false,
    // progress: { [lesson_id]: { completed, score, xp_earned, time_spent_seconds, attempts } }
    progress: {},
    // mastery: { [topic]: { mastery_score, questions_seen, questions_correct } }
    mastery: {},
    // achievements: ['first_lesson', ...]
    achievements: [],
    // diagnostic answers history
    diagnosticAnswers: [],
    // quiz answers history (last 100)
    quizHistory: [],
  }
  saveUser(user_id, userData)
  return { user_id, name: userData.name }
}

/** Devuelve datos completos del usuario + nivel calculado */
export function getUserStats(uid) {
  const u = getUser(uid)
  if (!u) return null
  const level = computeLevel(u.xp)
  const levelProgress = computeLevelProgress(u.xp)
  const nextLevelXp = LEVEL_XP[level + 1] ?? LEVEL_XP[10]
  const completed = Object.entries(u.progress)
    .filter(([, p]) => p.completed)
    .map(([id]) => id)

  return {
    user: u,
    progress: u.progress,
    completed_lessons: completed,
    mastery: u.mastery,
    achievements: u.achievements,
    level,
    level_progress: levelProgress,
    next_level_xp: nextLevelXp,
    current_level_xp: LEVEL_XP[level] ?? 0,
    lessons_completed_count: completed.length,
  }
}

/** Dashboard completo equivalente al GET /api/users/:id/dashboard */
export function getDashboard(uid) {
  const stats = getUserStats(uid)
  if (!stats) return null
  const { user } = stats

  const tracksProgress = TRACKS.map(track => {
    const trackLessons = LESSONS.filter(l => l.track_id === track.id)
    const completedCount = trackLessons.filter(l => stats.completed_lessons.includes(l.id)).length
    const mastery = user.mastery[track.id]
    return {
      ...track,
      lessons_total: trackLessons.length,
      lessons_completed: completedCount,
      progress_pct: trackLessons.length
        ? Math.round((completedCount / trackLessons.length) * 100)
        : 0,
      mastery: mastery
        ? Math.round((mastery.mastery_score ?? 0) * 100)
        : 0,
    }
  })

  const allAchievements = ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: user.achievements.includes(a.id),
  }))

  return {
    user: {
      id: user.id,
      name: user.name,
      xp: user.xp,
      level: stats.level,
      streak: user.streak,
      level_progress: stats.level_progress,
      next_level_xp: stats.next_level_xp,
      current_level_xp: stats.current_level_xp,
      lessons_completed: stats.lessons_completed_count,
      diagnostic_done: user.diagnostic_done,
      adhd_mode: user.adhd_mode,
    },
    tracks: tracksProgress,
    next_lesson: getNextLesson(uid),
    insights: getPerformanceInsights(uid),
    achievements: allAchievements,
    total_lessons: LESSONS.length,
  }
}

/** Diagnóstico: 15 preguntas mezcladas */
export function getDiagnostic() {
  return { questions: DIAGNOSTIC_QUESTIONS, total: DIAGNOSTIC_QUESTIONS.length }
}

/** Procesa las respuestas del diagnóstico y actualiza el perfil */
export function submitDiagnostic(uid, answers) {
  const u = getUser(uid)
  if (!u) return null

  const topicResults = {}
  for (const ans of answers) {
    const q = DIAGNOSTIC_QUESTIONS.find(q => q.id === ans.question_id)
    if (!q) continue
    const isCorrect = ans.answer === q.correct
    const t = q.topic
    if (!topicResults[t]) topicResults[t] = { correct: 0, total: 0 }
    topicResults[t].total++
    if (isCorrect) topicResults[t].correct++
  }

  // Actualizar mastery inicial
  for (const [topic, res] of Object.entries(topicResults)) {
    const score = res.total > 0 ? res.correct / res.total : 0
    u.mastery[topic] = {
      mastery_score: score,
      questions_seen: res.total,
      questions_correct: res.correct,
    }
  }

  u.diagnostic_done = true
  u.diagnosticAnswers = answers
  saveUser(uid, u)

  const weakTopics = Object.entries(topicResults)
    .filter(([, r]) => r.total > 0 && r.correct / r.total < 0.6)
    .map(([t]) => t)
  const strongTopics = Object.entries(topicResults)
    .filter(([, r]) => r.total > 0 && r.correct / r.total >= 0.8)
    .map(([t]) => t)

  return {
    topic_results: Object.fromEntries(
      Object.entries(topicResults).map(([t, r]) => [t, {
        score: r.total > 0 ? r.correct / r.total : 0,
        correct: r.correct,
        total: r.total,
      }])
    ),
    weak_topics: weakTopics,
    strong_topics: strongTopics,
    next_lesson: getNextLesson(uid),
  }
}

/** Devuelve una lección con preguntas de quiz mezcladas */
export function getLesson(lessonId, uid) {
  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) return null

  const pool = LESSON_QUESTIONS[lessonId] ||
    DIAGNOSTIC_QUESTIONS.filter(q => q.topic === lesson.track_id)

  const target = Math.min(pool.length, Math.floor(Math.random() * 3) + 5) // 5-7
  const selected = pool.length >= target
    ? [...pool].sort(() => Math.random() - 0.5).slice(0, target)
    : [...pool]

  const quizQuestions = selected.map(q => {
    const { options, correct } = shuffleWithCorrect(q.options, q.correct)
    return { ...q, options, correct }
  })

  const result = { ...lesson, quiz_questions: quizQuestions }

  if (uid) {
    const u = getUser(uid)
    result.user_progress = u?.progress[lessonId] || null
  }

  return result
}

/** Lecciones de un track con progreso del usuario */
export function getTrackLessons(trackId, uid) {
  const lessons = LESSONS
    .filter(l => l.track_id === trackId)
    .sort((a, b) => a.order - b.order)

  if (uid) {
    const u = getUser(uid)
    const p = u?.progress || {}
    return {
      track_id: trackId,
      lessons: lessons.map(l => ({
        ...l,
        completed: !!(p[l.id]?.completed),
        score: p[l.id]?.score || 0,
      })),
    }
  }
  return { track_id: trackId, lessons }
}

/** Siguiente lección recomendada para el usuario */
export function getNextLesson(uid) {
  const u = getUser(uid)
  if (!u) return null

  const completed = new Set(
    Object.entries(u.progress).filter(([, p]) => p.completed).map(([id]) => id)
  )
  const mastery = u.mastery

  // Calcular tracks disponibles
  const availableTracks = new Set()
  for (const track of TRACKS) {
    const requires = track.requires || []
    if (requires.length === 0) {
      availableTracks.add(track.id)
    } else {
      for (const req of requires) {
        const reqLessons = LESSONS.filter(l => l.track_id === req).map(l => l.id)
        if (reqLessons.length > 0 && reqLessons.every(id => completed.has(id))) {
          availableTracks.add(track.id)
        }
      }
    }
  }

  const sorted = [...LESSONS].sort((a, b) => {
    const ta = TRACKS.findIndex(t => t.id === a.track_id)
    const tb = TRACKS.findIndex(t => t.id === b.track_id)
    return ta !== tb ? ta - tb : a.order - b.order
  })

  const candidates = sorted.filter(l =>
    !completed.has(l.id) && availableTracks.has(l.track_id)
  )

  if (candidates.length === 0) return null

  // Priorizar tema más débil
  const topicScores = {}
  for (const l of candidates) {
    topicScores[l.track_id] = mastery[l.track_id]?.mastery_score ?? 0.5
  }
  const weakestTopic = Object.entries(topicScores).sort((a, b) => a[1] - b[1])[0]?.[0]
  const topicFirst = candidates.filter(l => l.track_id === weakestTopic)
  return topicFirst[0] || candidates[0]
}

/** Procesa un quiz completado: actualiza XP, mastery, racha, logros */
export function submitQuiz(uid, lessonId, answers, timeSpentSeconds) {
  const u = getUser(uid)
  if (!u) return null

  const lesson = LESSONS.find(l => l.id === lessonId)
  if (!lesson) return null

  const total = answers.length
  const correct = answers.filter(a => a.correct).length
  const score = total > 0 ? correct / total : 0
  const xpBase = lesson.xp_reward
  const xpMultiplier = 1.0 + (score - 0.5)
  const xpEarned = Math.max(Math.round(xpBase * xpMultiplier), Math.round(xpBase * 0.3))

  // Actualizar progreso de lección
  const prev = u.progress[lessonId]
  u.progress[lessonId] = {
    completed: true,
    score: prev ? Math.max(prev.score, score) : score,
    xp_earned: prev ? Math.max(prev.xp_earned, xpEarned) : xpEarned,
    time_spent_seconds: timeSpentSeconds,
    attempts: (prev?.attempts || 0) + 1,
    completed_at: new Date().toISOString(),
  }

  // Actualizar mastery del tema
  const topic = lesson.track_id
  const existing = u.mastery[topic] || { mastery_score: 0, questions_seen: 0, questions_correct: 0 }
  const newSeen = existing.questions_seen + total
  const newCorrect = existing.questions_correct + correct
  u.mastery[topic] = {
    mastery_score: newSeen > 0 ? newCorrect / newSeen : 0,
    questions_seen: newSeen,
    questions_correct: newCorrect,
  }

  // XP y racha
  u.xp += xpEarned
  const today = todayStr()
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (u.last_study_date === today) {
    // ya estudió hoy, no cambia racha
  } else if (u.last_study_date === yesterday) {
    u.streak += 1
  } else {
    u.streak = 1
  }
  u.last_study_date = today
  u.total_time_seconds = (u.total_time_seconds || 0) + timeSpentSeconds

  // Historial de quiz
  u.quizHistory = [
    ...answers.map(a => ({ ...a, lesson_id: lessonId, topic, answered_at: new Date().toISOString() })),
    ...(u.quizHistory || []),
  ].slice(0, 200)

  // Verificar logros
  const newAchievements = checkAchievements(u, score === 1.0, answers)
  saveUser(uid, u)

  return {
    score,
    correct,
    total,
    xp_earned: xpEarned,
    new_streak: u.streak,
    new_achievements: newAchievements,
    lesson_id: lessonId,
  }
}

/** Comprueba y otorga logros nuevos */
function checkAchievements(u, perfectScore, answers) {
  const completed = Object.values(u.progress).filter(p => p.completed).length
  const trackDone = {}
  for (const track of TRACKS) {
    const trackLessons = LESSONS.filter(l => l.track_id === track.id).map(l => l.id)
    trackDone[track.id] = trackLessons.length > 0 &&
      trackLessons.every(id => u.progress[id]?.completed)
  }

  const avgResponseMs = answers?.length
    ? answers.reduce((s, a) => s + (a.response_time_ms || 9999), 0) / answers.length
    : 9999

  const checks = {
    first_lesson:     completed >= 1,
    streak_3:         u.streak >= 3,
    streak_7:         u.streak >= 7,
    foundations_done: trackDone['foundations'],
    prompt_master:    trackDone['prompt_engineering'],
    sql_debut:        !!(u.progress['ae02']?.completed),
    xp_500:           u.xp >= 500,
    xp_1000:          u.xp >= 1000,
    xp_2000:          u.xp >= 2000,
    perfect_quiz:     perfectScore,
    speed_demon:      avgResponseMs < 5000,
    lessons_5:        completed >= 5,
    lessons_10:       completed >= 10,
  }

  const newOnes = []
  for (const ach of ACHIEVEMENTS) {
    if (!u.achievements.includes(ach.id) && checks[ach.id]) {
      u.achievements.push(ach.id)
      u.xp += ach.xp
      newOnes.push(ach)
    }
  }
  return newOnes
}

/** Insights de rendimiento */
export function getPerformanceInsights(uid) {
  const u = getUser(uid)
  if (!u || Object.keys(u.mastery).length === 0) {
    return { message: 'Completa el diagnóstico para ver tus insights' }
  }

  const TOPIC_LABELS = {
    foundations: 'Fundamentos IA',
    prompt_engineering: 'Prompt Engineering',
    analytics: 'Analytics Engineering',
    ml_engineering: 'ML Engineering',
    ai_architecture: 'AI Architecture',
  }

  const sorted = Object.entries(u.mastery).sort((a, b) => a[1].mastery_score - b[1].mastery_score)
  const weakest = sorted.filter(([, m]) => m.mastery_score < 0.7).slice(0, 2)
  const strongest = sorted.slice(-2).reverse()

  const hist = u.quizHistory || []
  const recent10 = hist.slice(0, 10).filter(a => a.correct).length
  const prev10 = hist.slice(10, 20).filter(a => a.correct).length
  const trend = hist.length >= 20 && recent10 > prev10 ? 'mejorando' : 'estable'

  return {
    weakest_topics: weakest.map(([topic, m]) => ({
      topic,
      label: TOPIC_LABELS[topic] || topic,
      score: Math.round(m.mastery_score * 100),
    })),
    strongest_topics: strongest.map(([topic, m]) => ({
      topic,
      label: TOPIC_LABELS[topic] || topic,
      score: Math.round(m.mastery_score * 100),
    })),
    trend,
    total_questions_answered: Object.values(u.mastery).reduce((s, m) => s + m.questions_seen, 0),
  }
}

// Re-exports del curriculum por si algo lo necesita
export { TRACKS, LESSONS, DIAGNOSTIC_QUESTIONS, LESSON_QUESTIONS }
