import { Router } from 'express'
import { getSettings, updateSettings } from '../controllers/settings.controller'
import { verifyAuth, requireRole } from '../middlewares/auth'

const router = Router()

// Public endpoint for branding
router.get('/', getSettings)

// Admin endpoint for updating settings
router.put('/', verifyAuth, requireRole('admin'), updateSettings)

export default router
