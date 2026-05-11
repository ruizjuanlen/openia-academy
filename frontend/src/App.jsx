import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Welcome from './pages/Welcome.jsx'
import Diagnostic from './pages/Diagnostic.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LessonPage from './pages/LessonPage.jsx'
import SkillTree from './pages/SkillTree.jsx'
import Tutor from './pages/Tutor.jsx'
import { api } from './api.js'

// ── Global App Context ────────────────────────────────────────
const AppCtx = createContext(null)
export const useApp = () => useContext(AppCtx)

function ToastContainer({ toasts, remove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type === 'achievement' ? 'toast-achievement' : ''}`}>
          <span style={{ fontSize: 20 }}>{t.icon || '🎉'}</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
            {t.body && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  )
}

function Sidebar({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const path = location.pathname

  if (!user) return null

  const navItems = [
    { icon: '🏠', label: 'Inicio', to: '/dashboard' },
    { icon: '🗺️', label: 'Mapa de Rutas', to: '/skill-tree' },
    { icon: '🤖', label: 'Tutor IA', to: '/tutor' },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">🧠 OpenIA</div>

      {/* XP & Level */}
      <div className="sidebar-xp">
        <div className="xp-label">Nivel {user.level} • {user.xp.toLocaleString()} XP</div>
        <div className="xp-bar-track">
          <div
            className="xp-bar-fill"
            style={{ width: `${Math.round(user.level_progress * 100)}%` }}
          />
        </div>
        <div className="xp-numbers">
          <span>{user.current_level_xp} XP</span>
          <span>{user.next_level_xp} XP</span>
        </div>
      </div>

      {/* Nav */}
      {navItems.map(item => (
        <button
          key={item.to}
          className={`nav-item ${path === item.to ? 'active' : ''}`}
          onClick={() => navigate(item.to)}
        >
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}

      {/* Streak */}
      <div className="streak-badge" style={{ marginTop: 'auto' }}>
        <div className="streak-fire">🔥</div>
        <div className="streak-count">{user.streak}</div>
        <div className="streak-label">días seguidos</div>
      </div>
    </aside>
  )
}

function AppProvider() {
  const [userId, setUserId] = useState(() => localStorage.getItem('openia_uid'))
  const [user, setUser] = useState(null)
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()

  // Cargar datos del usuario
  const loadUser = useCallback(async (uid) => {
    if (!uid) return
    try {
      const dash = await api.getDashboard(uid)
      setUser(dash.user)
    } catch {
      localStorage.removeItem('openia_uid')
      setUserId(null)
    }
  }, [])

  useEffect(() => {
    if (userId) loadUser(userId)
  }, [userId, loadUser])

  // Redirigir según estado
  const loc = useLocation()
  useEffect(() => {
    if (!userId && loc.pathname !== '/') {
      navigate('/')
    } else if (userId && user && !user.diagnostic_done && loc.pathname === '/dashboard') {
      navigate('/diagnostic')
    }
  }, [userId, user, loc.pathname, navigate])

  function addToast(toast) {
    const id = Date.now()
    setToasts(prev => [...prev, { id, ...toast }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }

  async function login(name) {
    const { user_id } = await api.createUser(name)
    localStorage.setItem('openia_uid', user_id)
    setUserId(user_id)
    navigate('/diagnostic')
  }

  function logout() {
    localStorage.removeItem('openia_uid')
    setUserId(null)
    setUser(null)
    navigate('/')
  }

  const ctx = { userId, user, loadUser, login, logout, addToast }

  return (
    <AppCtx.Provider value={ctx}>
      <div className="app-shell">
        <Sidebar user={user} />
        <main className={user ? 'main-content' : ''} style={{ width: '100%' }}>
          <Routes>
            <Route path="/"            element={<Welcome />} />
            <Route path="/diagnostic"  element={<Diagnostic />} />
            <Route path="/dashboard"   element={<Dashboard />} />
            <Route path="/lesson/:id"  element={<LessonPage />} />
            <Route path="/skill-tree"  element={<SkillTree />} />
            <Route path="/tutor"       element={<Tutor />} />
          </Routes>
        </main>
      </div>
      <ToastContainer toasts={toasts} />
    </AppCtx.Provider>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider />
    </BrowserRouter>
  )
}
