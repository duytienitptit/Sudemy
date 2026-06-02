/**
 * Unit tests for AuthService
 * ──────────────────────────
 * Strategy: Mock Firebase Admin, User model, email utility, and JWT utility.
 * No real Firebase project or MongoDB connection needed.
 */

import { register, login, getMe } from '@/services/auth.service'
import * as firebaseConfig from '@/config/firebase'
import { User } from '@/models/User'
import * as emailLib from '@/lib/email'
import * as jwtLib from '@/lib/jwt'
import { IUser } from '@/models/User'
import { Types } from 'mongoose'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/config/firebase', () => ({
  firebaseAuth: {
    createUser: jest.fn(),
    deleteUser: jest.fn(),
    verifyIdToken: jest.fn(),
  },
}))

jest.mock('firebase-admin', () => ({
  apps: [],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: () => ({ verifyIdToken: jest.fn(), createUser: jest.fn(), deleteUser: jest.fn() }),
}))

jest.mock('@/models/User', () => ({
  User: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}))

jest.mock('@/lib/email', () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/jwt', () => ({
  signToken: jest.fn().mockReturnValue('mocked-jwt-token'),
}))

jest.mock('@/config/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() },
}))

// ─── Typed mock helpers ───────────────────────────────────────────────────────

const mockCreateUser = firebaseConfig.firebaseAuth.createUser as jest.Mock
const mockDeleteUser = firebaseConfig.firebaseAuth.deleteUser as jest.Mock
const mockVerifyIdToken = firebaseConfig.firebaseAuth.verifyIdToken as jest.Mock
const mockUserCreate = User.create as jest.Mock
const mockUserFindOne = User.findOne as jest.Mock
const mockSignToken = jwtLib.signToken as jest.Mock
const mockSendWelcomeEmail = emailLib.sendWelcomeEmail as jest.Mock

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const FAKE_UID = 'firebase-uid-123'
const MONGO_ID = new Types.ObjectId()

function fakeMongoUser(overrides: Partial<IUser> = {}): IUser {
  return {
    _id: MONGO_ID,
    firebaseUid: FAKE_UID,
    fullName: 'Nguyễn Văn A',
    email: 'test@example.com',
    role: 'user',
    purchasedCourses: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  } as unknown as IUser
}

// ─── register ─────────────────────────────────────────────────────────────────

describe('AuthService.register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignToken.mockReturnValue('mocked-jwt-token')
    mockSendWelcomeEmail.mockResolvedValue(undefined)
  })

  it('creates Firebase user + MongoDB user and returns token', async () => {
    mockCreateUser.mockResolvedValue({ uid: FAKE_UID })
    const user = fakeMongoUser()
    mockUserCreate.mockResolvedValue(user)

    const result = await register({
      fullName: 'Nguyễn Văn A',
      email: 'test@example.com',
      password: 'Password1',
    })

    expect(mockCreateUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password1',
      displayName: 'Nguyễn Văn A',
    })
    expect(mockUserCreate).toHaveBeenCalledWith({
      firebaseUid: FAKE_UID,
      fullName: 'Nguyễn Văn A',
      email: 'test@example.com',
      role: 'user',
    })
    expect(mockSignToken).toHaveBeenCalledWith({
      sub: String(MONGO_ID),
      role: 'user',
      email: 'test@example.com',
    })
    expect(result.token).toBe('mocked-jwt-token')
    expect(result.user.email).toBe('test@example.com')
    expect(result.user.role).toBe('user')
    // welcome email is fire-and-forget — just check it was called
    expect(mockSendWelcomeEmail).toHaveBeenCalledWith('test@example.com', 'Nguyễn Văn A')
  })

  it('throws 409 EMAIL_EXISTS when Firebase reports auth/email-already-exists', async () => {
    const firebaseErr = Object.assign(new Error('email exists'), {
      code: 'auth/email-already-exists',
    })
    mockCreateUser.mockRejectedValue(firebaseErr)

    await expect(
      register({ fullName: 'Test User', email: 'dup@example.com', password: 'Password1' }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_EXISTS' })
  })

  it('throws 409 EMAIL_EXISTS and rolls back Firebase user when MongoDB duplicate key error', async () => {
    mockCreateUser.mockResolvedValue({ uid: FAKE_UID })
    mockDeleteUser.mockResolvedValue(undefined)

    const mongoErr = Object.assign(new Error('E11000 duplicate key'), { code: 11000 })
    mockUserCreate.mockRejectedValue(mongoErr)

    await expect(
      register({ fullName: 'Test User', email: 'dup@example.com', password: 'Password1' }),
    ).rejects.toMatchObject({ statusCode: 409, code: 'EMAIL_EXISTS' })

    expect(mockDeleteUser).toHaveBeenCalledWith(FAKE_UID)
  })

  it('rolls back Firebase user and throws 500 DB_ERROR on unexpected MongoDB error', async () => {
    mockCreateUser.mockResolvedValue({ uid: FAKE_UID })
    mockDeleteUser.mockResolvedValue(undefined)
    mockUserCreate.mockRejectedValue(new Error('Network error'))

    await expect(
      register({ fullName: 'Test User', email: 'test@example.com', password: 'Password1' }),
    ).rejects.toMatchObject({ statusCode: 500, code: 'DB_ERROR' })

    expect(mockDeleteUser).toHaveBeenCalledWith(FAKE_UID)
  })
})

