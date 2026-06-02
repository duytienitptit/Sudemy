import { Request, Response, NextFunction } from 'express'
import { listUsers, updateUserRole } from '@/services/user.service'
import { sendSuccess } from '@/lib/response'

// ─── listUsersController ──────────────────────────────────────────────────────

/**
 * GET /api/v1/users
 * Auth: Required (Admin only)
 */
export const listUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // req.query is already parsed & typed by the `validate` middleware
    const result = await listUsers(req.query as never)
    res.status(200).json({
      success: true,
      data: result.users,
      pagination: result.pagination,
    })
  } catch (err) {
    next(err)
  }
}

// ─── updateUserRoleController ─────────────────────────────────────────────────

/**
 * PATCH /api/v1/users/:id/role
 * Auth: Required (Admin only)
 */
export const updateUserRoleController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const targetId = req.params.id as string
    const requesterId = String(req.user!._id)
    const result = await updateUserRole(targetId, req.body, requesterId)
    sendSuccess(res, result, { message: 'Role updated' })
  } catch (err) {
    next(err)
  }
}
