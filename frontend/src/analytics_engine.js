/**
 * analytics_engine.js — Análisis conductual profundo del aprendizaje.
 * Detecta patrones, sesgos cognitivos, fatiga, velocidad de aprendizaje
 * y genera recomendaciones ultra-personalizadas.
 */
import { QUESTION_BANK } from './data/questions_bank.js'

// ── Helpers ───────────────────────────────────────────────────────────────────
function loadStore() {
  try { return JSON.parse(localStorage.getItem('openia_store_v2') || '{}') } catch { return {} }
}
function loadSRS(uid) {
  try { return JSON.parse(localStorage.getItem(`srs_v1_${uid}`) || '{}') } catch { return {} }
}

function avg(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0 }
function median(arr) {
  if (!arr.length) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
function stddev(arr) {
  const m = avg(arr)
  return Math.sqrt(avg(arr.map(x => (x - m) ** 2)))
}

const TOPIC_LABELS = {
  foundations: 'Fundamentos IA',
  prompt_engineering: 'Prompt Engineering',
  analytics: 'Analytics Engineering',
  ml_engineering: 'ML Engineering',
  ai_architecture: 'AI Architecture',
}

// ── 1. Análisis de tiempo de respuesta ────────────────────────────────────────
export function analyzeResponseTime(uid) {
  const srsData = loadSRS(uid)
  const allHistory = Object.values(srsData).flatMap(c =>
    (c.history || []).map(h => ({ ...h, qid: c.qid }))
  )
  if (allHistory.length < 5) return null

  const times = allHistory.map(h => h.time_ms).filter(t => t > 0 && t < 120000)
  const medianTime = median(times)
  const avgTime = avg(times)
  const p25 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.25)]
  const p75 = times.sort((a, b) => a - b)[Math.floor(times.length * 0.75)]

  // Clasificar respuestas por velocidad
  const fast   = allHistory.filter(h => h.time_ms < 5000)
  const medium = allHistory.filter(h => h.time_ms >= 5000 && h.time_ms < 20000)
  const slow   = allHistory.filter(h => h.time_ms >= 20000)

  const fastAccuracy   = fast.length   ? Math.round(avg(fast.map(h => h.correct ? 1 : 0)) * 100)   : null
  const mediumAccuracy = medium.length ? Math.round(avg(medium.map(h => h.correct ? 1 : 0)) * 100) : null
  const slowAccuracy   = slow.length   ? Math.round(avg(slow.map(h => h.correct ? 1 : 0)) * 100)   : null

  // Detectar patrón impulsivo (rápido pero incorrecto frecuentemente)
  const impulsiveRate = fast.length > 3
    ? Math.round((fast.filter(h => !h.correct).length / fast.length) * 100)
    : null
  const isImpulsive = impulsiveRate !== null && impulsiveRate > 40

  // Detectar sobreanálisis (muy lento pero también incorrecto)
  const overthinkRate = slow.length > 3
    ? Math.round((slow.filter(h => !h.correct).length / slow.length) * 100)
    : null

  return {
    median_ms: Math.round(medianTime),
    avg_ms: Math.round(avgTime),
    p25_ms: Math.round(p25 || 0),
    p75_ms: Math.round(p75 || 0),
    fast_accuracy: fastAccuracy,
    medium_accuracy: mediumAccuracy,
    slow_accuracy: slowAccuracy,
    impulsive_rate: impulsiveRate,
    is_impulsive: isImpulsive,
    overthink_rate: overthinkRate,
    total_time_min: Math.round(times.reduce((s, t) => s + t, 0) / 60000),
    optimal_zone_ms: 8000,  // 8s = zona óptima de reflexión
  }
}

// ── 2. Correlación velocidad-precisión ────────────────────────────────────────
export function getSpeedAccuracyCurve(uid) {
  const srsData = loadSRS(uid)
  const allHistory = Object.values(srsData).flatMap(c => c.history || [])
    .filter(h => h.time_ms > 0 && h.time_ms < 60000)

  if (allHistory.length < 10) return null

  // Agrupar en 5 buckets de tiempo
  const maxTime = Math.min(60000, Math.max(...allHistory.map(h => h.time_ms)))
  const bucketSize = maxTime / 5
  const buckets = Array.from({ length: 5 }, (_, i) => ({
    label: `${Math.round((i * bucketSize) / 1000)}-${Math.round(((i + 1) * bucketSize) / 1000)}s`,
    min: i * bucketSize,
    max: (i + 1) * bucketSize,
    items: [],
  }))

  for (const h of allHistory) {
    const bucket = buckets.find(b => h.time_ms >= b.min && h.time_ms < b.max)
    if (bucket) bucket.items.push(h)
  }

  return buckets
    .filter(b => b.items.length >= 2)
    .map(b => ({
      range: b.label,
      count: b.items.length,
      accuracy: Math.round(avg(b.items.map(h => h.correct ? 1 : 0)) * 100),
    }))
}

