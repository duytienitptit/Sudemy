import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '@/lib/jwt'
import { User, IUser } from '@/models/User'
import { AppError } from '@/middlewares/errorHandler'
import { logger } from '@/config/logger'

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = IUser['role']

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null
    if (token) {
      const decoded = verifyToken(token)
      const user = await User.findById(decoded.sub)
      if (user) req.user = user
    }
  } catch {
    // Ignore errors for optional auth
  }
  next()
}

// ─── verifyAuth ───────────────────────────────────────────────────────────────

/**
 * Middleware: Verify app-issued JWT from the Authorization header.
 *
 * Flow:
 *   1. Extract Bearer token from `Authorization` header
 *   2. Verify JWT with our server secret
 *   3. Look up the corresponding user in MongoDB by `decoded.sub`
 *   4. Attach user document to `req.user`
 */
export const verifyAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split('Bearer ')[1] : null

    if (!token) {
      throw new AppError('No token provided', 401, 'NO_TOKEN')
    }

    const decoded = verifyToken(token)

    const user = await User.findById(decoded.sub)
    if (!user) {
      logger.warn('Token valid but user not in DB', { userId: decoded.sub })
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }

    req.user = user
    next()
  } catch (err: unknown) {
    if (err instanceof AppError) {
      return next(err)
    }

    const name = (err as Error).name
    if (name === 'TokenExpiredError') {
      return next(new AppError('Token expired — please refresh your session', 401, 'TOKEN_EXPIRED'))
    }
    if (name === 'JsonWebTokenError') {
      return next(new AppError('Invalid or malformed token', 401, 'INVALID_TOKEN'))
    }

    logger.warn('Token verification failed', { error: (err as Error).message })
    return next(new AppError('Authentication failed', 401, 'AUTH_FAILED'))
  }
}

// ─── requireRole ─────────────────────────────────────────────────────────────

/**
 * Middleware factory: Restrict route access to specific roles.
 *
 * Must be used AFTER `verifyAuth` (relies on `req.user` being set).
 *
 * Usage:
 *   router.delete('/courses/:id', verifyAuth, requireRole('admin'), ...)
 *   router.patch('/courses/:id', verifyAuth, requireRole('admin', 'editor'), ...)
 *
 * Throws:
 *   - 401 UNAUTHENTICATED — req.user not set (middleware order bug)
 *   - 403 FORBIDDEN       — User's role not in the allowed list
 */
export const requireRole =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      // Defensive guard — should not happen if middleware is ordered correctly
      return next(new AppError('Authentication required', 401, 'UNAUTHENTICATED'))
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Forbidden: insufficient role', {
        userRole: req.user.role,
        requiredRoles: roles,
        path: req.path,
      })
      return next(
        new AppError(
          `Access denied — requires one of: [${roles.join(', ')}]`,
          403,
          'FORBIDDEN',
        ),
      )
    }

    next()
  }
