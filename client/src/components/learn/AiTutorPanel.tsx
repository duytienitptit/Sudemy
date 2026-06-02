import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, AlertCircle, Bot, User as UserIcon } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import * as aiTutorService from '@/services/ai-tutor.service'
import type { ChatMessage as ChatMessageType } from '@/types/ai-tutor.types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AiTutorPanelProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  lessonId: string
  courseTitle: string
  lessonTitle: string
}

// ─── Simple Markdown Renderer ─────────────────────────────────────────────────

function renderMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="ai-inline-code">$1</code>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, '').replace(/```$/, '')
      return `<pre class="ai-code-block"><code>${code}</code></pre>`
    })
    // Line breaks
    .replace(/\n/g, '<br/>')
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessageType }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-[var(--color-primary)] text-white'
            : 'bg-gradient-to-br from-indigo-500 to-cyan-400 text-white'
        }`}
      >
        {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? 'bg-[var(--color-primary)] text-white rounded-br-md'
            : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] rounded-bl-md'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="ai-message-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
          />
        )}
      </div>
    </motion.div>
  )
}

// ─── Streaming Bubble ─────────────────────────────────────────────────────────

function StreamingBubble({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-2.5 flex-row"
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-cyan-400 text-white">
        <Bot className="w-3.5 h-3.5" />
      </div>
      <div className="max-w-[85%] rounded-2xl rounded-bl-md px-3.5 py-2.5 text-sm leading-relaxed bg-[var(--color-surface-container)] text-[var(--color-on-surface)]">
        {content ? (
          <div
            className="ai-message-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
          />
        ) : (
          <div className="typing-indicator">
            <span /><span /><span />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export default function AiTutorPanel({
  isOpen,
  onClose,
  courseId,
  lessonId,
  courseTitle,
  lessonTitle,
}: AiTutorPanelProps) {
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const streamingTextRef = useRef('')
  const queryClient = useQueryClient()

  // ── Click outside handler ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && panelRef.current.contains(e.target as Node)) return
      if ((e.target as Element).closest('.ai-tutor-fab')) return
      onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // ── Fetch chat history ──────────────────────────────────────────────────────
  const { data: history } = useQuery({
    queryKey: ['ai-tutor-history', courseId, lessonId],
    queryFn: () => aiTutorService.getChatHistory(courseId, lessonId),
    enabled: isOpen && !!courseId && !!lessonId,
    staleTime: 30_000,
  })

  // ── Fetch usage stats ───────────────────────────────────────────────────────
  const { data: usage } = useQuery({
    queryKey: ['ai-tutor-usage'],
    queryFn: () => aiTutorService.getUsage(),
    enabled: isOpen,
    staleTime: 60_000,
  })

  // Sync history into local state
  useEffect(() => {
    if (history) {
      setMessages(history)
    }
  }, [history])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    setError(null)
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')

    streamingTextRef.current = ''

    // Optimistically add user message
    const userMessage: ChatMessageType = {
      _id: `temp-${Date.now()}`,
      role: 'user',
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      await aiTutorService.sendMessage(
        courseId,
        lessonId,
        trimmed,
        // onChunk
        (text) => {
          streamingTextRef.current += text
          setStreamingContent(streamingTextRef.current)
        },
        // onDone
        () => {
          if (streamingTextRef.current) {
            const aiMessage: ChatMessageType = {
              _id: `ai-${Date.now()}`,
              role: 'assistant',
              content: streamingTextRef.current,
              createdAt: new Date().toISOString(),
            }
            setMessages((msgs) => [...msgs, aiMessage])
          }
          setStreamingContent('')
          setIsStreaming(false)
          // Refresh usage
          queryClient.invalidateQueries({ queryKey: ['ai-tutor-usage'] })
        },
        // onError
        (err) => {
          setError(err.message)
          setIsStreaming(false)
          setStreamingContent('')
        },
      )
    } catch {
      setError('Không thể kết nối đến AI Tutor. Vui lòng thử lại.')
      setIsStreaming(false)
      setStreamingContent('')
    }
  }, [input, isStreaming, courseId, lessonId, queryClient])

  // ── Keyboard handler ────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isRateLimited = usage ? usage.limit !== -1 && usage.remaining <= 0 : false
  const showUsageBanner = usage && usage.limit !== -1

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="ai-tutor-panel"
          >
            {/* Header */}
            <div className="ai-tutor-header">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-on-surface)]">
                    AI Tutor
                  </h3>
                  <p className="text-[10px] text-[var(--color-on-surface-variant)] truncate max-w-[180px]">
                    {lessonTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)] transition-colors"
                aria-label="Đóng AI Tutor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Usage Banner */}
            {showUsageBanner && (
              <div className={`px-4 py-2 text-xs border-b border-[var(--color-outline-variant)] ${
                isRateLimited
                  ? 'bg-[var(--color-error-container)] text-[var(--color-error)]'
                  : 'bg-[var(--color-surface-container-low)] text-[var(--color-on-surface-variant)]'
              }`}>
                {isRateLimited ? (
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Hết lượt hỏi hôm nay. Mua khóa học để hỏi không giới hạn!
                  </span>
                ) : (
                  <span>Còn {usage!.remaining}/{usage!.limit} câu hỏi hôm nay</span>
                )}
              </div>
            )}

            {/* Messages */}
            <div className="ai-tutor-messages">
              {messages.length === 0 && !isStreaming ? (
                <div className="flex flex-col items-center justify-center h-full text-center px-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-cyan-400/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-7 h-7 text-[var(--color-primary)]" />
                  </div>
                  <h4 className="text-sm font-semibold text-[var(--color-on-surface)] mb-1.5">
                    Xin chào! 👋
                  </h4>
                  <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed max-w-[240px]">
                    Mình là AI Tutor của bạn. Hỏi bất kỳ điều gì về bài học
                    <strong className="text-[var(--color-on-surface)]"> {lessonTitle}</strong> nhé!
                  </p>

                  {/* Quick suggestions */}
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    {[
                      'Tóm tắt bài học này cho mình',
                      'Giải thích chi tiết hơn',
                      'Cho mình ví dụ thực tế',
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          setInput(suggestion)
                          setTimeout(() => inputRef.current?.focus(), 0)
                        }}
                        className="text-xs text-left px-3 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] hover:text-[var(--color-on-surface)] transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((msg) => (
                    <MessageBubble key={msg._id} message={msg} />
                  ))}
                  {isStreaming && <StreamingBubble content={streamingContent} />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="px-4 py-2 text-xs text-[var(--color-error)] bg-[var(--color-error-container)] flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-[var(--color-error)] hover:underline flex-shrink-0"
                >
                  Bỏ qua
                </button>
              </div>
            )}

            {/* Input */}
            <div className="ai-tutor-input-area">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isRateLimited ? 'Hết lượt hỏi hôm nay...' : 'Hỏi về bài học...'}
                  disabled={isStreaming || isRateLimited}
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] text-sm px-3.5 py-2.5 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] disabled:opacity-50 placeholder:text-[var(--color-on-surface-variant)] max-h-28"
                  style={{ minHeight: '40px' }}
                  onInput={(e) => {
                    const el = e.currentTarget
                    el.style.height = 'auto'
                    el.style.height = Math.min(el.scrollHeight, 112) + 'px'
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming || isRateLimited}
                  className="flex-shrink-0 w-10 h-10 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-[var(--color-primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Gửi tin nhắn"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-[var(--color-on-surface-variant)] mt-1.5 text-center">
                AI có thể mắc sai sót. Hãy kiểm tra lại thông tin quan trọng.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