// ── 3. Análisis de conceptos confundidos ─────────────────────────────────────
export function getMisconceptionMap(uid) {
  const store = loadStore()
  const user = store[uid]
  if (!user) return null

  const quizHistory = user.quizHistory || []
  if (quizHistory.length < 10) return null

  // Agrupar errores por concepto/subtema
  const errorsByTopic = {}
  for (const h of quizHistory) {
    if (!h.correct) {
      const topic = h.topic || 'unknown'
      if (!errorsByTopic[topic]) errorsByTopic[topic] = { errors: 0, total: 0 }
      errorsByTopic[topic].errors++
    }
    if (h.topic) {
      if (!errorsByTopic[h.topic]) errorsByTopic[h.topic] = { errors: 0, total: 0 }
      errorsByTopic[h.topic].total++
    }
  }

  // Top conceptos con mayor tasa de error
  const srsData = loadSRS(uid)
  const conceptErrors = {}

  for (const card of Object.values(srsData)) {
    const history = card.history || []
    if (history.length < 2) continue

    const errors = history.filter(h => !h.correct).length
    const errorRate = errors / history.length

    // Buscar el concepto de la pregunta
    const allQ = QUESTION_BANK
    const q = allQ.find(q => q.id === card.qid)
    if (!q) continue

    const concept = q.concept || q.sub_topic || q.topic
    if (!conceptErrors[concept]) conceptErrors[concept] = { errors: 0, total: 0, topic: q.topic }
    conceptErrors[concept].errors += errors
    conceptErrors[concept].total += history.length
  }

  return Object.entries(conceptErrors)
    .filter(([, v]) => v.total >= 3)
    .map(([concept, v]) => ({
      concept,
      topic: v.topic,
      error_rate: Math.round((v.errors / v.total) * 100),
      total_attempts: v.total,
      label: TOPIC_LABELS[v.topic] || v.topic,
    }))
    .sort((a, b) => b.error_rate - a.error_rate)
    .slice(0, 10)
}

// ── 4. Velocidad de aprendizaje por tema ──────────────────────────────────────
export function getLearningVelocity(uid) {
  const srsData = loadSRS(uid)
  const allQ = QUESTION_BANK

  const topicEvolution = {}

  for (const card of Object.values(srsData)) {
    const history = (card.history || []).slice(0, 20)
    if (history.length < 3) continue

    const q = allQ.find(q => q.id === card.qid)
    if (!q) continue
    const topic = q.topic

    if (!topicEvolution[topic]) topicEvolution[topic] = []

    // Calcular accuracy en primeras 3 respuestas vs últimas 3
    const first3 = history.slice(0, 3)
    const last3 = history.slice(-3)
    const earlyAcc = avg(first3.map(h => h.correct ? 1 : 0))
    const recentAcc = avg(last3.map(h => h.correct ? 1 : 0))
    topicEvolution[topic].push({ earlyAcc, recentAcc, delta: recentAcc - earlyAcc })
  }

  return Object.entries(topicEvolution)
    .filter(([, items]) => items.length >= 2)
    .map(([topic, items]) => {
      const avgDelta = avg(items.map(i => i.delta))
      const avgEarly = avg(items.map(i => i.earlyAcc))
      const avgRecent = avg(items.map(i => i.recentAcc))
      return {
        topic,
        label: TOPIC_LABELS[topic] || topic,
        initial_accuracy: Math.round(avgEarly * 100),
        current_accuracy: Math.round(avgRecent * 100),
        improvement: Math.round(avgDelta * 100),
        velocity_label: avgDelta > 0.3 ? '🚀 Rápido' : avgDelta > 0.1 ? '📈 Progresando' : avgDelta > -0.1 ? '➡️ Estable' : '⚠️ Regresando',
      }
    })
    .sort((a, b) => b.improvement - a.improvement)
}

