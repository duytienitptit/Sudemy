import { z } from 'zod'

// ─── Allowed roles (excludes 'super_admin' — cannot be set via API) ─────────
export const ASSIGNABLE_ROLES = ['user', 'editor', 'moderator', 'admin'] as const
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number]

// ─── GET /api/v1/users ────────────────────────────────────────────────────────

/**
 * Query parameters for paginated user list.
 *
 * page    — 1-indexed page number  (default: 1)
 * limit   — items per page (1–100, default: 20)
 * search  — partial match on fullName or email
 * role    — filter by role
 */
export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(Number)
    .pipe(z.number().int().min(1, 'page must be ≥ 1')),

  limit: z
    .string()
    .optional()
    .default('20')
    .transform(Number)
    .pipe(z.number().int().min(1).max(100, 'limit must be ≤ 100')),

  search: z.string().trim().optional(),

  role: z.enum(ASSIGNABLE_ROLES).optional(),
})

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

// ─── PATCH /api/v1/users/:id/role ────────────────────────────────────────────

/**
 * Body for updating a user's role.
 *
 * role — target role; must be one of the assignable roles (not 'admin' itself
 *        in the sense of the requester — that guard lives in the service layer).
 */
export const updateRoleBodySchema = z.object({
  role: z.enum(ASSIGNABLE_ROLES, {
    errorMap: () => ({
      message: `role must be one of: ${ASSIGNABLE_ROLES.join(', ')}`,
    }),
  }),
})

export type UpdateRoleBody = z.infer<typeof updateRoleBodySchema>

// ─── PATCH /api/v1/users/:id/role — URL params ────────────────────────────────

export const userIdParamSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
})

export type UserIdParam = z.infer<typeof userIdParamSchema>
