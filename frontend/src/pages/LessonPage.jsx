import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { api } from '../api.js'

// ── TTS helper ────────────────────────────────────────────────
const LETTERS = ['A', 'B', 'C', 'D']

function useTTS() {
  const [enabled, setEnabled] = useState(false)

  const speak = useCallback((text) => {
    if (!enabled || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const clean = text
      .replace(/\*\*/g, '')
      .replace(/`[^`]*`/g, '')
      .replace(/```[\s\S]*?```/g, ' (bloque de código) ')
      .replace(/#{1,6} /g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s{2,}/g, ' ')
      .trim()
    const utt = new SpeechSynthesisUtterance(clean)
    utt.lang = 'es-ES'
    utt.rate = 0.95
    window.speechSynthesis.speak(utt)
  }, [enabled])

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
  }, [])

  const toggle = useCallback(() => {
    setEnabled(v => {
      if (v && 'speechSynthesis' in window) window.speechSynthesis.cancel()
      return !v
    })
  }, [])

  return { enabled, toggle, speak, stop }
}

// ── Rich text renderer ────────────────────────────────────────
function renderBody(text) {
  if (!text) return null
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('`') && p.endsWith('`'))
      return <code key={i} className="inline-code">{p.slice(1, -1)}</code>
    return p.split('\n').map((line, j, arr) => (
      <span key={j}>{line}{j < arr.length - 1 ? <br /> : null}</span>
    ))
  })
}

// ── Progress dots ─────────────────────────────────────────────
function ProgressDots({ total, current }) {
  return (
    <div className="progress-dots">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`progress-dot${i < current ? ' done' : i === current ? ' active' : ''}`} />
      ))}
    </div>
  )
}

// ── Code block inside a section ───────────────────────────────
function CodeBody({ body }) {
  const match = body.match(/```[\w]*\n?([\s\S]*?)```/)
  const code   = match ? match[1].trim() : ''
  const before = body.split('```')[0].trim()
  const after  = body.split('```').slice(2).join('').replace(/^\w+\n/, '').trim()
  return (
    <>
      {before && <div className="ic-body mb-12">{renderBody(before)}</div>}
      {code   && <pre className="code-block">{code}</pre>}
      {after  && <div className="ic-body mt-12">{renderBody(after)}</div>}
    </>
  )
}

// ── Single interactive section card ──────────────────────────
const TYPE_CFG = {
  concept: { label: 'Concepto',   icon: '🧠', color: '#6366f1', reveal: true  },
  analogy: { label: 'Analogía',   icon: '💡', color: '#f59e0b', reveal: false },
  fact:    { label: 'Dato clave', icon: '⚡', color: '#10b981', reveal: false },
  example: { label: 'Ejemplo',    icon: '🔬', color: '#0ea5e9', reveal: false },
}

function SectionCard({ section, index, total, onContinue, ttsEnabled, speak }) {
  const [revealed,  setRevealed]  = useState(false)
  const [reaction,  setReaction]  = useState(null)
  const cfg = TYPE_CFG[section.type] || { label: section.type, icon: '📌', color: '#94a3b8', reveal: false }
  const show = !cfg.reveal || revealed

  // Auto-speak when content becomes visible
  useEffect(() => {
    if (show && ttsEnabled && speak) {
      const text = [section.title, section.body].filter(Boolean).join('. ')
      speak(text)
    }
  }, [show, ttsEnabled]) // eslint-disable-line

  function react(r) {
    setReaction(r)
    setTimeout(onContinue, 380)
  }

  // ── Fact: always visible, single tap to continue
  if (section.type === 'fact') {
    return (
      <div className="ic-card ic-fact" style={{ '--cc': cfg.color }}>
        <div className="ic-fact-icon">{cfg.icon}</div>
        <div className="ic-body">{renderBody(section.body)}</div>
        <button className="ic-continue" onClick={onContinue}>Entendido →</button>
      </div>
    )
  }

  return (
    <div className="ic-card" style={{ '--cc': cfg.color }}>
      {/* meta row */}
      <div className="ic-meta">
        <span>{cfg.icon}</span>
        <span className="ic-label" style={{ color: cfg.color }}>{cfg.label}</span>
        <span className="ic-counter">{index + 1} / {total}</span>
      </div>

      {section.title && <div className="ic-title">{section.title}</div>}

      {!show ? (
        <button className="ic-reveal" onClick={() => setRevealed(true)}>
          <span>Toca para revelar</span><span style={{ fontSize: 20 }}>👆</span>
        </button>
      ) : (
        <div className="ic-revealed">
          {section.is_code
            ? <CodeBody body={section.body} />
            : <div className="ic-body">{renderBody(section.body)}</div>}

          {!reaction ? (
            <div className="ic-reactions">
              <button className="ic-react good" onClick={() => react('good')}>👍 Lo entendí</button>
              <button className="ic-react meh"  onClick={() => react('meh')}>🤔 Sigo leyendo</button>
            </div>
          ) : (
            <div className="ic-reaction-done">
              {reaction === 'good' ? '✅ ¡Perfecto!' : '📖 Anotado, seguimos...'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Quiz (game mode) ──────────────────────────────────────────

function Quiz({ questions, onComplete, ttsEnabled, speak }) {
  const [current,  setCurrent]  = useState(0)
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)
  const [answers,  setAnswers]  = useState([])
  const [streak,   setStreak]   = useState(0)
  const [showXP,   setShowXP]   = useState(false)
  const startRef = useRef(Date.now())

  // Auto-speak question + options when question changes
  useEffect(() => {
    if (!questions.length || !ttsEnabled || !speak) return
    const q = questions[current]
    const text = q.question + '. ' +
      q.options.map((opt, i) => `${LETTERS[i]}: ${opt}`).join('. ')
    speak(text)
  }, [current, ttsEnabled]) // eslint-disable-line

  function select(idx) {
    if (answered) return
    const q       = questions[current]
    const correct = idx === q.correct
    setSelected(idx)
    setAnswered(true)
    setAnswers(prev => [...prev, {
      question_id: q.id,
      correct,
      response_time_ms: Date.now() - startRef.current,
    }])
    if (correct) { setStreak(s => s + 1); setShowXP(true); setTimeout(() => setShowXP(false), 1300) }
    else          { setStreak(0) }
  }

  function next() {
    if (current < questions.length - 1) {
      setCurrent(c => c + 1); setSelected(null); setAnswered(false); startRef.current = Date.now()
    } else {
      onComplete(answers)
    }
  }

  if (!questions.length) return (
    <div className="flex-center" style={{ padding: 32 }}>
      <button className="btn btn-primary btn-lg" onClick={() => onComplete([])}>Completar lección →</button>
    </div>
  )

  const q = questions[current]

  return (
    <div className="quiz-game">
      {/* header */}
      <div className="quiz-head">
        <span className="quiz-count">{current + 1} / {questions.length}</span>
        {streak >= 2 && <span className="quiz-streak">🔥 {streak} en racha</span>}
      </div>

      {/* bar */}
      <div className="quiz-bar">
        <div className="quiz-bar-fill" style={{ width: `${(current / questions.length) * 100}%` }} />
      </div>

      {/* floating XP */}
      {showXP && <div className="xp-float">+10 XP ⭐</div>}

      {/* question */}
      <div className="quiz-question">{q.question}</div>

      {/* options */}
      <div className="quiz-options">
        {q.options.map((opt, i) => {
          let cls = 'quiz-opt'
          if (answered) {
            if (i === q.correct)                cls += ' q-correct'
            else if (i === selected)            cls += ' q-wrong'
          }
          return (
            <button key={i} className={cls} onClick={() => select(i)} disabled={answered}>
              <span className="q-letter">{LETTERS[i]}</span>
              <span className="q-text">{opt}</span>
            </button>
          )
        })}
      </div>

      {/* explanation */}
      {answered && (
        <div className={`quiz-expl ${selected === q.correct ? 'expl-ok' : 'expl-fail'}`}>
          <span style={{ fontSize: 20 }}>{selected === q.correct ? '✅' : '❌'}</span>
          <span>{q.explanation}</span>
          <button className="btn btn-primary btn-full mt-16" onClick={next} style={{ fontSize: 16 }}>
            {current < questions.length - 1 ? 'Siguiente →' : 'Ver resultados →'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Results ───────────────────────────────────────────────────
function LessonResults({ result, lesson, navigate }) {
  const pct   = Math.round((result.score || 0) * 100)
  const emoji = pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '💪'
  const msg   = pct >= 80 ? '¡Excelente! Dominas este tema.'
              : pct >= 60 ? 'Bien hecho. Sigue practicando.'
              : 'Practica más — lo dominarás pronto.'
  const scoreColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)'

  return (
    <div className="result-screen">
      <div style={{ fontSize: 72, marginBottom: 8 }}>{emoji}</div>
      <div className="result-score" style={{ color: scoreColor }}>{pct}%</div>
      <div style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 16 }}>{msg}</div>
      <div className="xp-pop">+{result.xp_earned} XP</div>

      {result.new_achievements?.length > 0 && (
        <div className="card mt-16 mb-24" style={{ maxWidth: 360, margin: '0 auto 24px', textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: 'var(--warning)', fontWeight: 700, marginBottom: 10 }}>
            🏆 Nuevo logro desbloqueado
          </div>
          {result.new_achievements.map(a => (
            <div key={a.id} className="flex gap-12" style={{ alignItems: 'center', marginBottom: 8 }}>
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
        <button className="btn btn-ghost" onClick={() => navigate(`/lesson/${lesson.id}`)}>🔁 Repasar</button>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>Continuar →</button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────
export default function LessonPage() {
  const { id }  = useParams()
  const { userId, addToast, loadUser } = useApp()
  const navigate = useNavigate()
  const [lesson,   setLesson]   = useState(null)
  const [phase,    setPhase]    = useState('content') // content | summary | quiz | results
  const [result,   setResult]   = useState(null)
  const [secIdx,   setSecIdx]   = useState(0)
  const [startTime] = useState(Date.now())
  const topRef = useRef(null)
  const { enabled: ttsEnabled, toggle: toggleTTS, speak, stop: stopTTS } = useTTS()

  useEffect(() => { api.getLesson(id, userId).then(setLesson); window.scrollTo(0, 0) }, [id, userId])
  useEffect(() => () => stopTTS(), [stopTTS]) // cancel speech on unmount

  async function handleQuizComplete(answers) {
    const secs = Math.round((Date.now() - startTime) / 1000)
    const res  = await api.submitQuiz(userId, { lesson_id: id, answers, time_spent_seconds: secs })
    setResult(res)
    setPhase('results')
    await loadUser(userId)
    res.new_achievements?.forEach(a =>
      addToast({ type: 'achievement', icon: a.icon, title: `Logro: ${a.name}`, body: `+${a.xp} XP` })
    )
    addToast({ type: 'xp', icon: '⭐', title: `+${res.xp_earned} XP ganados`, body: lesson?.title })
  }

  function advanceSection() {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    const sections = lesson.content?.sections || []
    if (secIdx < sections.length - 1) setSecIdx(s => s + 1)
    else setPhase('summary')
  }

  if (!lesson) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )

  const sections  = lesson.content?.sections || []
  const summary   = lesson.content?.summary  || []
  const hook      = lesson.content?.hook
  const questions = lesson.quiz_questions    || []

  // overall progress 0→1
  const progress = phase === 'results' ? 1
    : phase === 'quiz'    ? 0.88
    : phase === 'summary' ? 0.72
    : ((secIdx + (hook ? 0 : 0)) / Math.max(sections.length, 1)) * 0.68

  if (phase === 'results') return <LessonResults result={result} lesson={lesson} navigate={navigate} />

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* slim top progress */}
      <div className="lesson-progress-bar">
        <div className="progress-bar" style={{ height: 4 }}>
          <div className="progress-fill" style={{
            width: `${Math.round(progress * 100)}%`,
            background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      <button className="btn btn-ghost mb-16" onClick={() => navigate(-1)} style={{ fontSize: 13 }}>
        ← Volver
      </button>

      {/* lesson title */}
      <div className="lesson-header" ref={topRef}>
        <div className="flex gap-8 mb-8" style={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="badge badge-muted">⏱ {lesson.duration_min} min</span>
          <span className="badge badge-primary">+{lesson.xp_reward} XP</span>
          <span className="badge badge-muted">{lesson.difficulty}</span>
          <button
            onClick={toggleTTS}
            title={ttsEnabled ? 'Desactivar audio' : 'Activar audio (texto a voz)'}
            style={{
              marginLeft: 'auto', background: 'none', border: `1.5px solid ${ttsEnabled ? 'var(--primary)' : 'var(--border)'}`,
              borderRadius: 8, padding: '3px 10px', fontSize: 16, cursor: 'pointer',
              color: ttsEnabled ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {ttsEnabled ? '🔊' : '🔇'}
          </button>
        </div>
        <h1 style={{ fontSize: 22, lineHeight: 1.3 }}>{lesson.title}</h1>
      </div>

      {/* ── CONTENT PHASE ── */}
      {phase === 'content' && (
        <>
          {secIdx === 0 && hook && (
            <div className="hook-card">
              <div style={{ fontSize: 24, flexShrink: 0 }}>💭</div>
              <div className="hook-text">{hook}</div>
            </div>
          )}

          <ProgressDots total={sections.length} current={secIdx} />

          <SectionCard
            key={secIdx}
            section={sections[secIdx]}
            index={secIdx}
            total={sections.length}
            onContinue={advanceSection}
            ttsEnabled={ttsEnabled}
            speak={speak}
          />
        </>
      )}

      {/* ── SUMMARY PHASE ── */}
      {phase === 'summary' && (
        <>
          {summary.length > 0 && (
            <div className="summary-card">
              <div className="summary-title">📋 Resumen rápido</div>
              {summary.map((s, i) => (
                <div key={i} className="summary-item">
                  <span className="summary-check">✓</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-32">
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>
              {questions.length > 0
                ? `${questions.length} preguntas rápidas para afianzar`
                : 'Lección completada 🎉'}
            </p>
            <button
              className="btn btn-primary btn-lg"
              style={{ fontSize: 18, padding: '14px 40px' }}
              onClick={() => questions.length > 0 ? setPhase('quiz') : handleQuizComplete([])}
            >
              {questions.length > 0 ? '🎯 Empezar Quiz' : '✅ Completar'}
            </button>
          </div>
        </>
      )}

      {/* ── QUIZ PHASE ── */}
      {phase === 'quiz' && (
        <Quiz questions={questions} onComplete={handleQuizComplete} ttsEnabled={ttsEnabled} speak={speak} />
      )}
    </div>
  )
}
