import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { api } from '../api.js'

// ── Section renderer ─────────────────────────────────────────
function renderBody(text) {
  if (!text) return null
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|\`[^`]+\`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`')) return (
      <code key={i} style={{ background: 'rgba(99,102,241,0.15)', padding: '1px 6px', borderRadius: 4, fontSize: '0.9em', fontFamily: 'JetBrains Mono, monospace' }}>{p.slice(1, -1)}</code>
    )
    // Line breaks
    return p.split('\n').map((line, j) => (
      <span key={j}>{line}{j < p.split('\n').length - 1 ? <br /> : null}</span>
    ))
  })
}

function Section({ section }) {
  const typeLabels = {
    concept: { label: 'Concepto', color: '#6366f1' },
    analogy: { label: '💡 Analogía', color: '#f59e0b' },
    fact: { label: '⚡ Dato clave', color: '#10b981' },
    example: { label: '🔬 Ejemplo', color: '#0ea5e9' },
  }

  const meta = typeLabels[section.type] || { label: section.type, color: '#94a3b8' }

  if (section.type === 'fact') {
    return (
      <div className="fact-box">
        {renderBody(section.body)}
      </div>
    )
  }

  if (section.type === 'analogy') {
    return (
      <div className="section-card">
        <div className="section-type-label" style={{ color: meta.color }}>
          {meta.label}
        </div>
        {section.title && <div className="section-title">{section.title}</div>}
        <div className="section-body">{renderBody(section.body)}</div>
      </div>
    )
  }

  if (section.is_code) {
    const lines = (section.body || '').split('\n')
    const code = lines.filter(l => l.trim().startsWith('```') === false)
    const codeContent = code.join('\n').replace(/^```\w*\n?/, '').replace(/```$/, '')
    const text = section.body.split('```')[0]
    const afterCode = section.body.split('```').slice(2).join('').replace(/^\w*\n/, '')

    return (
      <div className="section-card">
        <div className="section-type-label" style={{ color: meta.color }}>{meta.label}</div>
        {section.title && <div className="section-title">{section.title}</div>}
        {text && <div className="section-body mb-12">{renderBody(text)}</div>}
        <pre className="code-block">{codeContent.trim()}</pre>
        {afterCode && <div className="section-body mt-12">{renderBody(afterCode.trim())}</div>}
      </div>
    )
  }

  return (
    <div className="section-card">
      <div className="section-type-label" style={{ color: meta.color }}>{meta.label}</div>
      {section.title && <div className="section-title">{section.title}</div>}
      <div className="section-body">{renderBody(section.body)}</div>
    </div>
  )
}

