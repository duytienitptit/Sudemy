import { Router } from 'express'
import { getAdminStats } from '../controllers/stats.controller'
import { verifyAuth, requireRole } from '../middlewares/auth'

const router = Router()

// Admin endpoint for stats
router.get('/', verifyAuth, requireRole('admin'), getAdminStats)

export default router
