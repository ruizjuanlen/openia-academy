import React, { useState } from 'react'
import { useApp } from '../App.jsx'

export default function Welcome() {
  const { login, installPrompt, handleInstall } = useApp()
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    if (!name.trim()) return
    setLoading(true)
    try {
      await login(name.trim())
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      emoji: '🧠',
      title: 'Tu academia de IA personalizada',
      subtitle: 'De cero a AI Architect. Con una titulación real al final.',
      content: (
        <div className="flex-col gap-16 mt-24">
          <div className="card-sm" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>🎯 ¿Qué aprenderás?</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Prompt Engineering · Analytics Engineering · Machine Learning · AI Architecture
            </div>
          </div>
          <div className="card-sm" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>⚡ Diseñado para TDAH</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Lecciones de 7-15 min · Gamificación · Sistema adaptativo que te conoce
            </div>
          </div>
          <div className="card-sm" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>🤖 IA como tu tutor personal</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Pregunta lo que sea, cuando sea. El sistema aprende de ti y se adapta.
            </div>
          </div>
          <button className="btn btn-primary btn-lg btn-full" onClick={() => setStep(1)}>
            Empezar ahora →
          </button>
        </div>
      ),
    },
    {
      emoji: '👋',
      title: '¿Cómo te llamas?',
      subtitle: 'El sistema personalizará todo a ti desde el minuto 1.',
      content: (
        <div className="flex-col gap-16 mt-24">
          <div>
            <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, display: 'block' }}>
              Tu nombre
            </label>
            <input
              className="input-field"
              placeholder="Escribe tu nombre..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleStart()}
              autoFocus
            />
          </div>

          <div className="card-sm" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              🧩 <strong>Después registrarte</strong>, harás un diagnóstico rápido de 15 preguntas.<br />
              No puntúa. Solo sirve para que el sistema sepa dónde empezar contigo.
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleStart}
            disabled={!name.trim() || loading}
          >
            {loading ? '...' : `Soy ${name || 'yo'} →`}
          </button>
          <button className="btn btn-ghost" onClick={() => setStep(0)}>← Atrás</button>
        </div>
      ),
    },
  ]

  const s = steps[step]

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <span className="welcome-emoji">{s.emoji}</span>
        <h1 style={{ textAlign: 'center', fontSize: 26, marginBottom: 8 }}>{s.title}</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 15 }}>{s.subtitle}</p>
        {s.content}
      </div>

      {installPrompt && (
        <button className="pwa-banner" onClick={handleInstall}>
          <img src="/icon-72.png" alt="icon" width={36} height={36} style={{ borderRadius: 8 }} />
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Instalar OpenIA Academy</div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Añadir a la pantalla de inicio</div>
          </div>
          <span style={{ fontSize: 20 }}>📲</span>
        </button>
      )}
    </div>
  )
}
