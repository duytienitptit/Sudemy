import { Request, Response, NextFunction } from 'express'
import { logger } from '@/config/logger'

/**
 * Centralized AppError class for all known HTTP errors.
 * Throw this from services — the errorHandler will catch it.
 */
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean

  constructor(message: string, statusCode: number, code?: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code ?? `HTTP_${statusCode}`
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * 404 handler — placed AFTER all routes.
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  })
}

/**
 * Global error handler — placed LAST in middleware stack.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
   
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    // Known operational errors — log at warn level
    logger.warn('Operational error', {
      code: err.code,
      message: err.message,
      statusCode: err.statusCode,
    })
    res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message },
    })
    return
  }

  // Unknown / programming errors — log at error level with full stack
  logger.error('Unexpected error', { error: err.message, stack: err.stack })
  const isDev = process.env.NODE_ENV === 'development'
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: isDev ? err.message : 'An unexpected error occurred',
    },
  })
}