// ─── login ────────────────────────────────────────────────────────────────────

describe('AuthService.login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSignToken.mockReturnValue('mocked-jwt-token')
  })

  it('verifies token, finds user, and returns JWT', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: FAKE_UID })
    const user = fakeMongoUser()
    mockUserFindOne.mockResolvedValue(user)

    const result = await login({ idToken: 'valid-firebase-token' })

    expect(mockVerifyIdToken).toHaveBeenCalledWith('valid-firebase-token', true)
    expect(mockUserFindOne).toHaveBeenCalledWith({ firebaseUid: FAKE_UID })
    expect(result.token).toBe('mocked-jwt-token')
    expect(result.user._id).toBe(String(MONGO_ID))
    expect(Array.isArray(result.user.purchasedCourses)).toBe(true)
  })

  it('throws 401 INVALID_TOKEN on generic Firebase error', async () => {
    mockVerifyIdToken.mockRejectedValue(new Error('bad token'))

    await expect(login({ idToken: 'bad-token' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'INVALID_TOKEN',
    })
  })

  it('throws 401 TOKEN_EXPIRED for auth/id-token-expired', async () => {
    const firebaseErr = Object.assign(new Error('expired'), { code: 'auth/id-token-expired' })
    mockVerifyIdToken.mockRejectedValue(firebaseErr)

    await expect(login({ idToken: 'expired-token' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'TOKEN_EXPIRED',
    })
  })

  it('throws 401 TOKEN_REVOKED for auth/id-token-revoked', async () => {
    const firebaseErr = Object.assign(new Error('revoked'), { code: 'auth/id-token-revoked' })
    mockVerifyIdToken.mockRejectedValue(firebaseErr)

    await expect(login({ idToken: 'revoked-token' })).rejects.toMatchObject({
      statusCode: 401,
      code: 'TOKEN_REVOKED',
    })
  })

  it('throws 404 USER_NOT_FOUND when Firebase token is valid but user absent from DB', async () => {
    mockVerifyIdToken.mockResolvedValue({ uid: FAKE_UID })
    mockUserFindOne.mockResolvedValue(null)

    await expect(login({ idToken: 'valid-token' })).rejects.toMatchObject({
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    })
  })
})

// ─── getMe ────────────────────────────────────────────────────────────────────

describe('AuthService.getMe', () => {
  it('returns a safe user view from the IUser document', () => {
    const user = fakeMongoUser({ role: 'admin' })
    const result = getMe(user)

    expect(result._id).toBe(String(MONGO_ID))
    expect(result.fullName).toBe('Nguyễn Văn A')
    expect(result.email).toBe('test@example.com')
    expect(result.role).toBe('admin')
    expect(Array.isArray(result.purchasedCourses)).toBe(true)
    expect(result.createdAt).toBeInstanceOf(Date)
  })
})
