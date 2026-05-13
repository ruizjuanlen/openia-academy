import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { api } from '../api.js'

const TRACK_COLORS = {
  foundations: '#6366f1',
  prompt_engineering: '#8b5cf6',
  analytics: '#0ea5e9',
  ml_engineering: '#10b981',
  ai_architecture: '#f59e0b',
}

const MOTIVATIONAL = [
  '🧠 Los genios no nacen, se hacen — lección a lección.',
  '⚡ 15 minutos hoy = ventaja de años mañana.',
  '🚀 El mejor momento para aprender IA fue hace 5 años. El segundo mejor: ahora.',
  '🎯 Cada quiz que completas entrena tu cerebro igual que la IA entrena sus modelos.',
  '💎 El conocimiento que ganas hoy nadie te lo puede quitar.',
  '🔥 Los que dominan la IA en 2025 son los que practicaron en 2024.',
  '⭐ Tu cerebro con TDAH tiene superpoderes para conectar ideas — úsalos.',
  '🏆 De cero a AI Architect es exactamente el camino que estás recorriendo.',
]

export default function Dashboard() {
  const { userId, user } = useApp()
  const navigate = useNavigate()
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quote] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)])

  useEffect(() => {
    if (!userId) return
    api.getDashboard(userId).then(d => {
      setDash(d)
      setLoading(false)
    })
  }, [userId])

  if (loading || !dash) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )

  const { tracks, next_lesson, insights, achievements } = dash
  const unlockedAchs = achievements?.filter(a => a.unlocked) || []
  const lockedAchs   = achievements?.filter(a => !a.unlocked) || []
  const totalLessons = dash.total_lessons || 0
  const completedPct = totalLessons ? Math.round((user?.lessons_completed / totalLessons) * 100) : 0

  return (
    <div>
      {/* Greeting + streak */}
      <div className="flex-between mb-20">
        <div>
          <h1 style={{ fontSize: 22, marginBottom: 2 }}>Hola, {user?.name} 👋</h1>
          <p className="text-secondary" style={{ fontSize: 13 }}>
            {user?.lessons_completed === 0
              ? 'Tu aventura en IA comienza ahora.'
              : `${user?.lessons_completed} lección${user?.lessons_completed !== 1 ? 'es' : ''} completada${user?.lessons_completed !== 1 ? 's' : ''} · Nivel ${user?.level}`}
          </p>
        </div>
        {user?.streak > 0 && (
          <div style={{ textAlign: 'center', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '8px 14px' }}>
            <div style={{ fontSize: 24 }}>🔥</div>
            <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--warning)', lineHeight: 1 }}>{user.streak}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>días</div>
          </div>
        )}
      </div>

      {/* XP progress bar */}
      <div className="card mb-20" style={{ padding: '14px 16px' }}>
        <div className="flex-between mb-6">
          <span style={{ fontSize: 13, fontWeight: 600 }}>Nivel {user?.level}</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {user?.xp?.toLocaleString()} / {user?.next_level_xp?.toLocaleString()} XP
          </span>
        </div>
        <div className="progress-bar" style={{ height: 8, borderRadius: 8 }}>
          <div
            className="progress-fill"
            style={{
              width: `${Math.round((user?.level_progress || 0) * 100)}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
              borderRadius: 8,
              transition: 'width 1s ease',
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
          {user?.current_level_xp?.toLocaleString()} XP para nivel {user?.level} · {user?.next_level_xp?.toLocaleString()} XP para nivel {(user?.level || 0) + 1}
        </div>
      </div>

      {/* Stats 4-grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { value: user?.xp?.toLocaleString(), label: 'XP total', icon: '💎', color: '#6366f1' },
          { value: `${user?.lessons_completed}/${totalLessons}`, label: 'Lecciones', icon: '📚', color: '#10b981' },
          { value: `${completedPct}%`, label: 'Completado', icon: '🏆', color: '#f59e0b' },
          { value: `Nv.${user?.level}`, label: 'Nivel', icon: '⭐', color: '#8b5cf6' },
        ].map(({ value, label, icon, color }) => (
          <div key={label} className="stat-card" style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
            <div className="stat-number" style={{ color, fontSize: 20 }}>{value}</div>
            <div className="stat-label" style={{ fontSize: 11 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Next lesson CTA */}
      {next_lesson && (
        <div className="next-lesson-card mb-20">
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', marginBottom: 10, fontWeight: 700 }}>
            ▶ CONTINUAR AQUÍ
          </div>
          <div className="flex-between">
            <div style={{ flex: 1, marginRight: 12 }}>
              <h2 style={{ fontSize: 16, marginBottom: 6, lineHeight: 1.4 }}>{next_lesson.title}</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {next_lesson.duration_min} min</span>
                <span style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>+{next_lesson.xp_reward} XP</span>
                <span className="badge badge-primary">{next_lesson.difficulty}</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/lesson/${next_lesson.id}`)}
              style={{ flexShrink: 0, padding: '10px 18px', fontWeight: 700 }}
            >
              Ir →
            </button>
          </div>
        </div>
      )}

      {/* Quote del día */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 14,
        padding: '14px 16px',
        marginBottom: 20,
        fontSize: 13,
        color: 'var(--text-secondary)',
        fontStyle: 'italic',
        lineHeight: 1.6,
      }}>
        {quote}
      </div>

      {/* Insights */}
      {insights?.weakest_topics?.length > 0 && (
        <div className="card mb-20" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <h3 className="mb-12" style={{ fontSize: 15 }}>🔍 Áreas a reforzar</h3>
          <div className="flex-col gap-8">
            {insights.weakest_topics.map(t => (
              <div key={t.topic} className="flex-between" style={{ fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.label}</span>
                <span style={{ color: t.score < 40 ? 'var(--danger)' : 'var(--warning)', fontWeight: 700 }}>{t.score}%</span>
              </div>
            ))}
          </div>
          {insights.trend === 'mejorando' && (
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
              📈 Tendencia: mejorando
            </div>
          )}
        </div>
      )}

      {/* Tracks grid */}
      <h2 className="mb-14" style={{ fontSize: 17 }}>Rutas de aprendizaje</h2>
      <div className="grid-2 mb-20">
        {(tracks || []).map(track => {
          const color = TRACK_COLORS[track.id] || '#6366f1'
          const isStarted = track.lessons_completed > 0
          const isDone = track.progress_pct === 100
          return (
            <div
              key={track.id}
              className="track-card"
              onClick={() => navigate(`/skill-tree?track=${track.id}`)}
              style={{
                borderColor: isStarted ? `${color}50` : undefined,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {isDone && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'var(--success)', borderRadius: 6,
                  padding: '2px 6px', fontSize: 10, color: '#fff', fontWeight: 700,
                }}>
                  ✓ COMPLETADO
                </div>
              )}
              <div className="track-icon" style={{ fontSize: 28 }}>{track.icon}</div>
              <div className="track-name" style={{ fontSize: 14 }}>{track.name}</div>
              <div className="track-desc" style={{ fontSize: 12 }}>{track.description}</div>
              <div className="flex-between mb-6" style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {track.lessons_completed}/{track.lessons_total}
                </div>
                <div style={{ fontSize: 11, color, fontWeight: 700 }}>{track.progress_pct}%</div>
              </div>
              <div className="progress-bar" style={{ height: 4 }}>
                <div className="progress-fill" style={{ width: `${track.progress_pct}%`, background: color }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Achievements */}
      {(unlockedAchs.length > 0 || lockedAchs.length > 0) && (
        <>
          <div className="flex-between mb-14">
            <h2 style={{ fontSize: 17 }}>🏆 Logros</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {unlockedAchs.length}/{achievements?.length || 0} desbloqueados
            </span>
          </div>
          <div className="grid-3 mb-24">
            {[...unlockedAchs, ...lockedAchs.slice(0, Math.max(0, 9 - unlockedAchs.length))].map(ach => (
              <div key={ach.id} className={`achievement-item ${!ach.unlocked ? 'achievement-locked' : ''}`}>
                <div className="achievement-icon" style={{ fontSize: 22 }}>{ach.unlocked ? ach.icon : '🔒'}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, lineHeight: 1.3 }}>{ach.name}</div>
                  <div style={{ fontSize: 10, color: ach.unlocked ? 'var(--success)' : 'var(--text-muted)', marginTop: 2 }}>
                    {ach.unlocked ? `+${ach.xp} XP ✓` : `+${ach.xp} XP`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
