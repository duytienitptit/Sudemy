import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { verifyAuth, requireRole, optionalAuth } from '@/middlewares/auth'
import {
  createLessonSchema,
  updateLessonSchema,
  submitQuizSchema,
} from '@/validators/lesson.validator'
import {
  getCourseLessonsController,
  getLessonByIdController,
  createLessonController,
  updateLessonController,
  deleteLessonController,
  submitQuizController,
} from '@/controllers/lesson.controller'
import { z } from 'zod'

const router = Router({ mergeParams: true })

const objectIdSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
})

const courseIdSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format'),
})

// GET /api/v1/courses/:courseId/lessons
router.get('/courses/:courseId/lessons', validate({ params: courseIdSchema }), optionalAuth, getCourseLessonsController)

// POST /api/v1/courses/:courseId/lessons
router.post(
  '/courses/:courseId/lessons',
  verifyAuth,
  requireRole('admin', 'editor'),
  validate({ params: courseIdSchema, body: createLessonSchema }),
  createLessonController
)

// GET /api/v1/lessons/:id
router.get('/lessons/:id', validate({ params: objectIdSchema }), optionalAuth, getLessonByIdController)

// PUT /api/v1/lessons/:id
router.put(
  '/lessons/:id',
  verifyAuth,
  requireRole('admin', 'editor'),
  validate({ params: objectIdSchema, body: updateLessonSchema }),
  updateLessonController
)

// DELETE /api/v1/lessons/:id
router.delete(
  '/lessons/:id',
  verifyAuth,
  requireRole('admin', 'editor'),
  validate({ params: objectIdSchema }),
  deleteLessonController
)

// POST /api/v1/lessons/:id/quiz/submit
router.post(
  '/lessons/:id/quiz/submit',
  verifyAuth,
  validate({ params: objectIdSchema, body: submitQuizSchema }),
  submitQuizController
)

export default router
