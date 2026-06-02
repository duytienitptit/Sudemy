import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { verifyAuth, requireRole, optionalAuth } from '@/middlewares/auth'
import {
  createCourseSchema,
  updateCourseSchema,
  updateCourseStatusSchema,
  courseIdParamSchema,
  courseSlugParamSchema,
  listCoursesQuerySchema,
} from '@/validators/course.validator'
import {
  getCoursesController,
  getCourseBySlugController,
  getCourseByIdController,
  createCourseController,
  updateCourseController,
  updateCourseStatusController,
  deleteCourseController,
} from '@/controllers/course.controller'

const router = Router()

// GET /api/v1/courses (Public/Admin)
router.get('/', optionalAuth, validate({ query: listCoursesQuerySchema }), getCoursesController)

// GET /api/v1/courses/:slug (Public)
router.get('/:slug', validate({ params: courseSlugParamSchema }), getCourseBySlugController)

// Protected routes (Admin/Editor)
router.use(verifyAuth)

// GET /api/v1/courses/detail/:id (Admin/Editor)
router.get('/detail/:id', requireRole('admin', 'editor'), validate({ params: courseIdParamSchema }), getCourseByIdController)

// POST /api/v1/courses
router.post('/', requireRole('admin', 'editor'), validate({ body: createCourseSchema }), createCourseController)

// PUT /api/v1/courses/:id
router.put(
  '/:id',
  requireRole('admin', 'editor'),
  validate({ params: courseIdParamSchema, body: updateCourseSchema }),
  updateCourseController
)

// PATCH /api/v1/courses/:id/status
router.patch(
  '/:id/status',
  requireRole('admin', 'editor'),
  validate({ params: courseIdParamSchema, body: updateCourseStatusSchema }),
  updateCourseStatusController
)

// DELETE /api/v1/courses/:id
router.delete('/:id', requireRole('admin'), validate({ params: courseIdParamSchema }), deleteCourseController)

export default router
