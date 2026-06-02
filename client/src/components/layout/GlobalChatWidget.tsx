import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { streamGlobalChat, type ChatTurn } from '@/services/global-chat.service'

// ─── Simple Markdown Renderer (mirrors AiTutorPanel) ─────────────────────────

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.07);padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>')
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, '').replace(/```$/, '')
      return `<pre style="background:rgba(0,0,0,0.06);padding:8px;border-radius:6px;overflow-x:auto;font-size:0.8em"><code>${code}</code></pre>`
    })
    .replace(/\n/g, '<br/>')
}

interface Message {
  role: 'user' | 'assistant'
  content: string
  isStreaming?: boolean
  isError?: boolean
}

// ─── Quick Suggestions ────────────────────────────────────────────────────────

const QUICK_SUGGESTIONS = [
  'Khóa học nào phù hợp với người mới?',
  'Giá các khóa học là bao nhiêu?',
  'Có ưu đãi hoặc giảm giá không?',
  'Sudemy có những tính năng gì?',
]

// ─── GlobalChatWidget ─────────────────────────────────────────────────────────

export function GlobalChatWidget() {
  const location = useLocation()

  // Derive visibility BEFORE any other hooks (needed for conditional render)
  const isLearnPage = location.pathname.startsWith('/learn/')
  const isAdminPage = location.pathname.startsWith('/admin')
  const hidden = isLearnPage || isAdminPage

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<(() => void) | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen, scrollToBottom])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setHasUnread(false)
    }
  }, [isOpen])

  // Hide on /learn/* and /admin pages — render nothing
  if (hidden) return null

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      setInput('')

      // Build history from current messages
      const history: ChatTurn[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }))

      // Add user message
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }])

      // Add placeholder for assistant
      setMessages((prev) => [...prev, { role: 'assistant', content: '', isStreaming: true }])
      setIsStreaming(true)

      let streamBuffer = ''

      abortRef.current = streamGlobalChat(
        trimmed,
        history,
        // onChunk
        (chunk) => {
          streamBuffer += chunk
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: streamBuffer,
                isStreaming: true,
              }
            }
            return updated
          })
          if (!isOpen) setHasUnread(true)
        },
        // onDone
        () => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = { ...last, isStreaming: false }
            }
            return updated
          })
          setIsStreaming(false)
          abortRef.current = null
        },
        // onError
        (errMsg) => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last?.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: errMsg,
                isStreaming: false,
                isError: true,
              }
            }
            return updated
          })
          setIsStreaming(false)
          abortRef.current = null
        },
      )
    },
    [isStreaming, messages, isOpen],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleClose = useCallback(() => {
    abortRef.current?.()
    setIsOpen(false)
  }, [])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        fabRef.current &&
        !fabRef.current.contains(e.target as Node)
      ) {
        handleClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen, handleClose])

  const isEmpty = messages.length === 0

  return (
    <>
      {/* ── Floating Action Button ── */}
      <button
        ref={fabRef}
        className={`global-chat-fab ${isOpen ? 'global-chat-fab--open' : ''}`}
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Mở trợ lý Sudemy"
        title="Trợ lý Sudemy — Hỏi về khóa học, giá cả"
      >
        {isOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {hasUnread && <span className="global-chat-fab__badge" aria-label="Tin nhắn mới" />}
          </>
        )}
        {!isOpen && <span className="global-chat-fab__label">Hỏi AI</span>}
      </button>

      {/* ── Chat Panel ── */}
      <div ref={panelRef} className={`global-chat-panel ${isOpen ? 'global-chat-panel--open' : ''}`} role="dialog" aria-label="Trợ lý Sudemy">
        {/* Header */}
        <div className="global-chat-header">
          <div className="global-chat-header__info">
            <div className="global-chat-header__avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                <circle cx="9" cy="13" r="1" fill="currentColor" />
                <circle cx="15" cy="13" r="1" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="global-chat-header__name">Trợ lý Sudemy</div>
              <div className="global-chat-header__status">
                <span className="global-chat-header__dot" />
                Luôn sẵn sàng hỗ trợ
              </div>
            </div>
          </div>
          <button className="global-chat-header__close" onClick={handleClose} aria-label="Đóng">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="global-chat-messages" role="log" aria-live="polite">
          {isEmpty ? (
            <div className="global-chat-welcome">
              <div className="global-chat-welcome__icon">🎓</div>
              <h4 className="global-chat-welcome__title">Xin chào! Mình là Trợ lý Sudemy 👋</h4>
              <p className="global-chat-welcome__desc">
                Hỏi mình bất kỳ điều gì về khóa học, giá cả, hoặc tính năng của Sudemy nhé!
              </p>
              <div className="global-chat-suggestions">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button key={s} className="global-chat-suggestion" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`global-chat-message global-chat-message--${msg.role} ${msg.isError ? 'global-chat-message--error' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="global-chat-message__avatar">🎓</div>
                )}
                <div className="global-chat-message__bubble">
                  {msg.role === 'assistant' ? (
                    msg.isStreaming && !msg.content ? (
                      <div className="global-chat-typing">
                        <span /><span /><span />
                      </div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    )
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer */}
        <p className="global-chat-disclaimer">AI có thể mắc sai sót. Hãy xác nhận lại giá trước khi thanh toán.</p>

        {/* Input */}
        <form className="global-chat-form" onSubmit={handleSubmit}>
          <textarea
            ref={inputRef}
            className="global-chat-input"
            placeholder="Hỏi về khóa học, giá cả..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={1000}
            disabled={isStreaming}
            aria-label="Nhập câu hỏi"
          />
          <button
            type="submit"
            className="global-chat-send"
            disabled={!input.trim() || isStreaming}
            aria-label="Gửi"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </>
  )
}