// ── 5. Análisis de fatiga por sesión ─────────────────────────────────────────
export function getSessionFatigueAnalysis(uid) {
  const srsData = loadSRS(uid)
  const allHistory = Object.values(srsData)
    .flatMap(c => (c.history || []).map(h => ({ ...h, qid: c.qid })))
    .sort((a, b) => a.ts - b.ts)

  if (allHistory.length < 15) return null

  // Agrupar en sesiones (brecha > 30 min = nueva sesión)
  const sessions = []
  let currentSession = []

  for (const h of allHistory) {
    if (currentSession.length === 0 || h.ts - currentSession[currentSession.length - 1].ts < 30 * 60 * 1000) {
      currentSession.push(h)
    } else {
      if (currentSession.length >= 5) sessions.push(currentSession)
      currentSession = [h]
    }
  }
  if (currentSession.length >= 5) sessions.push(currentSession)

  if (sessions.length === 0) return null

  // Analizar accuracy por posición en sesión
  const positionAccuracy = {}
  for (const session of sessions) {
    session.forEach((h, idx) => {
      const bucket = Math.min(idx, 19)  // máx 20 posiciones
      if (!positionAccuracy[bucket]) positionAccuracy[bucket] = []
      positionAccuracy[bucket].push(h.correct ? 1 : 0)
    })
  }

  const curve = Object.entries(positionAccuracy)
    .filter(([, vals]) => vals.length >= 2)
    .map(([pos, vals]) => ({
      position: parseInt(pos) + 1,
      accuracy: Math.round(avg(vals) * 100),
    }))
    .sort((a, b) => a.position - b.position)

  // Detectar punto de fatiga (accuracy cae > 15% respecto al pico)
  const maxAcc = Math.max(...curve.map(c => c.accuracy))
  const fatiguePoint = curve.find(c => c.position > 3 && maxAcc - c.accuracy > 15)

  // Duración promedio de sesión
  const avgSessionLen = avg(sessions.map(s => s.length))
  const avgSessionMinutes = avg(sessions.map(s =>
    s.length > 1 ? (s[s.length - 1].ts - s[0].ts) / 60000 : 5
  ))

  return {
    sessions_analyzed: sessions.length,
    avg_session_length: Math.round(avgSessionLen),
    avg_session_minutes: Math.round(avgSessionMinutes),
    fatigue_point: fatiguePoint ? fatiguePoint.position : null,
    accuracy_curve: curve.slice(0, 15),
    optimal_session: fatiguePoint ? fatiguePoint.position - 1 : Math.min(12, Math.round(avgSessionLen)),
    recommendation: fatiguePoint
      ? `Tu rendimiento baja después de ${fatiguePoint.position - 1} preguntas. Haz sesiones más cortas.`
      : `Mantienes buena concentración durante ${Math.round(avgSessionLen)} preguntas. ¡Sigue así!`,
  }
}

// ── 6. Perfil cognitivo completo ──────────────────────────────────────────────
export function getCognitiveProfile(uid) {
  const store = loadStore()
  const user = store[uid]
  if (!user) return null

  const srsData = loadSRS(uid)
  const allHistory = Object.values(srsData).flatMap(c => c.history || [])
  if (allHistory.length < 10) return null

  const totalAnswers = allHistory.length
  const correctAnswers = allHistory.filter(h => h.correct).length
  const overallAccuracy = Math.round((correctAnswers / totalAnswers) * 100)

  // Calcular consistencia (stddev de accuracy en sesiones)
  const times = allHistory.map(h => h.time_ms).filter(t => t > 0 && t < 60000)
  const timeStdDev = stddev(times)
  const consistency = timeStdDev < 5000 ? 'Alta' : timeStdDev < 15000 ? 'Media' : 'Baja'

  // Calcular tendencia de aprendizaje
  const last20 = allHistory.slice(-20)
  const first20 = allHistory.slice(0, 20)
  const recentAcc = avg(last20.map(h => h.correct ? 1 : 0)) * 100
  const earlyAcc  = avg(first20.map(h => h.correct ? 1 : 0)) * 100
  const trend = recentAcc > earlyAcc + 5 ? 'improving' : recentAcc < earlyAcc - 5 ? 'declining' : 'stable'

  // Estilo cognitivo basado en patrones de tiempo
  const fastAndCorrect = allHistory.filter(h => h.time_ms < 6000 && h.correct).length
  const slowAndCorrect = allHistory.filter(h => h.time_ms > 15000 && h.correct).length
  let cognitiveStyle = 'Analítico'
  if (fastAndCorrect / totalAnswers > 0.4) cognitiveStyle = 'Intuitivo-Rápido'
  else if (slowAndCorrect / totalAnswers > 0.3) cognitiveStyle = 'Reflexivo-Profundo'
  else if (overallAccuracy > 75) cognitiveStyle = 'Metódico-Preciso'

  // Fortalezas por tema
  const topicMastery = user.mastery || {}
  const strengths = Object.entries(topicMastery)
    .filter(([, m]) => (m.mastery_score || 0) >= 0.7)
    .map(([topic]) => TOPIC_LABELS[topic] || topic)
  const weaknesses = Object.entries(topicMastery)
    .filter(([, m]) => (m.mastery_score || 0) < 0.5)
    .map(([topic]) => TOPIC_LABELS[topic] || topic)

  return {
    overall_accuracy: overallAccuracy,
    total_answered: totalAnswers,
    trend,
    trend_label: trend === 'improving' ? '📈 Mejorando' : trend === 'declining' ? '📉 Bajando' : '➡️ Estable',
    consistency,
    cognitive_style: cognitiveStyle,
    strengths,
    weaknesses,
    xp: user.xp || 0,
    level: user.level || 1,
    streak: user.streak || 0,
    adhd_score: computeADHDOptimizationScore(allHistory),
  }
}

