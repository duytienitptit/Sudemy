import { Response } from 'express'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface SuccessOptions {
  statusCode?: number
  message?: string
  meta?: Record<string, unknown>
}

interface ErrorOptions {
  statusCode?: number
  code?: string
  details?: Array<{ field: string; message: string }>
}

// ─── sendSuccess ──────────────────────────────────────────────────────────────

/**
 * Standard success response.
 *
 * Shape:
 *   { success: true, message?, data, meta? }
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  options: SuccessOptions = {},
): void {
  const { statusCode = 200, message, meta } = options
  res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    data,
    ...(meta && { meta }),
  })
}

// ─── sendPaginated ────────────────────────────────────────────────────────────

/**
 * Paginated list response.
 *
 * Shape:
 *   { success: true, data: T[], pagination: PaginationMeta }
 *
 * Usage:
 *   sendPaginated(res, courses, { page: 1, limit: 20, total: 150 })
 */
export function sendPaginated<T>(
  res: Response,
  data: T[],
  pagination: { page: number; limit: number; total: number },
): void {
  const { page, limit, total } = pagination
  const totalPages = Math.ceil(total / limit)

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  }

  res.status(200).json({
    success: true,
    data,
    pagination: meta,
  })
}

// ─── sendError ────────────────────────────────────────────────────────────────

/**
 * Explicit error response.
 * Prefer throwing `AppError` so the centralized handler manages errors.
 * Use this only when you need to bypass the error handler (e.g. in streams).
 *
 * Shape:
 *   { success: false, error: { code, message, details? } }
 */
export function sendError(
  res: Response,
  message: string,
  options: ErrorOptions = {},
): void {
  const { statusCode = 500, code = 'INTERNAL_SERVER_ERROR', details } = options
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details && details.length > 0 && { details }),
    },
  })
}
