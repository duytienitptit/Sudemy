import rateLimit, { Options } from 'express-rate-limit'

/**
 * Factory to create a custom rate limiter for a specific route or group of routes.
 *
 * Usage:
 *   router.post('/auth/login', rateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), loginHandler)
 *   router.post('/payments/webhook', rateLimiter({ max: 30 }), webhookHandler)
 */
export function createRateLimiter(options: Partial<Options> = {}) {
  return rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes default
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests, please try again later',
      },
    },
    ...options,
  })
}

// ─── Pre-built limiters for common scenarios ───────────────────────────────────

/** Very strict limiter for sensitive auth endpoints (login, password reset). */
export const authRateLimiter = createRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 })

/** Moderate limiter for payment/webhook endpoints. */
export const paymentRateLimiter = createRateLimiter({ max: 30, windowMs: 60 * 1000 })

/** Liberal limiter for public read-only endpoints (course list, prompt library). */
export const publicReadLimiter = createRateLimiter({ max: 200, windowMs: 15 * 60 * 1000 })
