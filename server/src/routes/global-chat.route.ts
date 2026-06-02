import { Router } from 'express'
import * as globalChatController from '@/controllers/global-chat.controller'

const router = Router()

// POST /global-chat — Send message and stream AI response (SSE, no auth required)
router.post('/', globalChatController.chat)

export default router
