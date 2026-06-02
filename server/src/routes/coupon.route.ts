import { Router } from 'express'
import { verifyAuth, requireRole } from '@/middlewares/auth'
import { validate } from '@/middlewares/validate'
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from '@/controllers/catalog.controller'
import {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} from '@/validators/payment.validator'

const router = Router()

// POST /api/v1/coupons/validate — Validate a coupon (auth required)
router.post('/validate', verifyAuth, validate({ body: validateCouponSchema }), validateCoupon)

// Admin-only CRUD
router.get('/', verifyAuth, requireRole('admin', 'moderator'), getCoupons)
router.post('/', verifyAuth, requireRole('admin'), validate({ body: createCouponSchema }), createCoupon)
router.put('/:id', verifyAuth, requireRole('admin'), validate({ body: updateCouponSchema }), updateCoupon)
router.delete('/:id', verifyAuth, requireRole('admin'), deleteCoupon)

export default router
