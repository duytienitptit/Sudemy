import { Request, Response, NextFunction } from 'express'
import { paymentService } from '@/services/payment.service'
import { logger } from '@/config/logger'

// ─── createOrder ─────────────────────────────────────────────────────────────

/**
 * POST /api/v1/orders/create
 * Auth: Required
 */
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = String(req.user!._id)
    const { order, checkoutUrl } = await paymentService.createOrder(userId, req.body)

    res.status(201).json({
      success: true,
      data: { order, checkoutUrl },
    })
  } catch (err) {
    next(err)
  }
}

// ─── getMyOrders ──────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orders/my
 * Auth: Required
 */
export const getMyOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = String(req.user!._id)
    const orders = await paymentService.getMyOrders(userId)

    res.json({
      success: true,
      data: orders,
    })
  } catch (err) {
    next(err)
  }
}

// ─── getOrderById ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orders/:id
 * Auth: Required (owner or admin/moderator)
 */
export const getOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = String(req.user!._id)
    const isAdmin = ['admin', 'moderator'].includes(req.user!.role)
    const order = await paymentService.getOrderById(String(req.params.id), userId, isAdmin)

    res.json({
      success: true,
      data: { order },
    })
  } catch (err) {
    next(err)
  }
}

// ─── getAllOrders ─────────────────────────────────────────────────────────────

/**
 * GET /api/v1/orders
 * Auth: Required (admin, moderator)
 */
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { page, limit, status, startDate, endDate } = req.query as Record<string, string>
    const result = await paymentService.getAllOrders({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status,
      startDate,
      endDate,
    })

    res.json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    })
  } catch (err) {
    next(err)
  }
}

// ─── verifyOrderPayment ──────────────────────────────────────────────────────

/**
 * POST /api/v1/orders/:orderCode/verify
 * Auth: Required
 *
 * After PayOS redirects the user back, the frontend calls this endpoint
 * to ask the server to check the real payment status from PayOS directly.
 */
export const verifyOrderPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = String(req.user!._id)
    const orderCode = String(req.params.orderCode)
    const { order, purchasedCourses } = await paymentService.verifyOrderPayment(orderCode, userId)

    res.json({
      success: true,
      data: { order, purchasedCourses },
    })
  } catch (err) {
    next(err)
  }
}

// ─── handleWebhook ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/payments/webhook
 * Auth: PayOS signature verification (done inside service)
 *
 * IMPORTANT: This route must receive the RAW body (not JSON-parsed) so PayOS
 * can verify the HMAC checksum. In app.ts, configure:
 *   app.use('/api/v1/payments/webhook', express.raw({ type: '*\/*' }))
 *   BEFORE the global json() middleware for this specific path.
 *
 * However, @payos/node expects a JS object, so we parse it here if needed.
 */
export const handleWebhook = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  try {
    // Express will have already parsed the JSON body if the global json middleware
    // runs first. For production, mount this route before global json middleware.
    const payload = req.body

    await paymentService.handleWebhook(payload)

    // PayOS expects a 200 response regardless of processing outcome
    res.json({ success: true })
  } catch (err) {
    logger.error('Webhook handler error', { error: (err as Error).message })
    // MUST respond 200 to prevent PayOS from retrying indefinitely.
    // Signature errors are logged above for investigation.
    res.status(200).json({ success: true })
  }
}
