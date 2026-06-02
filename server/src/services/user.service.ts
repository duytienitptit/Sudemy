import { Types } from 'mongoose'
import { User, IUser } from '@/models/User'
import { AppError } from '@/middlewares/errorHandler'
import { logger } from '@/config/logger'
import { ListUsersQuery, UpdateRoleBody, AssignableRole } from '@/validators/user.validator'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserView {
  _id: string
  fullName: string
  email: string
  role: IUser['role']
  createdAt: Date
}

export interface PaginatedUsers {
  users: UserView[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function toUserView(user: IUser): UserView {
  return {
    _id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }
}

// ─── listUsers ────────────────────────────────────────────────────────────────

/**
 * Return a paginated, optionally filtered list of users.
 *
 * Query supports:
 *   - `search`  — case-insensitive partial match on fullName OR email
 *   - `role`    — exact role filter
 *   - `page` / `limit` — pagination
 */
export async function listUsers(query: ListUsersQuery): Promise<PaginatedUsers> {
  const { page, limit, search, role } = query

  // Build Mongoose filter
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {}

  if (search) {
    const regex = new RegExp(search, 'i')
    filter.$or = [{ fullName: regex }, { email: regex }]
  }

  if (role) {
    filter.role = role
  }

  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean<IUser[]>(),
    User.countDocuments(filter),
  ])

  logger.debug('listUsers', { page, limit, total, search, role })

  return {
    users: users.map(toUserView),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

// ─── updateUserRole ───────────────────────────────────────────────────────────

/**
 * Update the role of a target user.
 *
 * Business rules:
 *   1. Target user must exist in MongoDB.
 *   2. Cannot demote yourself (requesterId === targetId).
 *   3. Cannot assign `admin` role (only another `admin` can already have it —
 *      this API deliberately prevents escalation to `admin` from lower roles).
 *      Per spec: "cannot set role to super_admin" — in our schema `admin` is
 *      the highest assignable role; the validator already blocks unknown roles.
 *
 * @param targetId   — MongoDB `_id` of the user to update (from URL param)
 * @param body       — validated body containing the new `role`
 * @param requesterId — MongoDB `_id` of the authenticated requester
 */
export async function updateUserRole(
  targetId: string,
  body: UpdateRoleBody,
  requesterId: string,
): Promise<{ user: UserView }> {
  // Guard: must be a valid ObjectId
  if (!Types.ObjectId.isValid(targetId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_ID')
  }

  // Guard: cannot change your own role
  if (targetId === requesterId) {
    throw new AppError('You cannot change your own role', 400, 'SELF_ROLE_CHANGE')
  }

  const newRole = body.role as AssignableRole

  // Guard: cannot promote anyone to 'admin' via this endpoint
  // (prevents privilege escalation — only seed / direct DB can set admin)
  if (newRole === 'admin') {
    throw new AppError('Cannot assign the admin role via this endpoint', 403, 'ROLE_ESCALATION')
  }

  const user = await User.findById(targetId)
  if (!user) {
    logger.warn('updateUserRole: target user not found', { targetId })
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  user.role = newRole
  await user.save()

  logger.info('User role updated', { targetId, newRole, requesterId })

  return { user: toUserView(user) }
}
