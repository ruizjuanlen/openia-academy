import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../App.jsx'
import { api } from '../api.js'

const TRACKS_META = [
  { id: 'foundations',      icon: '🧠', color: '#6366f1', name: 'Fundamentos IA' },
  { id: 'prompt_engineering', icon: '✍️', color: '#8b5cf6', name: 'Prompt Engineering' },
  { id: 'analytics',        icon: '📊', color: '#0ea5e9', name: 'Analytics Engineering' },
  { id: 'ml_engineering',   icon: '⚙️', color: '#10b981', name: 'ML Engineering' },
  { id: 'ai_architecture',  icon: '🏛️', color: '#f59e0b', name: 'AI Architecture' },
]

export default function SkillTree() {
  const { userId } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [dash, setDash] = useState(null)
  const [selectedTrack, setSelectedTrack] = useState(params.get('track') || 'foundations')
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userId) api.getDashboard(userId).then(setDash)
  }, [userId])

  useEffect(() => {
    setLoading(true)
    api.getTrackLessons(selectedTrack, userId).then(d => {
      setLessons(d.lessons || [])
      setLoading(false)
    })
  }, [selectedTrack, userId])

  const trackMeta = TRACKS_META.find(t => t.id === selectedTrack)
  const color = trackMeta?.color || '#6366f1'

  const completedMap = {}
  if (dash) {
    dash.tracks?.forEach(t => {
      if (t.id === selectedTrack) {
        // lessons completed are in progress data
      }
    })
  }

  return (
    <div>
      <h1 className="mb-8">🗺️ Mapa de Rutas</h1>
      <p className="text-secondary mb-24">Explora cada track y elige qué estudiar a continuación.</p>

      {/* Track selector */}
      <div className="flex gap-8 mb-24" style={{ flexWrap: 'wrap' }}>
        {TRACKS_META.map(t => {
          const isActive = t.id === selectedTrack
          const trackData = dash?.tracks?.find(td => td.id === t.id)
          return (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              className="btn"
              style={{
                background: isActive ? `${t.color}20` : 'var(--card)',
                border: `1px solid ${isActive ? t.color : 'var(--border)'}`,
                color: isActive ? t.color : 'var(--text-secondary)',
                fontSize: 13,
              }}
            >
              {t.icon} {t.name}
              {trackData && trackData.progress_pct > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.8 }}>
                  {trackData.progress_pct}%
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Track info */}
      {dash?.tracks && (() => {
        const td = dash.tracks.find(t => t.id === selectedTrack)
        if (!td) return null
        return (
          <div className="card mb-24" style={{ background: `${color}08`, border: `1px solid ${color}30` }}>
            <div className="flex-between">
              <div>
                <h2 style={{ color }}>{td.icon} {td.name}</h2>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{td.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color }}>{td.progress_pct}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {td.lessons_completed}/{td.lessons_total} lecciones
                </div>
              </div>
            </div>
            <div className="progress-bar mt-12" style={{ height: 6 }}>
              <div className="progress-fill" style={{ width: `${td.progress_pct}%`, background: color }} />
            </div>
          </div>
        )
      })()}

      {/* Lessons list */}
      {loading ? (
        <div className="flex-center" style={{ height: 200 }}>
          <div className="loading-dots"><span /><span /><span /></div>
        </div>
      ) : (
        <div className="skill-tree-wrapper">
          {lessons.map((lesson, i) => {
            const done = lesson.completed
            const score = lesson.score || 0

            return (
              <div
                key={lesson.id}
                className={`lesson-node ${done ? 'completed' : ''}`}
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              >
                {/* Number dot */}
                <div
                  className="lesson-node-dot"
                  style={{
                    background: done ? 'rgba(16,185,129,0.2)' : `${color}20`,
                    border: `2px solid ${done ? 'var(--success)' : color}`,
                    color: done ? 'var(--success)' : color,
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 3 }}>{lesson.title}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ {lesson.duration_min} min</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>+{lesson.xp_reward} XP</span>
                    <span className="badge badge-muted">{lesson.difficulty}</span>
                    {done && score > 0 && (
                      <span className="badge badge-success">{Math.round(score * 100)}% quiz</span>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: 'var(--text-muted)', fontSize: 18 }}>›</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
