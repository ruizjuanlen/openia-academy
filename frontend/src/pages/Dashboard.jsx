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

export default function Dashboard() {
  const { userId, user } = useApp()
  const navigate = useNavigate()
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div>
      {/* Greeting */}
      <div className="flex-between mb-24">
        <div>
          <h1>Hola, {user?.name} 👋</h1>
          <p className="text-secondary mt-4">
            {user?.lessons_completed === 0
              ? 'Tu aventura en IA comienza ahora.'
              : `${user?.lessons_completed} lección${user?.lessons_completed !== 1 ? 'es' : ''} completada${user?.lessons_completed !== 1 ? 's' : ''}. Sigue así.`}
          </p>
        </div>
        {user?.streak > 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32 }}>🔥</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--warning)' }}>{user.streak}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>días</div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid-3 mb-24">
        <div className="stat-card">
          <div className="stat-number gradient-text">{user?.xp?.toLocaleString()}</div>
          <div className="stat-label">XP total</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--success)' }}>
            {user?.lessons_completed}
          </div>
          <div className="stat-label">Lecciones completadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: 'var(--secondary)' }}>
            Nv. {user?.level}
          </div>
          <div className="stat-label">Nivel actual</div>
        </div>
      </div>

      {/* Next lesson CTA */}
      {next_lesson && (
        <div className="next-lesson-card mb-24">
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', marginBottom: 10 }}>
            ▶ CONTINUAR AQUÍ
          </div>
          <div className="flex-between">
            <div>
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>{next_lesson.title}</h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                ⏱ {next_lesson.duration_min} min · +{next_lesson.xp_reward} XP
                <span className="badge badge-primary" style={{ marginLeft: 8 }}>
                  {next_lesson.difficulty}
                </span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/lesson/${next_lesson.id}`)}
              style={{ flexShrink: 0, marginLeft: 16 }}
            >
              Empezar →
            </button>
          </div>
        </div>
      )}

      {/* Insights */}
      {insights?.weakest_topics?.length > 0 && (
        <div className="card mb-24" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <h3 className="mb-12">🔍 Áreas a reforzar</h3>
          <div className="flex-col gap-8">
            {insights.weakest_topics.map(t => (
              <div key={t.topic} className="flex-between" style={{ fontSize: 14 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.label}</span>
                <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{t.score}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tracks */}
      <h2 className="mb-16">Rutas de aprendizaje</h2>
      <div className="grid-2 mb-24">
        {(tracks || []).map(track => {
          const color = TRACK_COLORS[track.id] || '#6366f1'
          return (
            <div
              key={track.id}
              className="track-card"
              onClick={() => navigate(`/skill-tree?track=${track.id}`)}
              style={{ borderColor: track.progress_pct > 0 ? `${color}50` : undefined }}
            >
              <div className="track-icon">{track.icon}</div>
              <div className="track-name">{track.name}</div>
              <div className="track-desc">{track.description}</div>
              <div className="flex-between mb-8">
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {track.lessons_completed}/{track.lessons_total} lecciones
                </div>
                <div style={{ fontSize: 12, color, fontWeight: 600 }}>
                  {track.progress_pct}%
                </div>
              </div>
              <div className="progress-bar" style={{ height: 5 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${track.progress_pct}%`, background: color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Achievements */}
      {(unlockedAchs.length > 0 || lockedAchs.length > 0) && (
        <>
          <h2 className="mb-16">🏆 Logros</h2>
          <div className="grid-3 mb-24">
            {[...unlockedAchs, ...lockedAchs.slice(0, 6 - unlockedAchs.length)].map(ach => (
              <div key={ach.id} className={`achievement-item ${!ach.unlocked ? 'achievement-locked' : ''}`}>
                <div className="achievement-icon">{ach.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{ach.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {ach.unlocked ? `+${ach.xp} XP` : 'Por desbloquear'}
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
