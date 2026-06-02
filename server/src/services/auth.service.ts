import { firebaseAuth } from '@/config/firebase'
import { User, IUser } from '@/models'
import { AppError } from '@/middlewares/errorHandler'
import { signToken } from '@/lib/jwt'
import { sendWelcomeEmail } from '@/lib/email'
import { logger } from '@/config/logger'
import { RegisterBody, LoginBody } from '@/validators/auth.validator'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthUserView {
  _id: string
  fullName: string
  email: string
  role: IUser['role']
}

export interface AuthUserDetailView extends AuthUserView {
  purchasedCourses: string[]
  createdAt: Date
}

export interface RegisterResult {
  user: AuthUserView
  token: string
}

export interface LoginResult {
  user: AuthUserDetailView
  token: string
}

// ─── register ─────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 *
 * Flow:
 *   1. Create Firebase user with email + password
 *   2. Create MongoDB user doc (role: 'user')
 *   3. Send welcome email (fire-and-forget)
 *   4. Return app JWT + safe user view
 *
 * Throws:
 *   - 409 EMAIL_EXISTS — email already registered in Firebase or MongoDB
 */
export async function register(body: RegisterBody): Promise<RegisterResult> {
  const { fullName, email, password } = body

  // Step 1 — Create Firebase user
  let firebaseUid: string
  try {
    const firebaseUser = await firebaseAuth.createUser({ email, password, displayName: fullName })
    firebaseUid = firebaseUser.uid
    logger.info('Firebase user created', { uid: firebaseUid, email })
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    if (code === 'auth/email-already-exists') {
      throw new AppError('Email address is already registered', 409, 'EMAIL_EXISTS')
    }
    logger.error('Firebase createUser failed', { code, email })
    throw new AppError('Failed to create account — please try again', 500, 'FIREBASE_ERROR')
  }

  // Step 2 — Create MongoDB user (rollback Firebase user on failure)
  let user: IUser
  try {
    user = await User.create({ firebaseUid, fullName, email, role: 'user' })
    logger.info('MongoDB user created', { userId: user._id, email })
  } catch (err: unknown) {
    // Rollback: delete the Firebase user we just created
    await firebaseAuth.deleteUser(firebaseUid).catch((rbErr) => {
      logger.error('Rollback failed — Firebase user not deleted', {
        uid: firebaseUid,
        error: (rbErr as Error).message,
      })
    })

    const mongoCode = (err as { code?: number }).code
    if (mongoCode === 11000) {
      throw new AppError('Email address is already registered', 409, 'EMAIL_EXISTS')
    }
    logger.error('MongoDB user creation failed', { error: (err as Error).message, email })
    throw new AppError('Failed to create account — please try again', 500, 'DB_ERROR')
  }

  // Step 3 — Fire-and-forget welcome email
  sendWelcomeEmail(email, fullName).catch(() => {
    /* already logged inside sendWelcomeEmail */
  })

  // Step 4 — Issue app JWT
  const token = signToken({ sub: String(user._id), role: user.role, email: user.email })

  return {
    user: { _id: String(user._id), fullName: user.fullName, email: user.email, role: user.role },
    token,
  }
}

// ─── login ────────────────────────────────────────────────────────────────────

/**
 * Login via Firebase ID token (issued by client-side Firebase SDK).
 *
 * Flow:
 *   1. Verify Firebase ID token → get uid
 *   2. Find MongoDB user by firebaseUid
 *   3. Return app JWT + full user view
 *
 * Throws:
 *   - 401 INVALID_TOKEN — Firebase token invalid / expired
 *   - 404 USER_NOT_FOUND — No MongoDB doc for this Firebase uid
 */
export async function login(body: LoginBody): Promise<LoginResult> {
  const { idToken } = body

  // Step 1 — Verify Firebase token
  let firebaseUid: string
  let decoded: any
  try {
    decoded = await firebaseAuth.verifyIdToken(idToken, /* checkRevoked */ true)
    firebaseUid = decoded.uid
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    logger.warn('Firebase token verification failed during login', { code })

    if (code === 'auth/id-token-expired') {
      throw new AppError('Token expired — please refresh your session', 401, 'TOKEN_EXPIRED')
    }
    if (code === 'auth/id-token-revoked') {
      throw new AppError('Token revoked — please sign in again', 401, 'TOKEN_REVOKED')
    }
    throw new AppError('Invalid authentication token', 401, 'INVALID_TOKEN')
  }

  // Step 2 — Find MongoDB user by firebaseUid
  let user = await User.findOne({ firebaseUid })

  if (!user && decoded.email) {
    // Fallback: look up by email in case the Firebase UID changed
    // (e.g. account was deleted and recreated, or seed re-ran).
    // Update the stored uid so future lookups hit the fast path.
    const byEmail = await User.findOne({ email: decoded.email })
    if (byEmail) {
      byEmail.firebaseUid = firebaseUid
      await byEmail.save()
      user = byEmail
      logger.info('Synced new firebaseUid for existing user', { userId: user._id, email: user.email })
    } else {
      // Truly new user — auto-provision (Google sign-in, etc.)
      user = await User.create({
        firebaseUid,
        email: decoded.email,
        fullName: decoded.name || decoded.email.split('@')[0],
        role: 'user',
      })
      logger.info('Auto-created MongoDB user for Firebase login', { userId: user._id, email: user.email })
    }
  }

  if (!user) {
    logger.warn('Login: Firebase user not found in MongoDB', { firebaseUid })
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  // Step 3 — Issue app JWT
  const token = signToken({ sub: String(user._id), role: user.role, email: user.email })

  return {
    user: {
      _id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      purchasedCourses: user.purchasedCourses.map(String),
      createdAt: user.createdAt,
    },
    token,
  }
}

// ─── getMe ────────────────────────────────────────────────────────────────────

/**
 * Return the authenticated user's profile.
 * Requires `req.user` to be populated by `verifyAuth` middleware.
 */
export function getMe(user: IUser): AuthUserDetailView {
  return {
    _id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    purchasedCourses: user.purchasedCourses.map(String),
    createdAt: user.createdAt,
  }
}
