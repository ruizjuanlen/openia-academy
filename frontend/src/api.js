const BASE = (import.meta.env.VITE_API_URL || '') + '/api'

async function req(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}${path}`, opts)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const api = {
  createUser:        (name)             => req('POST', '/users', { name, adhd_mode: true }),
  getUser:           (uid)              => req('GET', `/users/${uid}`),
  getDashboard:      (uid)              => req('GET', `/users/${uid}/dashboard`),
  getDiagnostic:     ()                 => req('GET', '/diagnostic'),
  submitDiagnostic:  (uid, answers)     => req('POST', `/users/${uid}/diagnostic`, { answers }),
  submitQuiz:        (uid, data)        => req('POST', `/users/${uid}/quiz`, data),
  getLesson:         (id, uid)          => req('GET', `/lessons/${id}${uid ? `?user_id=${uid}` : ''}`),
  getTrackLessons:   (trackId, uid)     => req('GET', `/tracks/${trackId}/lessons${uid ? `?user_id=${uid}` : ''}`),
  getNextLesson:     (uid)              => req('GET', `/users/${uid}/next-lesson`),
  askTutor:          (uid, msg, lesId)  => req('POST', '/tutor', { user_id: uid, message: msg, context_lesson_id: lesId }),
  explainConcept:    (concept, uid)     => req('POST', '/explain', { concept, user_id: uid }),
  getCurriculum:     ()                 => req('GET', '/curriculum'),
  getInsights:       (uid)              => req('GET', `/users/${uid}/insights`),
}
