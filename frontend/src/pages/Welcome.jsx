import React, { useState, useEffect } from 'react'
import { useApp } from '../App.jsx'

const PATHS = [
  { icon: '✍️', label: 'Prompt Engineering', color: '#8b5cf6' },
  { icon: '📊', label: 'Analytics Engineering', color: '#0ea5e9' },
  { icon: '⚙️', label: 'ML Engineering', color: '#10b981' },
  { icon: '🏛️', label: 'AI Architect', color: '#f59e0b' },
]

export default function Welcome() {
  const { login, installPrompt, handleInstall } = useApp()
  const [name, setName] = useState('')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Animación de entrada
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 50) }, [])

  async function handleStart() {
    if (!name.trim() || loading) return
    setError('')
    setLoading(true)
    try {
      await login(name.trim())
    } catch (e) {
      setError('Hubo un error. Inténtalo de nuevo.')
      setLoading(false)
    }
  }

  const steps = [
    // ── Pantalla 0: Hero ────────────────────────────────────────────
    {
      key: 'hero',
      content: (
        <div style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'none' : 'translateY(16px)', transition: 'all 0.4s ease' }}>
          {/* Hero */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 12 }}>🧠</div>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              OpenIA Academy
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
              De cero a <strong style={{ color: 'var(--text)' }}>AI Architect</strong>.<br />
              Optimizado para mentes brillantes e impacientes.
            </p>
          </div>

          {/* Rutas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {PATHS.map(p => (
              <div key={p.label} style={{
                background: `${p.color}10`,
                border: `1px solid ${p.color}30`,
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{p.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: p.color }}>{p.label}</span>
              </div>
            ))}
          </div>

          {/* Ventajas TDAH */}
          <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '14px 16px', marginBottom: 28 }}>
            <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>⚡ Diseñado para cerebros con TDAH</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                ['⏱', 'Lecciones de 7–15 min — nunca más'],
                ['🎮', 'XP, niveles y logros en cada paso'],
                ['🤖', 'Tutor IA personalizado a tu ritmo'],
                ['📱', '100% offline — sin internet necesario'],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-full" onClick={() => setStep(1)}>
            Empezar gratis →
          </button>

          {installPrompt && (
            <button
              className="btn btn-ghost btn-full"
              style={{ marginTop: 12 }}
              onClick={handleInstall}
            >
              📲 Instalar en pantalla de inicio
            </button>
          )}
        </div>
      ),
    },

    // ── Pantalla 1: Nombre ──────────────────────────────────────────
    {
      key: 'name',
      content: (
        <div style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.3s ease' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>👋</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>¿Cómo te llamas?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              El sistema personalizará <strong>todo</strong> desde el minuto 1 — ritmo, dificultad y qué estudiar.
            </p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <input
              className="input-field"
              placeholder="Tu nombre..."
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleStart()}
              autoFocus
              style={{ fontSize: 18, padding: '14px 16px' }}
            />
            {error && (
              <div style={{ color: 'var(--danger)', fontSize: 13, marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                ⚠️ {error}
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '12px 14px', marginBottom: 24, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            🧩 <strong>Después</strong> harás un diagnóstico rápido de {15} preguntas.<br />
            No puntúa — solo sirve para saber desde dónde empezamos contigo.
          </div>

          <button
            className="btn btn-primary btn-lg btn-full"
            onClick={handleStart}
            disabled={!name.trim() || loading}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                Preparando tu academia...
              </span>
            ) : `Soy ${name || 'yo'} → Empezar`}
          </button>

          <button
            className="btn btn-ghost btn-full"
            style={{ marginTop: 12 }}
            onClick={() => { setStep(0); setError(''); setName('') }}
          >
            ← Atrás
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="welcome-page">
      <div className="welcome-card" style={{ maxWidth: 420 }}>
        {steps[step].content}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

