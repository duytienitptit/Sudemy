import { v4 as uuidv4 } from 'uuid'
import { getPayOS } from '@/lib/payos'
import { Order, IOrder } from '@/models/Order'
import { Course, ICourse } from '@/models/Course'
import { Coupon, ICoupon } from '@/models/Coupon'
import { FlashSale } from '@/models/FlashSale'
import { User } from '@/models/User'
import { AppError } from '@/middlewares/errorHandler'
import { sendPurchaseConfirmationEmail } from '@/lib/email'
import { logger } from '@/config/logger'
import { env } from '@/config/env'
import { Types } from 'mongoose'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateOrderInput {
  courseId: string
  couponCode?: string
}

export interface CreateOrderResult {
  order: IOrder
  checkoutUrl: string
}

interface PriceResult {
  finalPrice: number
  coupon?: ICoupon
}

// ─── PaymentService ───────────────────────────────────────────────────────────

export class PaymentService {
  // ─── createOrder ────────────────────────────────────────────────────────────

  /**
   * Create an order and return a PayOS checkout URL.
   *
   * Flow:
   *   1. Validate course exists and is published
   *   2. Check user hasn't already purchased the course
   *   3. Apply coupon / flash sale discount
   *   4. Generate idempotency key
   *   5. Create PayOS payment link
   *   6. Save order with status 'pending'
   *   7. Return checkoutUrl
   *
   * Throws:
   *   - 404 COURSE_NOT_FOUND  — course doesn't exist or not published
   *   - 409 ALREADY_PURCHASED — user already owns the course
   *   - 400 INVALID_COUPON    — coupon is invalid / expired / maxed out
   *   - 503 PAYOS_UNAVAILABLE — PayOS credentials not configured
   *   - 502 PAYOS_ERROR       — PayOS API returned an error
   */
  async createOrder(userId: string, input: CreateOrderInput): Promise<CreateOrderResult> {
    const { courseId, couponCode } = input

    // Step 1 — Validate course
    const course = await Course.findById(courseId)
    if (!course || course.status !== 'published') {
      throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND')
    }

    // Step 2 — Check if already purchased
    const user = await User.findById(userId)
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND')
    }
    const alreadyPurchased = user.purchasedCourses.some(
      (id) => id.toString() === courseId,
    )
    if (alreadyPurchased) {
      throw new AppError('You have already purchased this course', 409, 'ALREADY_PURCHASED')
    }

    // Step 3 — Calculate price
    const { finalPrice, coupon } = await this.calculatePrice(course, couponCode)

    // Step 4 — Idempotency key (UUID per purchase attempt)
    const idempotencyKey = uuidv4()

    // Step 5 — Create PayOS payment link
    const payos = getPayOS()
    if (!payos) {
      throw new AppError(
        'Payment service is not configured',
        503,
        'PAYOS_UNAVAILABLE',
      )
    }

    // PayOS orderCode must be a unique positive integer (max 9007199254740991)
    // We use timestamp lower 13 digits to stay within JS safe integer range
    const orderCode = Date.now() % 900000000000 + 100000000000 // 12-digit number

    const description = `Khoa hoc: ${course.title}`.slice(0, 25)
    const returnUrl = env.PAYOS_RETURN_URL ?? `${env.CLIENT_URL}/payment/success`
    const cancelUrl = env.PAYOS_CANCEL_URL ?? `${env.CLIENT_URL}/payment/cancel`

    let checkoutUrl: string
    try {
      const paymentLink = await payos.paymentRequests.create({
        orderCode,
        amount: finalPrice,
        description,
        returnUrl,
        cancelUrl,
        items: [
          {
            name: course.title.slice(0, 25),
            quantity: 1,
            price: finalPrice,
          },
        ],
      })
      checkoutUrl = paymentLink.checkoutUrl
    } catch (err) {
      logger.error('PayOS createPaymentLink failed', { error: (err as Error).message, courseId })
      throw new AppError('Payment gateway error — please try again', 502, 'PAYOS_ERROR')
    }

