import jwt from 'jsonwebtoken'
import { env } from '@/config/env'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  sub: string // MongoDB user _id (string)
  role: string
  email: string
}

// ─── signToken ────────────────────────────────────────────────────────────────

/**
 * Sign an app-issued JWT.
 *
 * @param payload - Data to embed in the token
 * @returns signed JWT string
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  })
}

// ─── verifyToken ──────────────────────────────────────────────────────────────

/**
 * Verify and decode an app-issued JWT.
 *
 * @param token - JWT string from Authorization header
 * @returns decoded JwtPayload
 * @throws JsonWebTokenError | TokenExpiredError on invalid/expired tokens
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}