function computeADHDOptimizationScore(history) {
  if (history.length < 10) return null
  // Score de qué tan bien está usando el sistema (regularidad, sesiones cortas, etc.)
  const recent = history.slice(-20)
  const quickResponses = recent.filter(h => h.time_ms > 2000 && h.time_ms < 15000).length
  const engagementScore = Math.round((quickResponses / recent.length) * 100)
  return engagementScore
}

// ── 7. Recomendaciones personalizadas ────────────────────────────────────────
export function generateRecommendations(uid) {
  const responseTime = analyzeResponseTime(uid)
  const velocity = getLearningVelocity(uid)
  const fatigue = getSessionFatigueAnalysis(uid)
  const profile = getCognitiveProfile(uid)
  const misconceptions = getMisconceptionMap(uid)

  const recs = []

  // Recomendación de impulsividad
  if (responseTime?.is_impulsive) {
    recs.push({
      type: 'behavior',
      icon: '⏸️',
      priority: 1,
      title: 'Responde más despacio',
      detail: `El ${responseTime.impulsive_rate}% de tus respuestas rápidas son incorrectas. Lee todas las opciones antes de elegir.`,
      action: 'Tómate al menos 5 segundos por pregunta',
    })
  }

  // Recomendación de fatiga
  if (fatigue?.fatigue_point && fatigue.fatigue_point <= 8) {
    recs.push({
      type: 'session',
      icon: '🧠',
      priority: 1,
      title: 'Sesiones más cortas',
      detail: `Tu rendimiento baja después de ${fatigue.fatigue_point - 1} preguntas. El TDAH se beneficia de sesiones de 5-8 preguntas.`,
      action: `Haz sesiones de ${Math.min(fatigue.fatigue_point - 1, 7)} preguntas máximo`,
    })
  }

  // Recomendación de temas débiles
  if (profile?.weaknesses?.length > 0) {
    recs.push({
      type: 'content',
      icon: '🎯',
      priority: 2,
      title: 'Refuerza estos temas',
      detail: `Tienes dominio bajo en: ${profile.weaknesses.slice(0, 2).join(', ')}.`,
      action: 'El sistema ya está priorizando estas preguntas en tu cola SRS',
    })
  }

  // Recomendación de rachas
  if (velocity?.length > 0) {
    const fastest = velocity[0]
    if (fastest.improvement > 20) {
      recs.push({
        type: 'motivation',
        icon: '🚀',
        priority: 3,
        title: `Avance rápido en ${fastest.label}`,
        detail: `Has mejorado ${fastest.improvement}% en este tema. ¡Sigue con las lecciones avanzadas!`,
        action: 'Pasa al siguiente nivel de este track',
      })
    }
  }

  // Recomendación de conceptos confundidos
  if (misconceptions?.length > 0) {
    const worst = misconceptions[0]
    recs.push({
      type: 'concept',
      icon: '🔍',
      priority: 2,
      title: `Concepto a revisar: ${worst.concept}`,
      detail: `${worst.error_rate}% de errores en este concepto. Es un punto ciego frecuente.`,
      action: 'Revisa la lección correspondiente o pregunta al Tutor IA',
    })
  }

  // Recomendación de racha
  const store = loadStore()
  const user = store[uid]
  if (user && user.streak === 0 && (user.quizHistory?.length || 0) > 5) {
    recs.push({
      type: 'habit',
      icon: '🔥',
      priority: 2,
      title: 'Construye tu racha',
      detail: 'La consistencia diaria es el factor #1 en el aprendizaje efectivo para TDAH.',
      action: 'Completa al menos 1 lección al día para mantener tu racha',
    })
  }

  return recs.sort((a, b) => a.priority - b.priority).slice(0, 5)
}

// ── 8. Resumen ejecutivo del usuario ─────────────────────────────────────────
export function getFullAnalytics(uid) {
  return {
    response_time:   analyzeResponseTime(uid),
    speed_curve:     getSpeedAccuracyCurve(uid),
    misconceptions:  getMisconceptionMap(uid),
    velocity:        getLearningVelocity(uid),
    fatigue:         getSessionFatigueAnalysis(uid),
    profile:         getCognitiveProfile(uid),
    recommendations: generateRecommendations(uid),
    generated_at:    new Date().toISOString(),
  }
}
