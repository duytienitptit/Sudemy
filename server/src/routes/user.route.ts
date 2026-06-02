import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { verifyAuth, requireRole } from '@/middlewares/auth'
import {
  listUsersQuerySchema,
  updateRoleBodySchema,
  userIdParamSchema,
} from '@/validators/user.validator'
import { listUsersController, updateUserRoleController } from '@/controllers/user.controller'

const router = Router()

// All user management routes require authentication and Admin role
router.use(verifyAuth, requireRole('admin'))

// GET /api/v1/users?page=&limit=&search=&role=
router.get(
  '/',
  validate({ query: listUsersQuerySchema }),
  listUsersController,
)

// PATCH /api/v1/users/:id/role
router.patch(
  '/:id/role',
  validate({ params: userIdParamSchema, body: updateRoleBodySchema }),
  updateUserRoleController,
)

export default router