    // Step 6 — Persist order
    const order = await Order.create({
      userId,
      courseId,
      amount: finalPrice,
      originalAmount: course.price,
      couponId: coupon?._id,
      payosOrderId: String(orderCode),
      idempotencyKey,
      status: 'pending',
    })

    // If coupon used, increment usedCount
    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } })
    }

    logger.info('Order created', { orderId: order._id, userId, courseId, amount: finalPrice })

    return { order, checkoutUrl }
  }

  // ─── handleWebhook ──────────────────────────────────────────────────────────

  /**
   * Handle a PayOS webhook callback.
   *
   * Idempotency guarantee: if order is already 'completed' or 'failed', return
   * without re-processing (PayOS may send duplicates).
   *
   * Flow:
   *   1. Verify webhook signature via PayOS SDK
   *   2. Find order by payosOrderId
   *   3. Skip if already processed (completed / failed)
   *   4. On success (code '00'): mark completed, grant course access, send email
   *   5. On failure: mark failed
   *
   * Throws:
   *   - 400 INVALID_WEBHOOK   — signature verification failed
   *   - 503 PAYOS_UNAVAILABLE — PayOS credentials not configured
   */
  async handleWebhook(rawBody: unknown): Promise<void> {
    const payos = getPayOS()
    if (!payos) {
      throw new AppError('Payment service is not configured', 503, 'PAYOS_UNAVAILABLE')
    }

    // Step 1 — Verify signature (async in new SDK)
    let webhookData: any
    try {
      webhookData = await payos.webhooks.verify(rawBody as any)
    } catch (err) {
      logger.warn('PayOS webhook signature verification failed', {
        error: (err as Error).message,
      })
      throw new AppError('Invalid webhook signature', 400, 'INVALID_WEBHOOK')
    }

    // In the new SDK the data is at webhookData.data; top-level code = overall
    const data = (webhookData.data ?? webhookData) as any
    const orderCode = data.orderCode
    const code = webhookData.code ?? data.code
    const transactionId = data.reference

    // Step 2 — Find order
    const order = await Order.findOne({ payosOrderId: String(orderCode) })
    if (!order) {
      // Unknown order — log and acknowledge (PayOS expects 200)
      logger.warn('Webhook received for unknown orderCode', { orderCode })
      return
    }

    // Step 3 — Idempotency check
    if (order.status === 'completed' || order.status === 'failed') {
      logger.info('Webhook already processed — skipping', {
        orderId: order._id,
        status: order.status,
      })
      return
    }

    // Step 4 — Process based on PayOS status code
    // PayOS may return code as string '00' or number 0 depending on SDK version
    if (String(code) === '00' || code === 0) {
      // Payment successful
      order.status = 'completed'
      if (transactionId) order.payosTransactionId = String(transactionId)
      await order.save()

      // Grant course access
      await User.findByIdAndUpdate(order.userId, {
        $addToSet: { purchasedCourses: order.courseId },
      })

      logger.info('Payment completed', {
        orderId: order._id,
        userId: order.userId,
        courseId: order.courseId,
        amount: order.amount,
      })

      // Send confirmation email (fire-and-forget)
      this.sendConfirmationEmail(order).catch((err) => {
        logger.error('Failed to queue confirmation email', { error: (err as Error).message })
      })
    } else {
      // Payment failed / cancelled
      order.status = 'failed'
      await order.save()

      logger.info('Payment failed/cancelled', {
        orderId: order._id,
        payosCode: code,
      })
    }
  }

  // ─── verifyOrderPayment ──────────────────────────────────────────────────────

  /**
   * Verify payment status by querying PayOS directly.
   *
   * This is essential for local development where PayOS webhooks cannot
   * reach localhost. The frontend calls this after the user is redirected
   * back from PayOS, and the server queries PayOS for the actual payment
   * status, updating the DB accordingly.
   *
   * Returns order AND updated purchasedCourses so the client can refresh
   * auth state without a full re-login.
   *
   * Flow:
   *   1. Find order by payosOrderId (orderCode)
   *   2. If already completed or failed, return current status
   *   3. Query PayOS for payment link info
   *   4. If PAID → mark completed, grant course access, send email
   *   5. If CANCELLED → mark failed
   *   6. If still PENDING → keep as pending
   *
   * @param orderCode  - the PayOS orderCode (same as payosOrderId)
   * @param userId     - requesting user's _id (ownership check)
   */
  async verifyOrderPayment(
    orderCode: string,
    userId: string,
  ): Promise<{ order: IOrder; purchasedCourses: string[] }> {
    const payos = getPayOS()
    if (!payos) {
      throw new AppError('Payment service is not configured', 503, 'PAYOS_UNAVAILABLE')
    }

    // Step 1 — Find order
    const order = await Order.findOne({ payosOrderId: orderCode })
      .populate('courseId', 'title thumbnail slug')
      .populate('userId', 'fullName email')
    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND')
    }

    // Ownership check (non-admin)
    if (String(order.userId?._id ?? order.userId) !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN')
    }

    // Step 2 — Already processed
    if (order.status === 'completed') {
      const user = await User.findById(userId)
      return { order, purchasedCourses: user?.purchasedCourses.map(String) ?? [] }
    }

    // Step 3 — Query PayOS for actual payment status
    // PayOS SDK v2: paymentRequests.get(orderCode: number) returns PaymentLink
    try {
      const paymentInfo = await payos.paymentRequests.get(Number(orderCode))

      logger.info('PayOS payment info retrieved', {
        orderCode,
        status: paymentInfo.status,
        amountPaid: paymentInfo.amountPaid,
      })

      // Step 4 — Payment succeeded (status = 'PAID')
      if (paymentInfo.status === 'PAID') {
        order.status = 'completed'
        if (paymentInfo.id) order.payosTransactionId = String(paymentInfo.id)
        await order.save()

        // Grant course access
        const actualUserId = order.userId._id ?? order.userId
        const actualCourseId = order.courseId._id ?? order.courseId
        await User.findByIdAndUpdate(actualUserId, {
          $addToSet: { purchasedCourses: actualCourseId },
        })

        logger.info('Payment verified as completed', {
          orderId: order._id,
          orderCode,
          userId: actualUserId,
          courseId: actualCourseId,
        })

        // Send confirmation email (fire-and-forget)
        this.sendConfirmationEmail(order).catch((err) => {
          logger.error('Failed to queue confirmation email', { error: (err as Error).message })
        })
      }
      // Step 5 — Payment cancelled
      else if (paymentInfo.status === 'CANCELLED' || paymentInfo.status === 'EXPIRED') {
        order.status = 'failed'
        await order.save()
        logger.info('Payment verified as failed/cancelled', { orderId: order._id, orderCode })
      }
      // Step 6 — Still pending, no change
    } catch (err) {
      logger.error('Failed to verify payment with PayOS', {
        orderCode,
        error: (err as Error).message,
      })
      // Don't throw — return current order state even if PayOS query fails
    }

    // Return updated user purchasedCourses so client can refresh auth state
    const updatedUser = await User.findById(userId)
    return {
      order,
      purchasedCourses: updatedUser?.purchasedCourses.map(String) ?? [],
    }
  }

  // ─── getOrderById ───────────────────────────────────────────────────────────

  /**
   * Return a single order by its MongoDB _id.
   *
   * @param orderId  - the order's _id
   * @param userId   - the requesting user's _id
   * @param isAdmin  - if true, skip ownership check (admin/moderator)
   *
   * Throws:
   *   - 404 ORDER_NOT_FOUND  — order doesn't exist
   *   - 403 FORBIDDEN        — order belongs to a different user (non-admin)
   */
  async getOrderById(
    orderId: string,
    userId: string,
    isAdmin = false,
  ): Promise<IOrder> {
    if (!Types.ObjectId.isValid(orderId)) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND')
    }

    const order = await Order.findById(orderId)
      .populate('courseId', 'title thumbnail slug')
      .populate('userId', 'fullName email')
      .lean() as unknown as (IOrder & { userId: any; courseId: any }) | null

    if (!order) {
      throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND')
    }

    // Non-admin users may only see their own orders
    if (!isAdmin && String(order.userId?._id ?? order.userId) !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN')
    }

    return order as unknown as IOrder
  }

  // ─── expirePendingOrders ────────────────────────────────────────────────────

  /**
   * Mark all pending orders older than `thresholdMinutes` as 'failed'.
   * Called periodically (e.g. every minute) from a background scheduler.
   *
   * Returns the number of orders that were expired.
   */
  async expirePendingOrders(thresholdMinutes = 30): Promise<number> {
    const cutoff = new Date(Date.now() - thresholdMinutes * 60 * 1000)
    const result = await Order.updateMany(
      { status: 'pending', createdAt: { $lte: cutoff } },
      { $set: { status: 'failed' } },
    )
    const expired = result.modifiedCount ?? 0
    if (expired > 0) {
      logger.info(`Expired ${expired} pending order(s) older than ${thresholdMinutes} min`)
    }
    return expired
  }

  // ─── getMyOrders ────────────────────────────────────────────────────────────

  /**
   * Return orders belonging to the authenticated user.
   */
  async getMyOrders(userId: string): Promise<IOrder[]> {
    return Order.find({ userId })
      .populate('courseId', 'title thumbnail slug')
      .sort({ createdAt: -1 })
      .lean() as unknown as Promise<IOrder[]>
  }

  // ─── getAllOrders ────────────────────────────────────────────────────────────

  /**
   * Paginated list of all orders (admin/moderator).
   */
  async getAllOrders(query: {
    page?: number
    limit?: number
    status?: string
    startDate?: string
    endDate?: string
  }) {
    const page = Math.max(1, query.page || 1)
    const limit = Math.max(1, Math.min(100, query.limit || 20))
    const skip = (page - 1) * limit

    const filter: any = {}
    if (query.status && ['pending', 'completed', 'failed'].includes(query.status)) {
      filter.status = query.status
    }
    if (query.startDate || query.endDate) {
      filter.createdAt = {}
      if (query.startDate) filter.createdAt.$gte = new Date(query.startDate)
      if (query.endDate) filter.createdAt.$lte = new Date(query.endDate)
    }

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('userId', 'fullName email')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments(filter),
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────────

  /**
   * Calculate final price, applying coupon and/or active flash sale.
   * Coupon discount takes precedence over flash sale when both exist.
   */
  private async calculatePrice(
    course: ICourse,
    couponCode?: string,
  ): Promise<PriceResult> {
    const originalPrice = course.price

    // Apply coupon if provided
    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
      })

      if (!coupon) {
        throw new AppError('Coupon code is invalid or inactive', 400, 'INVALID_COUPON')
      }

      // Check expiry
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new AppError('Coupon has expired', 400, 'COUPON_EXPIRED')
      }

      // Check usage limit
      if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
        throw new AppError('Coupon usage limit has been reached', 400, 'COUPON_MAXED')
      }

      let finalPrice: number
      if (coupon.discountType === 'percent') {
        finalPrice = Math.round(originalPrice * (1 - coupon.discountValue / 100))
      } else {
        finalPrice = Math.max(0, originalPrice - coupon.discountValue)
      }

      return { finalPrice, coupon }
    }

    // Apply active flash sale
    const now = new Date()
    const flashSale = await FlashSale.findOne({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    })

    if (flashSale) {
      const finalPrice = Math.round(originalPrice * (1 - flashSale.discountPercent / 100))
      return { finalPrice }
    }

    return { finalPrice: originalPrice }
  }

  /**
   * Asynchronously send purchase confirmation email.
   */
  private async sendConfirmationEmail(order: IOrder): Promise<void> {
    const user = await User.findById(order.userId)
    const course = await Course.findById(order.courseId)
    if (!user || !course) return

    await sendPurchaseConfirmationEmail(
      user.email,
      user.fullName,
      course.title,
      order.amount,
      String(order._id),
    )
  }
}

export const paymentService = new PaymentService()
