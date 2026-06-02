/** Types for the AI Tutor chat feature */

export interface ChatMessage {
  _id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface ChatUsage {
  used: number
  /** -1 means unlimited */
  limit: number
  /** -1 means unlimited */
  remaining: number
}

export interface SSEChunkEvent {
  type: 'chunk'
  text: string
}

export interface SSEDoneEvent {
  type: 'done'
}

export interface SSEErrorEvent {
  type: 'error'
  error: {
    code: string
    message: string
    statusCode?: number
  }
}

export type SSEEvent = SSEChunkEvent | SSEDoneEvent | SSEErrorEvent
