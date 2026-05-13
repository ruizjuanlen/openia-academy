import React, { useState, useEffect } from 'react'
import { useApp } from '../App.jsx'
import { getFullAnalytics } from '../analytics_engine.js'
import { getSRSStats } from '../srs.js'
import { QUESTION_BANK } from '../data/questions_bank.js'

const TRACK_COLORS = {
  foundations: '#6366f1', prompt_engineering: '#8b5cf6',
  analytics: '#0ea5e9', ml_engineering: '#10b981', ai_architecture: '#f59e0b',
}

function Card({ children, style = {}, className = '' }) {
  return (
    <div className={`card ${className}`} style={{ marginBottom: 14, ...style }}>
      {children}
    </div>
  )
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{icon}</span>{title}
      </h2>
      {sub && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</p>}
    </div>
  )
}

function MiniBar({ value, max = 100, color = '#6366f1', label, subLabel }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{subLabel || `${value}%`}</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 6, height: 7 }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: 6, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function StatPill({ value, label, color = '#6366f1', icon }) {
  return (
    <div style={{
      background: `${color}12`, border: `1px solid ${color}30`,
      borderRadius: 12, padding: '10px 14px', textAlign: 'center', flex: 1,
    }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  )
}

export default function Analytics() {
  const { userId } = useApp()
  const [data, setData] = useState(null)
  const [srsStats, setSrsStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    if (!userId) return
    const analytics = getFullAnalytics(userId)
    const stats = getSRSStats(userId, QUESTION_BANK)
    setData(analytics)
    setSrsStats(stats)
    setLoading(false)
  }, [userId])

  if (loading) return (
    <div className="flex-center" style={{ height: '60vh' }}>
      <div className="loading-dots"><span /><span /><span /></div>
    </div>
  )

  const hasData = data?.profile && data.profile.total_answered >= 5
  if (!hasData) return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
      <h2 style={{ marginBottom: 8 }}>Todavía no hay suficientes datos</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
        Completa al menos <strong>5 preguntas</strong> para ver tu análisis profundo.<br />
        El sistema necesita observar tus patrones antes de poder guiarte.
      </p>
    </div>
  )

  const { profile, response_time, speed_curve, misconceptions, velocity, fatigue, recommendations } = data

  const TABS = [
    { id: 'overview', label: '📊 Resumen' },
    { id: 'behavior', label: '🧠 Conducta' },
    { id: 'topics', label: '📚 Temas' },
    { id: 'srs', label: '🃏 Memoria' },
  ]

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>📊 Tu Análisis Profundo</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Basado en {profile.total_answered} respuestas · Actualizado en tiempo real
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="btn"
            style={{
              fontSize: 12, padding: '7px 12px',
              background: tab === t.id ? 'var(--primary)' : 'var(--card)',
              color: tab === t.id ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${tab === t.id ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: OVERVIEW ── */}
      {tab === 'overview' && (
        <div>
          {/* Perfil cognitivo */}
          <Card style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 40 }}>🧠</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>Estilo: {profile.cognitive_style}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {profile.trend_label} · {profile.overall_accuracy}% precisión global
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <StatPill value={`${profile.overall_accuracy}%`} label="Precisión" color="#6366f1" icon="🎯" />
              <StatPill value={profile.total_answered} label="Respondidas" color="#10b981" icon="✅" />
              <StatPill value={`${profile.streak}d`} label="Racha" color="#f59e0b" icon="🔥" />
            </div>
          </Card>

          {/* Recomendaciones personalizadas */}
          {recommendations?.length > 0 && (
            <div>
              <SectionTitle icon="💡" title="Recomendaciones para ti" sub="Basadas en tus patrones reales de aprendizaje" />
              {recommendations.map((rec, i) => (
                <Card key={i} style={{
                  background: rec.type === 'behavior' ? 'rgba(239,68,68,0.04)' :
                    rec.type === 'motivation' ? 'rgba(16,185,129,0.04)' : 'var(--card)',
                  border: `1px solid ${rec.type === 'behavior' ? 'rgba(239,68,68,0.2)' :
                    rec.type === 'motivation' ? 'rgba(16,185,129,0.2)' : 'var(--border)'}`,
                }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{rec.icon}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{rec.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.detail}</div>
                      <div style={{ fontSize: 11, color: 'var(--primary-light)', marginTop: 6, fontWeight: 600 }}>
                        → {rec.action}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* SRS overview */}
          {srsStats && (
            <Card>
              <SectionTitle icon="🃏" title="Estado de tu memoria" sub="Sistema SM-2 de repetición espaciada" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  { label: 'Preguntas vistas', v: srsStats.seen, color: '#6366f1' },
                  { label: 'Por repasar hoy', v: srsStats.due, color: '#ef4444' },
                  { label: 'Aprendiendo', v: srsStats.learning, color: '#f59e0b' },
                  { label: 'Dominadas', v: srsStats.mature, color: '#10b981' },
                ].map(({ label, v, color }) => (
                  <div key={label} style={{ background: `${color}10`, borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color }}>{v}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                  </div>
                ))}
              </div>
              {srsStats.due > 0 && (
                <div style={{ marginTop: 10, padding: '8px 12px', background: 'rgba(239,68,68,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--danger)' }}>
                  ⚠️ Tienes <strong>{srsStats.due} preguntas vencidas</strong> — ¡repásalas para no olvidar!
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: BEHAVIOR ── */}
      {tab === 'behavior' && (
        <div>
          {/* Velocidad de respuesta */}
          {response_time && (
            <Card>
              <SectionTitle icon="⏱️" title="Análisis de velocidad" sub="Cómo afecta tu velocidad a la precisión" />
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <StatPill value={`${Math.round(response_time.median_ms / 1000)}s`} label="Mediana" color="#6366f1" icon="⏱️" />
                <StatPill value={`${Math.round(response_time.avg_ms / 1000)}s`} label="Promedio" color="#8b5cf6" icon="📊" />
              </div>
              {response_time.fast_accuracy !== null && (
                <>
                  <MiniBar value={response_time.fast_accuracy} label="🚀 Rápidas (<5s)" color="#f59e0b" />
                  {response_time.medium_accuracy !== null &&
                    <MiniBar value={response_time.medium_accuracy} label="🤔 Normales (5-20s)" color="#10b981" />}
                  {response_time.slow_accuracy !== null &&
                    <MiniBar value={response_time.slow_accuracy} label="🐢 Lentas (>20s)" color="#0ea5e9" />}
                </>
              )}
              {response_time.is_impulsive && (
                <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--warning)', marginBottom: 4 }}>⚡ Patrón: Impulsivo</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {response_time.impulsive_rate}% de tus respuestas rápidas son incorrectas.
                    Lee todas las opciones antes de elegir. El tiempo extra mejora tu score.
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Curva velocidad-precisión */}
          {speed_curve && speed_curve.length > 0 && (
            <Card>
              <SectionTitle icon="📈" title="Curva velocidad vs precisión" sub="¿A qué velocidad rindes mejor?" />
              {speed_curve.map(bucket => (
                <div key={bucket.range} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{bucket.range} ({bucket.count} resp.)</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: bucket.accuracy > 70 ? '#10b981' : bucket.accuracy > 50 ? '#f59e0b' : '#ef4444' }}>
                      {bucket.accuracy}%
                    </span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                    <div style={{
                      width: `${bucket.accuracy}%`, height: '100%', borderRadius: 4,
                      background: bucket.accuracy > 70 ? '#10b981' : bucket.accuracy > 50 ? '#f59e0b' : '#ef4444',
                    }} />
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Análisis de fatiga */}
          {fatigue && (
            <Card>
              <SectionTitle icon="🔋" title="Análisis de fatiga" sub={`${fatigue.sessions_analyzed} sesiones analizadas`} />
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <StatPill value={fatigue.avg_session_length} label="Preguntas/sesión" color="#6366f1" icon="📝" />
                <StatPill value={`${fatigue.avg_session_minutes}m`} label="Duración media" color="#8b5cf6" icon="⏰" />
                <StatPill
                  value={fatigue.fatigue_point ? `#${fatigue.fatigue_point}` : '14+'}
                  label="Punto fatiga"
                  color={fatigue.fatigue_point && fatigue.fatigue_point <= 8 ? '#ef4444' : '#10b981'}
                  icon="⚠️"
                />
              </div>
              {/* Curva de sesión */}
              {fatigue.accuracy_curve && fatigue.accuracy_curve.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                    Precisión por pregunta en sesión:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 50 }}>
                    {fatigue.accuracy_curve.slice(0, 12).map(point => {
                      const h = Math.max(4, Math.round((point.accuracy / 100) * 50))
                      const isFatigue = fatigue.fatigue_point && point.position >= fatigue.fatigue_point
                      return (
                        <div
                          key={point.position}
                          title={`Preg ${point.position}: ${point.accuracy}%`}
                          style={{
                            flex: 1, height: h, borderRadius: '3px 3px 0 0',
                            background: isFatigue ? '#ef4444' : point.accuracy > 70 ? '#10b981' : '#f59e0b',
                            minWidth: 8,
                          }}
                        />
                      )
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                    <span>Inicio</span><span>Fin sesión</span>
                  </div>
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-secondary)', background: 'var(--surface)', borderRadius: 8, padding: '8px 10px', lineHeight: 1.6 }}>
                💡 {fatigue.recommendation}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── TAB: TOPICS ── */}
      {tab === 'topics' && (
        <div>
          {/* Velocidad de aprendizaje */}
          {velocity && velocity.length > 0 && (
            <Card>
              <SectionTitle icon="🚀" title="Velocidad de aprendizaje" sub="Mejora inicial → actual por tema" />
              {velocity.map(v => (
                <div key={v.topic} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{v.label}</span>
                    <span style={{ fontSize: 12 }}>{v.velocity_label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 45, fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>{v.initial_accuracy}%</div>
                    <div style={{ flex: 1, background: 'var(--border)', borderRadius: 4, height: 8, position: 'relative' }}>
                      <div style={{
                        position: 'absolute', left: 0, height: '100%', borderRadius: 4,
                        background: TRACK_COLORS[v.topic] || '#6366f1', opacity: 0.3,
                        width: `${v.initial_accuracy}%`,
                      }} />
                      <div style={{
                        position: 'absolute', left: 0, height: '100%', borderRadius: 4,
                        background: TRACK_COLORS[v.topic] || '#6366f1',
                        width: `${v.current_accuracy}%`,
                        transition: 'width 1s ease',
                      }} />
                    </div>
                    <div style={{ width: 45, fontSize: 11, fontWeight: 700, color: TRACK_COLORS[v.topic] }}>{v.current_accuracy}%</div>
                  </div>
                  {v.improvement > 0 && (
                    <div style={{ fontSize: 11, color: '#10b981', marginTop: 3, textAlign: 'right' }}>
                      +{v.improvement}% de mejora
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}

          {/* Conceptos con más errores */}
          {misconceptions && misconceptions.length > 0 && (
            <Card>
              <SectionTitle icon="🎯" title="Puntos ciegos detectados" sub="Conceptos donde cometes más errores" />
              {misconceptions.slice(0, 6).map((m, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 12 }}>{m.concept}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.total_attempts} intentos</span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: 4, height: 6 }}>
                    <div style={{
                      width: `${m.error_rate}%`, height: '100%', borderRadius: 4,
                      background: m.error_rate > 60 ? '#ef4444' : m.error_rate > 40 ? '#f59e0b' : '#10b981',
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: m.error_rate > 60 ? 'var(--danger)' : 'var(--warning)', marginTop: 2 }}>
                    {m.error_rate}% de error · {m.label}
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Fortalezas y debilidades */}
          {profile?.strengths?.length > 0 || profile?.weaknesses?.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <Card style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>💪 Fortalezas</div>
                {profile.strengths.length > 0
                  ? profile.strengths.map(s => <div key={s} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>✓ {s}</div>)
                  : <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Sigue practicando</div>}
              </Card>
              <Card style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 8 }}>🎯 A mejorar</div>
                {profile.weaknesses.length > 0
                  ? profile.weaknesses.map(w => <div key={w} style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>→ {w}</div>)
                  : <div style={{ fontSize: 12, color: '#10b981' }}>¡Sin debilidades!</div>}
              </Card>
            </div>
          ) : null}
        </div>
      )}

      {/* ── TAB: SRS / MEMORIA ── */}
      {tab === 'srs' && srsStats && (
        <div>
          <Card style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.06))', border: '1px solid rgba(99,102,241,0.2)' }}>
            <SectionTitle icon="🃏" title="Sistema de Memoria Espaciada (SM-2)" sub="Algoritmo basado en curvas de olvido de Ebbinghaus" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              {[
                { label: 'Total preguntas', v: srsStats.total, color: '#6366f1', icon: '📚' },
                { label: 'Vistas', v: srsStats.seen, color: '#8b5cf6', icon: '👁️' },
                { label: 'Sin ver', v: srsStats.unseen, color: '#0ea5e9', icon: '🆕' },
                { label: 'Vencen hoy', v: srsStats.due, color: '#ef4444', icon: '⏰' },
              ].map(({ label, v, color, icon }) => (
                <div key={label} style={{ background: `${color}10`, borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ fontSize: 16 }}>{icon}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color }}>{v}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                </div>
              ))}
            </div>
            <MiniBar value={srsStats.seen} max={srsStats.total} label="Cobertura del banco" color="#6366f1" subLabel={`${Math.round(srsStats.seen/Math.max(srsStats.total,1)*100)}%`} />
            <MiniBar value={srsStats.mature} max={Math.max(srsStats.seen, 1)} label="Memorias consolidadas" color="#10b981" subLabel={`${Math.round(srsStats.mature/Math.max(srsStats.seen,1)*100)}%`} />
          </Card>

          <Card>
            <SectionTitle icon="📖" title="¿Cómo funciona el SM-2?" />
            {[
              ['🆕', 'Nueva', 'Primera vez que ves la pregunta'],
              ['📖', 'Aprendiendo', 'La has visto 1-2 veces, intervalo corto (1-6 días)'],
              ['🧠', 'Revisando', 'La recuerdas bien, intervalos más largos (semanas)'],
              ['💎', 'Dominada', 'Intervalo > 21 días — está en tu memoria a largo plazo'],
            ].map(([icon, label, desc]) => (
              <div key={label} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{desc}</div>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--surface)', borderRadius: 8, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              💡 <strong>Ease Factor actual:</strong> {srsStats.avg_ease_factor} ({'>'}2.5 = dominas bien, {'<'}1.8 = área difícil)<br />
              📊 <strong>Retención estimada:</strong> {srsStats.retention_estimate}% de lo que has aprendido
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
