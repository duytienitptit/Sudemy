import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/middlewares/errorHandler'
import * as globalChatService from '@/services/global-chat.service'
import type { ChatTurn } from '@/services/global-chat.service'

// ─── POST /global-chat — SSE streaming (public) ───────────────────────────────

export const chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, history } = req.body

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError('message là bắt buộc và không được để trống', 400, 'VALIDATION_ERROR')
    }

    if (message.length > 1000) {
      throw new AppError('Tin nhắn không được vượt quá 1,000 ký tự', 400, 'VALIDATION_ERROR')
    }

    // Validate and sanitise history (max 10 turns to keep context window small)
    const sanitisedHistory: ChatTurn[] = Array.isArray(history)
      ? (history as ChatTurn[])
          .filter(
            (turn) =>
              turn &&
              typeof turn.role === 'string' &&
              ['user', 'assistant'].includes(turn.role) &&
              typeof turn.content === 'string',
          )
          .slice(-10)
          .map((turn) => ({ role: turn.role, content: turn.content.substring(0, 2000) }))
      : []

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders()

    // Stream response
    await globalChatService.streamGlobalChat(
      message.trim(),
      sanitisedHistory,
      // onChunk
      (text: string) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`)
      },
      // onDone
      (_fullResponse: string) => {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        res.end()
      },
      // onError
      (error: Error) => {
        const isAppError = error instanceof AppError
        res.write(
          `data: ${JSON.stringify({
            type: 'error',
            error: {
              code: isAppError ? (error as AppError).code : 'AI_ERROR',
              message: isAppError ? error.message : 'Trợ lý gặp sự cố. Vui lòng thử lại!',
            },
          })}\n\n`,
        )
        res.end()
      },
    )
  } catch (error) {
    if (!res.headersSent) {
      return next(error)
    }
    const isAppError = error instanceof AppError
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        error: {
          code: isAppError ? (error as AppError).code : 'AI_ERROR',
          message: isAppError ? (error as Error).message : 'Trợ lý gặp sự cố. Vui lòng thử lại!',
        },
      })}\n\n`,
    )
    res.end()
  }
}
