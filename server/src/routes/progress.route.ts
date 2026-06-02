import { Router } from 'express'
import { completeLesson, getCourseProgress } from '@/controllers/progress.controller'
import { verifyAuth } from '@/middlewares/auth'
import { validate } from '@/middlewares/validate'
import { completeLessonSchema, courseIdParamSchema } from '@/validators/progress.validator'

const router = Router()

// All progress routes require authentication
router.use(verifyAuth)

router.post('/complete', validate({ body: completeLessonSchema }), completeLesson)
router.get('/:courseId', validate({ params: courseIdParamSchema }), getCourseProgress)

export default router
