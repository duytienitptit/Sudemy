import { Request, Response, NextFunction } from 'express'
import { register, login, getMe } from '@/services/auth.service'
import { sendSuccess } from '@/lib/response'

// ─── register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 * Auth: None
 */
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await register(req.body)
    sendSuccess(res, result, { statusCode: 201, message: 'Registration successful' })
  } catch (err) {
    next(err)
  }
}

// ─── login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 * Auth: None
 */
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = await login(req.body)
    sendSuccess(res, result)
  } catch (err) {
    next(err)
  }
}

// ─── getMe ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/auth/me
 * Auth: Required (verifyAuth middleware)
 */
export const getMeController = (req: Request, res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      // Should not happen — middleware guarantees this — but guard defensively
      res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } })
      return
    }
    const user = getMe(req.user)
    sendSuccess(res, { user })
  } catch (err) {
    next(err)
  }
}
