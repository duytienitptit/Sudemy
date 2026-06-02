import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { verifyAuth } from '@/middlewares/auth'
import { registerSchema, loginSchema } from '@/validators/auth.validator'
import {
  registerController,
  loginController,
  getMeController,
} from '@/controllers/auth.controller'

const router = Router()

// POST /api/v1/auth/register
router.post('/register', validate({ body: registerSchema }), registerController)

// POST /api/v1/auth/login
router.post('/login', validate({ body: loginSchema }), loginController)

// GET /api/v1/auth/me  (requires Firebase ID token → verifyAuth)
router.get('/me', verifyAuth, getMeController)

export default router
