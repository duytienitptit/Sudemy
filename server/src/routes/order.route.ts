import { Router } from 'express'
import { verifyAuth, requireRole } from '@/middlewares/auth'
import { validate } from '@/middlewares/validate'
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  verifyOrderPayment,
} from '@/controllers/payment.controller'
import { createOrderSchema } from '@/validators/payment.validator'

const router = Router()

// POST /api/v1/orders/create — Authenticated user creates an order
router.post(
  '/create',
  verifyAuth,
  validate({ body: createOrderSchema }),
  createOrder,
)

// GET /api/v1/orders/my — User's own orders
// NOTE: Must come before /:id to avoid matching 'my' as an id
router.get('/my', verifyAuth, getMyOrders)

// POST /api/v1/orders/:orderCode/verify — Verify payment with PayOS
// NOTE: Must come before /:id to avoid matching 'verify' as an id
router.post('/:orderCode/verify', verifyAuth, verifyOrderPayment)

// GET /api/v1/orders — Admin/moderator list all orders
router.get('/', verifyAuth, requireRole('admin', 'moderator'), getAllOrders)

// GET /api/v1/orders/:id — Order detail (owner or admin/moderator)
router.get('/:id', verifyAuth, getOrderById)

export default router
