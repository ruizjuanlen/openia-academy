/**
 * api.js — Offline-first: todas las operaciones usan el store local (localStorage).
 * El Tutor IA intenta el backend si VITE_API_URL está definido; si no, usa fallback local.
 */
import * as store from './store.js'

const BACKEND = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : null

async function backendReq(method, path, body) {
  if (!BACKEND) throw new Error('no_backend')
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BACKEND}${path}`, opts)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

// Wraps a sync store call as a resolved promise
const local = fn => (...args) => Promise.resolve(fn(...args))

export const api = {
  createUser:      local(store.createUser),
  getUser:         local(store.getUserStats),
  getDashboard:    local(store.getDashboard),
  getDiagnostic:   local(store.getDiagnostic),
  submitDiagnostic:(uid, answers) => Promise.resolve(store.submitDiagnostic(uid, answers)),
  getLesson:       (id, uid) => Promise.resolve(store.getLesson(id, uid)),
  getTrackLessons: (trackId, uid) => Promise.resolve(store.getTrackLessons(trackId, uid)),
  getNextLesson:   uid => Promise.resolve({ lesson: store.getNextLesson(uid) }),
  getInsights:     local(store.getPerformanceInsights),
  getCurriculum:   () => Promise.resolve({ tracks: store.TRACKS, lessons_count: store.LESSONS.length }),

  submitQuiz: (uid, { lesson_id, answers, time_spent_seconds }) =>
    Promise.resolve(store.submitQuiz(uid, lesson_id, answers, time_spent_seconds ?? 0)),

  askTutor: async (uid, message, context_lesson_id) => {
    try {
      return await backendReq('POST', '/tutor', { user_id: uid, message, context_lesson_id })
    } catch {
      return {
        reply: buildOfflineTutorReply(message, uid),
        user_id: uid,
        offline: true,
      }
    }
  },

  explainConcept: async (concept, uid) => {
    try {
      return await backendReq('POST', '/explain', { concept, user_id: uid })
    } catch {
      return { explanation: buildOfflineExplanation(concept), concept, offline: true }
    }
  },
}

// ── Respuestas offline para el tutor ────────────────────────────────────────
function buildOfflineTutorReply(message, uid) {
  const stats = store.getUserStats(uid)
  const name = stats?.user?.name || 'estudiante'
  const msg = message.toLowerCase()

  if (msg.includes('qué es') || msg.includes('que es') || msg.includes('explica') || msg.includes('define')) {
    return `👋 Hola ${name}! El tutor IA necesita conexión a internet para responder con IA real.\n\n**Mientras tanto**, revisa el contenido de la lección actual — encontrarás la explicación de ese concepto en los bloques de contenido.\n\n💡 **Tip**: conecta internet y vuelve a preguntar para obtener una respuesta personalizada de Claude AI.`
  }
  if (msg.includes('ayuda') || msg.includes('no entiendo') || msg.includes('dificil')) {
    return `🤗 ${name}, es normal que algo cueste al principio.\n\n**Prueba esto:**\n• Lee de nuevo la sección "Analogía" de la lección — siempre es la más clara\n• Completa el quiz aunque no estés seguro/a — los errores enseñan más que los aciertos\n• Marca los conceptos que no entiendas para revisarlos después\n\n🔌 Con internet activo, podré darte una explicación personalizada con ejemplos de tu nivel.`
  }
  return `🤖 Hola ${name}! Soy tu tutor IA.\n\n⚠️ Necesito conexión a internet para responder con inteligencia artificial real.\n\n**Sin conexión puedes:**\n• Continuar todas las lecciones normalmente\n• Ver el contenido y hacer quizzes\n• Ganar XP y desbloquear logros\n\nVuelve a preguntar cuando tengas WiFi o datos. 📡`
}

function buildOfflineExplanation(concept) {
  return `📖 **${concept}**\n\nEste concepto está explicado en detalle dentro de la lección. Busca la sección correspondiente en el contenido de la lección actual.\n\n🔌 Conecta a internet para obtener una explicación personalizada generada por IA.`
}
