import { Router } from 'express'
import { verifyAuth, requireRole } from '@/middlewares/auth'
import { validate } from '@/middlewares/validate'
import {
  getActiveFlashSale,
  getFlashSales,
  createFlashSale,
  updateFlashSale,
} from '@/controllers/catalog.controller'
import {
  createFlashSaleSchema,
  updateFlashSaleSchema,
} from '@/validators/payment.validator'

const router = Router()

// GET /api/v1/flash-sales/active — Public
router.get('/active', getActiveFlashSale)

// Admin CRUD
router.get('/', verifyAuth, requireRole('admin'), getFlashSales)
router.post('/', verifyAuth, requireRole('admin'), validate({ body: createFlashSaleSchema }), createFlashSale)
router.put('/:id', verifyAuth, requireRole('admin'), validate({ body: updateFlashSaleSchema }), updateFlashSale)

export default router
