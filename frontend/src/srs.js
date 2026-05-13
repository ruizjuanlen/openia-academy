/**
 * srs.js — Sistema de Repetición Espaciada (SM-2 modificado).
 * Cada pregunta tiene: interval, ease_factor, repetitions, next_due, history.
 * Garantiza que preguntas no se repitan hasta el momento óptimo de memoria.
 */

const SRS_KEY_PREFIX = 'srs_v1_'

// ── Constantes SM-2 ───────────────────────────────────────────────────────────
const DEFAULT_EF = 2.5     // ease factor inicial
const MIN_EF     = 1.3     // mínimo ease factor
const MAX_INTERVAL = 180   // días máximo entre repeticiones

// ── Persistencia ─────────────────────────────────────────────────────────────
function loadSRS(uid) {
  try {
    const raw = localStorage.getItem(SRS_KEY_PREFIX + uid)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function saveSRS(uid, data) {
  try { localStorage.setItem(SRS_KEY_PREFIX + uid, JSON.stringify(data)) } catch {}
}

function getCard(srsData, qid) {
  return srsData[qid] || {
    qid,
    repetitions: 0,
    ease_factor: DEFAULT_EF,
    interval: 0,
    next_due: 0,        // timestamp ms, 0 = nunca vista = máxima prioridad
    history: [],        // [{correct, time_ms, ts}]
    seen_count: 0,
  }
}

// ── Core SM-2 ─────────────────────────────────────────────────────────────────
/**
 * Actualiza la tarjeta SRS tras responder.
 * quality: 0-5 (5=fácil y correcto, 0=incorrecto sin recordar nada)
 */
export function updateCard(uid, qid, correct, timeMs) {
  const srsData = loadSRS(uid)
  const card = getCard(srsData, qid)
  const now = Date.now()

  // Calcular quality 0-5 basado en corrección y tiempo
  let quality
  if (!correct) {
    quality = timeMs < 4000 ? 1 : 0  // rápido incorrecto = impulsivo, lento = no sabe
  } else {
    if (timeMs < 5000)  quality = 5  // rápido y correcto = domina
    else if (timeMs < 12000) quality = 4
    else if (timeMs < 25000) quality = 3
    else quality = 3  // lento pero correcto = sabe pero con esfuerzo
  }

  // SM-2 update
  let { repetitions, ease_factor, interval } = card

  if (quality >= 3) {
    if (repetitions === 0)      interval = 1
    else if (repetitions === 1) interval = 6
    else                        interval = Math.min(Math.round(interval * ease_factor), MAX_INTERVAL)
    repetitions++
  } else {
    // Respuesta incorrecta: resetear
    repetitions = 0
    interval = 1
  }

  // Actualizar ease factor
  ease_factor = Math.max(MIN_EF, ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  const next_due = now + interval * 24 * 60 * 60 * 1000

  // Guardar historial (máx 50 por pregunta)
  const history = [...(card.history || []), { correct, time_ms: timeMs, ts: now, quality }]
    .slice(-50)

  srsData[qid] = {
    qid,
    repetitions,
    ease_factor: Math.round(ease_factor * 1000) / 1000,
    interval,
    next_due,
    history,
    seen_count: (card.seen_count || 0) + 1,
    last_seen: now,
  }

  saveSRS(uid, srsData)
  return srsData[qid]
}

/**
 * Selecciona las mejores preguntas para la próxima sesión.
 * Prioridad: 1) vencidas (overdue), 2) nuevas, 3) próximas a vencer
 * Asegura variedad de temas y evita repetir las últimas N preguntas.
 */
export function selectQuestions(uid, allQuestions, opts = {}) {
  const {
    count       = 10,
    topicFilter = null,    // null = todos los temas
    recentLimit = 15,      // evitar las últimas N preguntas vistas
    difficulty  = null,    // null = todos, 'beginner'|'intermediate'|'advanced'
  } = opts

  const srsData = loadSRS(uid)
  const now = Date.now()

  // Filtrar por topic y dificultad
  let pool = allQuestions
  if (topicFilter) pool = pool.filter(q => q.topic === topicFilter)
  if (difficulty)  pool = pool.filter(q => q.difficulty === difficulty)

  // Obtener las últimas preguntas vistas para evitar repetición inmediata
  const allCards = Object.values(srsData).sort((a, b) => (b.last_seen || 0) - (a.last_seen || 0))
  const recentIds = new Set(allCards.slice(0, recentLimit).map(c => c.qid))

  // Calcular prioridad para cada pregunta
  const scored = pool.map(q => {
    const card = getCard(srsData, q.id)
    const isNew = card.seen_count === 0
    const isRecent = recentIds.has(q.id)
    const isOverdue = !isNew && card.next_due < now
    const daysOverdue = isOverdue ? (now - card.next_due) / (24 * 60 * 60 * 1000) : 0

    let priority = 0
    if (isRecent)  priority = -1000  // penalizar fuertemente las recientes
    else if (isNew) priority = 500 + Math.random() * 100  // nuevas tienen alta prioridad
    else if (isOverdue) priority = 800 + daysOverdue * 10  // vencidas: urgente
    else {
      // No vencida: baja prioridad pero no cero
      const daysUntilDue = (card.next_due - now) / (24 * 60 * 60 * 1000)
      priority = Math.max(0, 100 - daysUntilDue * 5)
    }

    return { q, priority, card, isNew, isOverdue }
  })

  // Ordenar por prioridad y asegurar diversidad de temas
  scored.sort((a, b) => b.priority - a.priority)

  // Seleccionar con diversidad de temas: máx 3 preguntas del mismo tema
  const topicCounts = {}
  const selected = []
  for (const item of scored) {
    if (selected.length >= count) break
    const topic = item.q.topic
    if ((topicCounts[topic] || 0) >= 3) continue
    topicCounts[topic] = (topicCounts[topic] || 0) + 1
    selected.push(item.q)
  }

  // Si no hay suficientes con diversidad, rellenar
  if (selected.length < count) {
    const selectedIds = new Set(selected.map(q => q.id))
    for (const item of scored) {
      if (selected.length >= count) break
      if (!selectedIds.has(item.q.id)) {
        selected.push(item.q)
        selectedIds.add(item.q.id)
      }
    }
  }

  return selected
}

/**
 * Estadísticas SRS del usuario.
 */
export function getSRSStats(uid, allQuestions) {
  const srsData = loadSRS(uid)
  const now = Date.now()
  const total = allQuestions.length
  const seen = Object.keys(srsData).length
  const cards = Object.values(srsData)

  const due = cards.filter(c => c.next_due < now && c.seen_count > 0).length
  const learning = cards.filter(c => c.repetitions > 0 && c.repetitions < 3).length
  const mature = cards.filter(c => c.repetitions >= 3).length
  const avgEF = cards.length > 0
    ? (cards.reduce((s, c) => s + c.ease_factor, 0) / cards.length).toFixed(2)
    : DEFAULT_EF

  const allHistory = cards.flatMap(c => c.history || [])
  const totalAnswers = allHistory.length
  const correctAnswers = allHistory.filter(h => h.correct).length
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

  // Próximas a vencer en los próximos 7 días
  const next7days = cards.filter(c => {
    const days = (c.next_due - now) / (24 * 60 * 60 * 1000)
    return days > 0 && days <= 7
  }).length

  return {
    total,
    seen,
    unseen: total - seen,
    due,
    learning,
    mature,
    avg_ease_factor: parseFloat(avgEF),
    total_answers: totalAnswers,
    accuracy,
    next7days,
    retention_estimate: mature > 0 ? Math.min(99, Math.round(70 + mature / Math.max(seen, 1) * 30)) : 0,
  }
}

/**
 * Devuelve los datos SRS de una pregunta específica.
 */
export function getCardData(uid, qid) {
  const srsData = loadSRS(uid)
  return getCard(srsData, qid)
}

/**
 * Shuffle opciones de una pregunta preservando qué opción es la correcta.
 * Devuelve {options, correctIndex}.
 */
export function shuffleOptions(options, correctIndex) {
  const correctText = options[correctIndex]
  const shuffled = [...options].sort(() => Math.random() - 0.5)
  return {
    options: shuffled,
    correctIndex: shuffled.indexOf(correctText),
  }
}
