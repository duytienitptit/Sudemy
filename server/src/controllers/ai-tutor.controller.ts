import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/middlewares/errorHandler'
import * as aiTutorService from '@/services/ai-tutor.service'

// ─── POST /ai-tutor/chat — SSE streaming ─────────────────────────────────────

export const chat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, lessonId, message } = req.body
    const userId = req.user!._id

    // Validate input
    if (!courseId || !lessonId || !message) {
      throw new AppError('courseId, lessonId, and message are required', 400, 'VALIDATION_ERROR')
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      throw new AppError('Message must be a non-empty string', 400, 'VALIDATION_ERROR')
    }

    if (message.length > 2000) {
      throw new AppError('Message must be at most 2,000 characters', 400, 'VALIDATION_ERROR')
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no') // Disable nginx buffering
    res.flushHeaders()

    // Stream response
    await aiTutorService.streamChat(
      userId,
      courseId,
      lessonId,
      message.trim(),
      // onChunk: send each text chunk as SSE
      (text: string) => {
        res.write(`data: ${JSON.stringify({ type: 'chunk', text })}\n\n`)
      },
      // onDone: send done signal
      (_fullResponse: string) => {
        res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
        res.end()
      },
      // onError: send error and close
      (error: Error) => {
        const isAppError = error instanceof AppError
        const statusCode = isAppError ? (error as AppError).statusCode : 500
        const errorCode = isAppError ? (error as AppError).code : 'AI_ERROR'
        const errorMessage = isAppError ? error.message : 'AI Tutor gặp lỗi. Vui lòng thử lại sau.'

        // If headers haven't been fully committed to SSE yet, we can send error as SSE event
        res.write(
          `data: ${JSON.stringify({
            type: 'error',
            error: { code: errorCode, message: errorMessage, statusCode },
          })}\n\n`,
        )
        res.end()
      },
    )
  } catch (error) {
    // If response hasn't started streaming yet, use normal error handler
    if (!res.headersSent) {
      return next(error)
    }
    // Otherwise send SSE error
    const isAppError = error instanceof AppError
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        error: {
          code: isAppError ? (error as AppError).code : 'AI_ERROR',
          message: isAppError ? (error as Error).message : 'AI Tutor gặp lỗi. Vui lòng thử lại sau.',
        },
      })}\n\n`,
    )
    res.end()
  }
}

// ─── GET /ai-tutor/history/:courseId/:lessonId ────────────────────────────────

export const getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const courseId = req.params.courseId as string
    const lessonId = req.params.lessonId as string
    const userId = req.user!._id

    if (!courseId || !lessonId) {
      throw new AppError('courseId and lessonId are required', 400, 'VALIDATION_ERROR')
    }

    const messages = await aiTutorService.getChatHistory(userId, courseId, lessonId)
    res.json({ success: true, data: messages })
  } catch (error) {
    next(error)
  }
}

// ─── GET /ai-tutor/usage ─────────────────────────────────────────────────────

export const getUsage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!._id
    const usage = await aiTutorService.getUsage(userId)
    res.json({ success: true, data: usage })
  } catch (error) {
    next(error)
  }
}
