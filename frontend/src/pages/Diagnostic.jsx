import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { api } from '../api.js'
import { shuffleOptions, updateCard } from '../srs.js'

const TOPIC_LABELS = {
  foundations: 'Fundamentos IA',
  prompt_engineering: 'Prompt Engineering',
  analytics: 'Analytics Engineering',
  ml_engineering: 'ML Engineering',
  ai_architecture: 'AI Architecture',
}

const TOPIC_COLORS = {
  foundations: '#6366f1',
  prompt_engineering: '#8b5cf6',
  analytics: '#0ea5e9',
  ml_engineering: '#10b981',
  ai_architecture: '#f59e0b',
}

export default function Diagnostic() {
  const { userId, addToast, loadUser } = useApp()
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState([])
  const [startTime, setStartTime] = useState(Date.now())
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api.getDiagnostic().then(d => {
      // Shuffle options to prevent length bias
      const shuffled = d.questions.map(q => {
        const { options, correctIndex } = shuffleOptions(q.options, q.correct)
        return { ...q, options, correct: correctIndex }
      })
      setQuestions(shuffled)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    setStartTime(Date.now())
    setSelected(null)
    setAnswered(false)
  }, [current])

  function selectOption(idx) {
    if (answered) return
    const elapsed = Date.now() - startTime
    setSelected(idx)
    setAnswered(true)
    const q = questions[current]
    const correct = idx === q.correct
    // Registrar en SRS
    if (userId && q.id) updateCard(userId, q.id, correct, elapsed)
    setAnswers(prev => [...prev, {
      question_id: q.id,
      answer: idx,
      correct,
      topic: q.topic,
      concept: q.concept,
      response_time_ms: elapsed,
    }])
  }

  async function nextQuestion() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
    } else {
      await finishDiagnostic()
    }
  }

  async function finishDiagnostic() {
    setSubmitting(true)
    try {
      const res = await api.submitDiagnostic(userId, answers)
      setResults(res)
      await loadUser(userId)
    } catch (e) {
      console.error(e)
    }
    setSubmitting(false)
  }

  if (loading) return (
    <div className="diagnostic-page">
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )

  if (results) return <DiagnosticResults results={results} navigate={navigate} />

  const q = questions[current]
  const progress = ((current) / questions.length) * 100
  const color = TOPIC_COLORS[q.topic] || '#6366f1'

  // Detect code in question
  const codeMatch = q.question.match(/\n([\s\S]+)/)
  const questionText = codeMatch ? q.question.split('\n')[0] : q.question
  const codeBlock = codeMatch ? codeMatch[1] : null

  return (
    <div className="diagnostic-page">
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 640, marginBottom: 24 }}>
        <div className="flex-between mb-8">
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Diagnóstico inicial
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {current + 1} / {questions.length}
          </div>
        </div>
        <div className="progress-bar" style={{ height: 6 }}>
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${color}, ${color}aa)`
            }}
          />
        </div>
      </div>

      <div className="diagnostic-card">
        {/* Topic badge */}
        <div className="question-counter">Pregunta {current + 1}</div>
        <div className="question-topic-badge">
          <span className="badge" style={{
            background: `${color}20`,
            color: color,
            border: `1px solid ${color}40`
          }}>
            {TOPIC_LABELS[q.topic] || q.topic}
          </span>
          <span className="badge badge-muted" style={{ marginLeft: 6 }}>
            {q.difficulty}
          </span>
        </div>

        {/* Question */}
        <div className="question-text">{questionText}</div>
        {codeBlock && <pre className="question-code">{codeBlock}</pre>}

        {/* Options */}
        <div>
          {q.options.map((opt, i) => {
            let cls = 'option-btn'
            if (answered) {
              if (i === q.correct) cls += ' correct'
              else if (i === selected && i !== q.correct) cls += ' wrong'
            }
            return (
              <button
                key={i}
                className={cls}
                onClick={() => selectOption(i)}
                disabled={answered}
              >
                <span style={{ color: 'var(--text-muted)', marginRight: 10, fontSize: 12 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        {/* Explanation + Next */}
        {answered && (
          <>
            <div className="explanation-box">
              <span style={{ marginRight: 6 }}>
                {selected === q.correct ? '✅' : '❌'}
              </span>
              {q.explanation}
            </div>
            <button
              className="btn btn-primary btn-full mt-16"
              onClick={nextQuestion}
              disabled={submitting}
            >
              {submitting ? 'Analizando...' : current < questions.length - 1 ? 'Siguiente →' : 'Ver resultados →'}
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
        Este diagnóstico no puntúa — solo define tu punto de partida
      </div>
    </div>
  )
}

function DiagnosticResults({ results, navigate }) {
  const topicLabels = {
    foundations: { label: 'Fundamentos IA', icon: '🧠' },
    prompt_engineering: { label: 'Prompt Engineering', icon: '✍️' },
    analytics: { label: 'Analytics', icon: '📊' },
    ml_engineering: { label: 'ML Engineering', icon: '⚙️' },
    ai_architecture: { label: 'AI Architecture', icon: '🏛️' },
  }

  const topics = Object.entries(results.topic_results || {})
  const weakTopics = results.weak_topics || []
  const nextLesson = results.next_lesson

  return (
    <div className="diagnostic-page" style={{ justifyContent: 'flex-start', paddingTop: 48 }}>
      <div style={{ maxWidth: 640, width: '100%' }}>
        <div className="text-center mb-32">
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎯</div>
          <h1 className="gradient-text" style={{ marginBottom: 8 }}>Tu perfil inicial está listo</h1>
          <p className="text-secondary">
            Analicé tus respuestas. Aquí tienes tu mapa de conocimiento actual.
          </p>
        </div>

        {/* Topic scores */}
        <div className="card mb-16">
          <h3 className="mb-16">📊 Tu nivel por área</h3>
          <div className="flex-col gap-12">
            {topics.map(([topic, res]) => {
              const pct = Math.round(res.score * 100)
              const info = topicLabels[topic] || { label: topic, icon: '📚' }
              const color = TOPIC_COLORS[topic] || '#6366f1'
              return (
                <div key={topic}>
                  <div className="flex-between mb-4">
                    <div style={{ fontSize: 14, fontWeight: 500 }}>
                      {info.icon} {info.label}
                    </div>
                    <div style={{ fontSize: 13, color: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)' }}>
                      {pct}%
                    </div>
                  </div>
                  <div className="progress-bar" style={{ height: 8 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Personalized message */}
        <div className="card mb-16" style={{
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.25)'
        }}>
          <h3 className="mb-12">🤖 Mi análisis para ti</h3>
          {weakTopics.length > 0 ? (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Empezaré reforzando <strong>{weakTopics.map(t => topicLabels[t]?.label || t).join(' y ')}</strong> — son tus áreas con más potencial de mejora rápida.
              El sistema irá adaptando el ritmo y dificultad a cómo vayas respondiendo.
            </p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              ¡Tienes una base sólida! Iremos directamente a los conceptos más avanzados y técnicos.
            </p>
          )}
        </div>

        {/* Next lesson preview */}
        {nextLesson && (
          <div className="card mb-24" style={{
            background: 'rgba(16,185,129,0.06)',
            border: '1px solid rgba(16,185,129,0.25)'
          }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              ▶ PRIMERA LECCIÓN RECOMENDADA
            </div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{nextLesson.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              ⏱ {nextLesson.duration_min} min · +{nextLesson.xp_reward} XP
            </div>
          </div>
        )}

        <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate('/dashboard')}>
          Ver mi panel de control →
        </button>
      </div>
    </div>
  )
}
