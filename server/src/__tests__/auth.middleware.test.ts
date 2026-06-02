/**
 * Unit tests for auth middleware
 * ─────────────────────────────
 * Strategy: Mock @/lib/jwt and User model.
 * The current verifyAuth middleware verifies app-issued JWTs (not Firebase tokens directly).
 * Firebase token verification is done upstream in auth.service.ts (login flow).
 */

import { Request, Response, NextFunction } from 'express'
import { verifyAuth, requireRole } from '@/middlewares/auth'
import { AppError } from '@/middlewares/errorHandler'
import { User } from '@/models/User'

// ─── Mock @/lib/jwt ───────────────────────────────────────────────────────────

jest.mock('@/lib/jwt', () => ({
  verifyToken: jest.fn(),
}))

// ─── Mock firebase-admin (loaded transitively) ────────────────────────────────

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: () => ({ verifyIdToken: jest.fn() }),
}))

// ─── Mock User model ─────────────────────────────────────────────────────────

jest.mock('@/models/User', () => ({
  User: { findById: jest.fn() },
}))

// ─── Mock logger to suppress output during tests ─────────────────────────────

jest.mock('@/config/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn(), debug: jest.fn() },
}))

// ─── Import mocked module references ─────────────────────────────────────────

import * as jwtLib from '@/lib/jwt'

const mockVerifyToken = jwtLib.verifyToken as jest.Mock
const mockUserFindById = User.findById as jest.Mock

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildReq(authHeader?: string): Partial<Request> {
  return {
    headers: authHeader ? { authorization: authHeader } : {},
    path: '/test',
  }
}

const mockRes = {} as Response
const mockNext = jest.fn() as jest.MockedFunction<NextFunction>

/** Extract the first argument passed to next() and cast it to AppError */
function getNextError(): AppError {
  return mockNext.mock.calls[0][0] as unknown as AppError
}

// ─── verifyAuth ──────────────────────────────────────────────────────

describe('verifyAuth', () => {
  beforeEach(() => {
    mockNext.mockReset()
    mockVerifyToken.mockReset()
    mockUserFindById.mockReset()
  })

  it('calls next(AppError NO_TOKEN) when Authorization header is missing', async () => {
    await verifyAuth(buildReq() as Request, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledTimes(1)
    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('NO_TOKEN')
    expect(err.statusCode).toBe(401)
  })

  it('calls next(AppError NO_TOKEN) when Authorization header has wrong format', async () => {
    await verifyAuth(buildReq('Basic sometoken') as Request, mockRes, mockNext)

    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('NO_TOKEN')
  })

  it('attaches req.user and calls next() on valid token + existing user', async () => {
    const fakeUser = { _id: 'user-id', firebaseUid: 'uid-123', role: 'user' }
    mockVerifyToken.mockReturnValue({ sub: 'user-id', role: 'user', email: 'test@test.com' })
    mockUserFindById.mockResolvedValue(fakeUser)

    const req = buildReq('Bearer valid-token') as Request
    await verifyAuth(req, mockRes, mockNext)

    expect(mockVerifyToken).toHaveBeenCalledWith('valid-token')
    expect(mockUserFindById).toHaveBeenCalledWith('user-id')
    expect(req.user).toEqual(fakeUser)
    // next() should be called with no arguments (no error)
    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockNext.mock.calls[0]).toHaveLength(0)
  })

  it('calls next(AppError USER_NOT_FOUND) when token valid but user absent from DB', async () => {
    mockVerifyToken.mockReturnValue({ sub: 'ghost-id', role: 'user', email: 'ghost@test.com' })
    mockUserFindById.mockResolvedValue(null)

    await verifyAuth(buildReq('Bearer valid-token') as Request, mockRes, mockNext)

    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('USER_NOT_FOUND')
    expect(err.statusCode).toBe(404)
  })

  it('calls next(AppError TOKEN_EXPIRED) for expired JWT', async () => {
    const expiredErr = Object.assign(new Error('jwt expired'), { name: 'TokenExpiredError' })
    mockVerifyToken.mockImplementation(() => { throw expiredErr })

    await verifyAuth(buildReq('Bearer expired-token') as Request, mockRes, mockNext)

    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('TOKEN_EXPIRED')
    expect(err.statusCode).toBe(401)
  })

  it('calls next(AppError INVALID_TOKEN) for malformed JWT', async () => {
    const jwtErr = Object.assign(new Error('invalid signature'), { name: 'JsonWebTokenError' })
    mockVerifyToken.mockImplementation(() => { throw jwtErr })

    await verifyAuth(buildReq('Bearer bad-token') as Request, mockRes, mockNext)

    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('INVALID_TOKEN')
    expect(err.statusCode).toBe(401)
  })

  it('calls next(AppError AUTH_FAILED) for unexpected errors', async () => {
    mockVerifyToken.mockImplementation(() => { throw new Error('unknown error') })

    await verifyAuth(buildReq('Bearer token') as Request, mockRes, mockNext)

    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.code).toBe('AUTH_FAILED')
    expect(err.statusCode).toBe(401)
  })
})

// ─── requireRole ─────────────────────────────────────────────────────────────

describe('requireRole', () => {
  beforeEach(() => {
    mockNext.mockReset()
  })

  it('calls next() with no error when user has an allowed role', () => {
    const req = { user: { role: 'admin' }, path: '/admin' } as unknown as Request
    requireRole('admin', 'moderator')(req, mockRes, mockNext)

    expect(mockNext).toHaveBeenCalledTimes(1)
    expect(mockNext.mock.calls[0]).toHaveLength(0)
  })

  it('calls next() with no error when user matches one of several allowed roles', () => {
    const req = { user: { role: 'editor' }, path: '/edit' } as unknown as Request
    requireRole('admin', 'editor')(req, mockRes, mockNext)

    expect(mockNext.mock.calls[0]).toHaveLength(0)
  })

  it('calls next(AppError FORBIDDEN) when user role not in allowed list', () => {
    const req = { user: { role: 'user' }, path: '/admin' } as unknown as Request
    requireRole('admin')(req, mockRes, mockNext)

    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(403)
    expect(err.code).toBe('FORBIDDEN')
  })

  it('calls next(AppError UNAUTHENTICATED) when req.user is undefined', () => {
    const req = { path: '/admin' } as unknown as Request
    requireRole('admin')(req, mockRes, mockNext)

    const err = getNextError()
    expect(err).toBeInstanceOf(AppError)
    expect(err.statusCode).toBe(401)
    expect(err.code).toBe('UNAUTHENTICATED')
  })
})