// ── Quiz ─────────────────────────────────────────────────────
function Quiz({ questions, onComplete }) {
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState([])
  const startRef = useRef(Date.now())

  function select(idx) {
    if (answered) return
    const elapsed = Date.now() - startRef.current
    const q = questions[current]
    setSelected(idx)
    setAnswered(true)
    setAnswers(prev => [...prev, {
      question_id: q.id,
      correct: idx === q.correct,
      response_time_ms: elapsed,
    }])
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1)
      setSelected(null)
      setAnswered(false)
      startRef.current = Date.now()
    } else {
      onComplete(answers)
    }
  }

  if (!questions.length) return (
    <div style={{ textAlign: 'center', padding: 24 }}>
      <button className="btn btn-primary btn-lg" onClick={() => onComplete([])}>
        Completar lección →
      </button>
    </div>
  )

  const q = questions[current]

  return (
    <div className="section-card">
      <div style={{ fontSize: 11, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        Quiz • {current + 1}/{questions.length}
      </div>
      <div className="question-text" style={{ fontSize: 16, marginBottom: 20 }}>{q.question}</div>

      {q.options.map((opt, i) => {
        let cls = 'option-btn'
        if (answered) {
          if (i === q.correct) cls += ' correct'
          else if (i === selected && i !== q.correct) cls += ' wrong'
        }
        return (
          <button key={i} className={cls} onClick={() => select(i)} disabled={answered}>
            <span style={{ color: 'var(--text-muted)', marginRight: 10, fontSize: 12 }}>
              {String.fromCharCode(65 + i)}.
            </span>
            {opt}
          </button>
        )
      })}

      {answered && (
        <>
          <div className="explanation-box">
            {selected === q.correct ? '✅ ' : '❌ '}{q.explanation}
          </div>
          <button className="btn btn-primary btn-full mt-16" onClick={next}>
            {current < questions.length - 1 ? 'Siguiente pregunta →' : 'Ver resultados →'}
          </button>
        </>
      )}
    </div>
  )
}

// ── Results Screen ────────────────────────────────────────────
function LessonResults({ result, lesson, navigate, userId }) {
  const pct = Math.round((result.score || 0) * 100)
  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'
  const msg = pct >= 80
    ? '¡Excelente trabajo!'
    : pct >= 60
    ? 'Bien hecho. Sigue practicando.'
    : 'Practica más este tema — lo dominarás.'

  return (
    <div className="result-screen">
      <div style={{ fontSize: 64 }}>{emoji}</div>
      <div
        className="result-score"
        style={{ color: pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)' }}
      >
        {pct}%
      </div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 16 }}>{msg}</div>
      <div className="xp-pop">+{result.xp_earned} XP</div>

      {result.new_achievements?.length > 0 && (
        <div className="card mt-16 mb-24" style={{ maxWidth: 360, margin: '0 auto 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 700, marginBottom: 10 }}>
            🏆 Nuevo logro desbloqueado
          </div>
          {result.new_achievements.map(a => (
            <div key={a.id} className="flex gap-12" style={{ alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>+{a.xp} XP</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex-center gap-12 mt-24">
        <button className="btn btn-ghost" onClick={() => navigate(`/lesson/${lesson.id}`)}>
          🔁 Repasar
        </button>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
          Continuar →
        </button>
      </div>
    </div>
  )
}

// ── Main Lesson Page ──────────────────────────────────────────
export default function LessonPage() {
  const { id } = useParams()
  const { userId, addToast, loadUser } = useApp()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [phase, setPhase] = useState('content') // content | quiz | results
  const [result, setResult] = useState(null)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    api.getLesson(id, userId).then(setLesson)
    window.scrollTo(0, 0)
  }, [id, userId])

  async function handleQuizComplete(answers) {
    const secs = Math.round((Date.now() - startTime) / 1000)
    const res = await api.submitQuiz(userId, {
      lesson_id: id,
      answers,
      time_spent_seconds: secs,
    })
    setResult(res)
    setPhase('results')
    await loadUser(userId)

    res.new_achievements?.forEach(a => {
      addToast({ type: 'achievement', icon: a.icon, title: `Logro: ${a.name}`, body: `+${a.xp} XP` })
    })
    addToast({ type: 'xp', icon: '⭐', title: `+${res.xp_earned} XP ganados`, body: lesson?.title })
  }

  if (!lesson) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )

  const sections = lesson.content?.sections || []
  const summary = lesson.content?.summary || []
  const hook = lesson.content?.hook
  const questions = lesson.quiz_questions || []

  if (phase === 'results') {
    return <LessonResults result={result} lesson={lesson} navigate={navigate} userId={userId} />
  }

  return (
    <div>
      {/* Lesson header */}
      <div className="lesson-progress-bar">
        <div className="progress-bar" style={{ height: 4 }}>
          <div
            className="progress-fill"
            style={{
              width: phase === 'content' ? '50%' : '90%',
              background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
            }}
          />
        </div>
      </div>

      {/* Back */}
      <button className="btn btn-ghost mb-16" onClick={() => navigate(-1)} style={{ fontSize: 13 }}>
        ← Volver
      </button>

      {/* Title area */}
      <div className="lesson-header">
        <div className="flex gap-8 mb-8" style={{ flexWrap: 'wrap' }}>
          <span className="badge badge-muted">⏱ {lesson.duration_min} min</span>
          <span className="badge badge-primary">+{lesson.xp_reward} XP</span>
          <span className="badge badge-muted">{lesson.difficulty}</span>
        </div>
        <h1 style={{ fontSize: 24, lineHeight: 1.3 }}>{lesson.title}</h1>
      </div>

      {phase === 'content' && (
        <>
          {/* Hook */}
          {hook && (
            <div className="card mb-20" style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.06))',
              border: '1px solid rgba(99,102,241,0.25)',
              fontSize: 16,
              fontStyle: 'italic',
              lineHeight: 1.7,
              color: 'var(--text-secondary)'
            }}>
              💭 {hook}
            </div>
          )}

          {/* Sections */}
          {sections.map((sec, i) => <Section key={i} section={sec} />)}

          {/* Summary */}
          {summary.length > 0 && (
            <div className="section-card" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="section-type-label" style={{ color: 'var(--success)' }}>Resumen</div>
              <ul className="summary-list">
                {summary.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}

          {/* Start quiz */}
          <div className="text-center mt-32 mb-32">
            <p className="text-muted mb-16" style={{ fontSize: 14 }}>
              {questions.length > 0
                ? `${questions.length} preguntas para consolidar lo aprendido`
                : 'Sin quiz para esta lección'}
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => questions.length > 0 ? setPhase('quiz') : handleQuizComplete([])}
            >
              {questions.length > 0 ? 'Empezar Quiz →' : 'Completar lección →'}
            </button>
          </div>
        </>
      )}

      {phase === 'quiz' && (
        <>
          <div className="card mb-20" style={{ background: 'rgba(99,102,241,0.06)', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Demuestra lo que has aprendido. Cada respuesta, correcta o no, mejora tu perfil.
            </div>
          </div>
          <Quiz questions={questions} onComplete={handleQuizComplete} />
        </>
      )}
    </div>
  )
}
