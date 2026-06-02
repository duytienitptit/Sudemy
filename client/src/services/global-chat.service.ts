// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

// ─── SSE Stream Global Chat ───────────────────────────────────────────────────

export function streamGlobalChat(
  message: string,
  history: ChatTurn[],
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (message: string) => void,
): () => void {
  const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

  let aborted = false
  const controller = new AbortController()

  ;(async () => {
    try {
      const res = await fetch(`${API_BASE}/global-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        onError((err as { error?: { message?: string } })?.error?.message ?? 'Không thể kết nối đến Trợ lý Sudemy')
        return
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const payload = JSON.parse(line.slice(6))
            if (payload.type === 'chunk') {
              onChunk(payload.text as string)
            } else if (payload.type === 'done') {
              if (!aborted) onDone()
            } else if (payload.type === 'error') {
              if (!aborted) onError(payload.error?.message ?? 'Trợ lý gặp sự cố. Vui lòng thử lại!')
            }
          } catch {
            // skip malformed SSE line
          }
        }
      }
    } catch (err: unknown) {
      if (!aborted) {
        onError('Không thể kết nối đến Trợ lý Sudemy. Vui lòng thử lại!')
      }
    }
  })()

  // Return abort function
  return () => {
    aborted = true
    controller.abort()
  }
}
