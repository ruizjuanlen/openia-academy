import React, { useState, useRef, useEffect } from 'react'
import { useApp } from '../App.jsx'
import { api } from '../api.js'

const QUICK_QUESTIONS = [
  '¿Qué diferencia hay entre ML y Deep Learning?',
  'Explícame qué son los embeddings',
  '¿Cómo funciona el attention mechanism?',
  '¿Qué es RAG y cuándo usarlo?',
  'Dame un ejemplo real de Few-Shot prompting',
  '¿Qué métricas evalúan un modelo de clasificación?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div
      className={`message ${isUser ? 'message-user' : 'message-ai'}`}
      style={{ alignSelf: isUser ? 'flex-end' : 'flex-start' }}
    >
      {!isUser && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
          🤖 Tutor IA
        </div>
      )}
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{msg.content}</div>
    </div>
  )
}

export default function Tutor() {
  const { userId, user } = useApp()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `Hola${user?.name ? `, ${user.name}` : ''}! 👋 Soy tu tutor de IA.\n\nPuedo explicarte cualquier concepto del curso, darte ejemplos, ayudarte con código o simplemente responder tus dudas.\n\n¿Sobre qué quieres aprender hoy?`,
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await api.askTutor(userId, msg, null)
      setMessages(prev => [...prev, { role: 'ai', content: res.reply }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '⚠️ No pude conectar con el tutor en este momento. Inténtalo de nuevo.'
      }])
    }
    setLoading(false)
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="tutor-page">
      <div className="flex-between mb-16">
        <div>
          <h1 style={{ fontSize: 22 }}>🤖 Tutor IA</h1>
          <p className="text-muted" style={{ fontSize: 13, marginTop: 2 }}>
            Adaptado a tu nivel · Respuestas cortas · Optimizado para TDAH
          </p>
        </div>
        <div className="badge badge-success">En línea</div>
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="mb-16">
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
            Preguntas frecuentes:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {QUICK_QUESTIONS.map(q => (
              <button
                key={q}
                className="btn btn-ghost"
                style={{ fontSize: 12, padding: '6px 12px' }}
                onClick={() => send(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="chat-messages" style={{ flex: 1 }}>
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div className="message message-ai" style={{ alignSelf: 'flex-start' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              🤖 Tutor IA
            </div>
            <div className="loading-dots"><span /><span /><span /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-wrapper">
        <textarea
          ref={textareaRef}
          className="chat-input"
          placeholder="Pregunta lo que sea sobre IA, ML, prompts..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          style={{ minHeight: 40 }}
        />
        <button
          className="btn btn-primary"
          style={{ flexShrink: 0, height: 40 }}
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          ↑
        </button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 8 }}>
        Enter para enviar · Shift+Enter para nueva línea
      </div>
    </div>
  )
}
