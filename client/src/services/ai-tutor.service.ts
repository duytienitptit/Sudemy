import api from '@/lib/api'
import { getStoredToken } from '@/lib/api'
import type { ChatMessage, ChatUsage, SSEEvent } from '@/types/ai-tutor.types'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1'

// ─── Get Chat History ─────────────────────────────────────────────────────────

export async function getChatHistory(courseId: string, lessonId: string): Promise<ChatMessage[]> {
  const { data } = await api.get<{ success: boolean; data: ChatMessage[] }>(
    `/ai-tutor/history/${courseId}/${lessonId}`,
  )
  return data.data
}

// ─── Get Usage Stats ──────────────────────────────────────────────────────────

export async function getUsage(): Promise<ChatUsage> {
  const { data } = await api.get<{ success: boolean; data: ChatUsage }>('/ai-tutor/usage')
  return data.data
}

// ─── Send Message (SSE Streaming) ─────────────────────────────────────────────

export async function sendMessage(
  courseId: string,
  lessonId: string,
  message: string,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: { code: string; message: string }) => void,
): Promise<void> {
  const token = getStoredToken()

  const response = await fetch(`${API_BASE}/ai-tutor/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ courseId, lessonId, message }),
  })

  if (!response.ok) {
    // Non-SSE error (e.g. 401, 500 before streaming started)
    const errorBody = await response.json().catch(() => null)
    onError({
      code: errorBody?.error?.code || 'NETWORK_ERROR',
      message: errorBody?.error?.message || `Lỗi kết nối (${response.status})`,
    })
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    onError({ code: 'NO_STREAM', message: 'Trình duyệt không hỗ trợ streaming' })
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Parse SSE events from buffer
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? '' // Keep incomplete line in buffer

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6) // Remove "data: " prefix

        try {
          const event: SSEEvent = JSON.parse(jsonStr)

          switch (event.type) {
            case 'chunk':
              onChunk(event.text)
              break
            case 'done':
              onDone()
              return
            case 'error':
              onError(event.error)
              return
          }
        } catch {
          // Ignore JSON parse errors for incomplete chunks
        }
      }
    }

    // If we exit the loop without a 'done' event
    onDone()
  } catch (error) {
    onError({
      code: 'STREAM_ERROR',
      message: (error as Error).message || 'Lỗi khi đọc phản hồi từ AI',
    })
  }
}
