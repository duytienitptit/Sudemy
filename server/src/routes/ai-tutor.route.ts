import { Router } from 'express'
import { verifyAuth } from '@/middlewares/auth'
import * as aiTutorController from '@/controllers/ai-tutor.controller'

const router = Router()

// All AI Tutor routes require authentication
router.use(verifyAuth)

// POST /ai-tutor/chat — Send message and stream AI response (SSE)
router.post('/chat', aiTutorController.chat)

// GET /ai-tutor/history/:courseId/:lessonId — Get chat history for a lesson
router.get('/history/:courseId/:lessonId', aiTutorController.getHistory)

// GET /ai-tutor/usage — Get daily usage stats
router.get('/usage', aiTutorController.getUsage)

export default router
