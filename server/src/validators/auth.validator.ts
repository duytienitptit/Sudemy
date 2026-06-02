import { z } from 'zod'

// ─── Register ─────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/register
 *
 * fullName  — letters, spaces, and Vietnamese Unicode diacritics; 2–50 chars
 * email     — valid email format
 * password  — min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit
 */
export const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name must be at most 50 characters')
    // Allow ASCII letters, spaces, and Vietnamese diacritics (Unicode ranges)
    .regex(
      /^[\p{L}\s]+$/u,
      'Full name may only contain letters and spaces',
    ),

  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export type RegisterBody = z.infer<typeof registerSchema>

// ─── Login ────────────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 *
 * idToken — Firebase ID token obtained from client-side Firebase Auth SDK
 */
export const loginSchema = z.object({
  idToken: z
    .string({ required_error: 'Firebase ID token is required' })
    .min(1, 'Firebase ID token must not be empty'),
})

export type LoginBody = z.infer<typeof loginSchema>
