import { Types } from 'mongoose'
import { PaymentService } from '../payment.service'
import { Order } from '@/models/Order'
import { Course } from '@/models/Course'
import { User } from '@/models/User'
import { Coupon } from '@/models/Coupon'
import { FlashSale } from '@/models/FlashSale'
import { AppError } from '@/middlewares/errorHandler'
import * as emailLib from '@/lib/email'
import * as payosLib from '@/lib/payos'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/models/Order')
jest.mock('@/models/Course')
jest.mock('@/models/User')
jest.mock('@/models/Coupon')
jest.mock('@/models/FlashSale')
jest.mock('@/lib/email')
jest.mock('@/lib/payos')

const mockPayos = {
  paymentRequests: {
    create: jest.fn(),
  },
  webhooks: {
    verify: jest.fn(),
  },
}
;(payosLib.getPayOS as jest.Mock).mockReturnValue(mockPayos)

const mockSendEmail = emailLib.sendPurchaseConfirmationEmail as jest.Mock
mockSendEmail.mockResolvedValue(undefined)

// ─── IDs ──────────────────────────────────────────────────────────────────────

const USER_ID = new Types.ObjectId().toString()
const COURSE_ID = new Types.ObjectId().toString()
const ORDER_ID = new Types.ObjectId().toString()

const mockCourse = {
  _id: COURSE_ID,
  title: 'Learn ChatGPT',
  price: 500000,
  status: 'published',
}

const mockUser = {
  _id: USER_ID,
  email: 'student@test.com',
  fullName: 'Nguyen Test',
  purchasedCourses: [],
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PaymentService', () => {
  let service: PaymentService

  beforeEach(() => {
    service = new PaymentService()
    jest.clearAllMocks()
    ;(payosLib.getPayOS as jest.Mock).mockReturnValue(mockPayos)
    mockSendEmail.mockResolvedValue(undefined)
  })

  // ─── createOrder ──────────────────────────────────────────────────────────

  describe('createOrder', () => {
    beforeEach(() => {
      ;(Course.findById as jest.Mock).mockResolvedValue(mockCourse)
      ;(User.findById as jest.Mock).mockResolvedValue({ ...mockUser })
      ;(FlashSale.findOne as jest.Mock).mockResolvedValue(null)
      ;(Coupon.findOne as jest.Mock).mockResolvedValue(null)
      ;(Order.create as jest.Mock).mockResolvedValue({
        _id: ORDER_ID,
        amount: 500000,
        status: 'pending',
      })
      mockPayos.paymentRequests.create.mockResolvedValue({
        checkoutUrl: 'https://pay.payos.vn/test',
      })
    })

    it('creates an order and returns checkoutUrl', async () => {
      const result = await service.createOrder(USER_ID, { courseId: COURSE_ID })

      expect(Course.findById).toHaveBeenCalledWith(COURSE_ID)
      expect(mockPayos.paymentRequests.create).toHaveBeenCalled()
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: USER_ID,
          courseId: COURSE_ID,
          amount: 500000,
          status: 'pending',
        }),
      )
      expect(result.checkoutUrl).toBe('https://pay.payos.vn/test')
    })

    it('throws 404 if course not found', async () => {
      ;(Course.findById as jest.Mock).mockResolvedValue(null)
      await expect(service.createOrder(USER_ID, { courseId: COURSE_ID })).rejects.toThrow(
        AppError,
      )
    })

    it('throws 404 if course is not published', async () => {
      ;(Course.findById as jest.Mock).mockResolvedValue({ ...mockCourse, status: 'draft' })
      await expect(service.createOrder(USER_ID, { courseId: COURSE_ID })).rejects.toThrow(
        AppError,
      )
    })

    it('throws 409 if user already purchased the course', async () => {
      ;(User.findById as jest.Mock).mockResolvedValue({
        ...mockUser,
        purchasedCourses: [new Types.ObjectId(COURSE_ID)],
      })
      await expect(service.createOrder(USER_ID, { courseId: COURSE_ID })).rejects.toThrow(
        AppError,
      )
    })

    it('throws 503 if PayOS is not configured', async () => {
      ;(payosLib.getPayOS as jest.Mock).mockReturnValue(null)
      await expect(service.createOrder(USER_ID, { courseId: COURSE_ID })).rejects.toThrow(
        AppError,
      )
    })

    it('throws 502 if PayOS API fails', async () => {
      mockPayos.paymentRequests.create.mockRejectedValue(new Error('PayOS API error'))
      await expect(service.createOrder(USER_ID, { courseId: COURSE_ID })).rejects.toThrow(
        AppError,
      )
    })

    it('applies percent coupon discount', async () => {
      const coupon = {
        _id: new Types.ObjectId(),
        discountType: 'percent',
        discountValue: 20,
        isActive: true,
        expiresAt: undefined,
        maxUses: undefined,
        usedCount: 0,
      }
      ;(Coupon.findOne as jest.Mock).mockResolvedValue(coupon)
      ;(Coupon.findByIdAndUpdate as jest.Mock).mockResolvedValue(coupon)

      await service.createOrder(USER_ID, { courseId: COURSE_ID, couponCode: 'SAVE20' })

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 400000 }), // 500000 * 0.8
      )
    })

    it('applies fixed coupon discount', async () => {
      const coupon = {
        _id: new Types.ObjectId(),
        discountType: 'fixed',
        discountValue: 100000,
        isActive: true,
        expiresAt: undefined,
        maxUses: undefined,
        usedCount: 0,
      }
      ;(Coupon.findOne as jest.Mock).mockResolvedValue(coupon)
      ;(Coupon.findByIdAndUpdate as jest.Mock).mockResolvedValue(coupon)

      await service.createOrder(USER_ID, { courseId: COURSE_ID, couponCode: 'OFF100K' })

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 400000 }),
      )
    })

    it('applies flash sale when no coupon', async () => {
      const now = new Date()
      ;(FlashSale.findOne as jest.Mock).mockResolvedValue({
        discountPercent: 10,
        startTime: new Date(now.getTime() - 3600000),
        endTime: new Date(now.getTime() + 3600000),
        isActive: true,
      })

      await service.createOrder(USER_ID, { courseId: COURSE_ID })

      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 450000 }), // 500000 * 0.9
      )
    })

    it('throws 400 for expired coupon', async () => {
      ;(Coupon.findOne as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        discountType: 'percent',
        discountValue: 10,
        isActive: true,
        expiresAt: new Date('2020-01-01'), // expired
        usedCount: 0,
      })
      await expect(
        service.createOrder(USER_ID, { courseId: COURSE_ID, couponCode: 'OLD' }),
      ).rejects.toThrow(AppError)
    })

    it('throws 400 for maxed out coupon', async () => {
      ;(Coupon.findOne as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId(),
        discountType: 'percent',
        discountValue: 10,
        isActive: true,
        expiresAt: undefined,
        maxUses: 10,
        usedCount: 10,
      })
      await expect(
        service.createOrder(USER_ID, { courseId: COURSE_ID, couponCode: 'MAXED' }),
      ).rejects.toThrow(AppError)
    })
  })

  // ─── handleWebhook ────────────────────────────────────────────────────────

  describe('handleWebhook', () => {
    const mockOrder = {
      _id: ORDER_ID,
      userId: USER_ID,
      courseId: COURSE_ID,
      amount: 500000,
      status: 'pending',
      payosOrderId: '123456789012',
      payosTransactionId: undefined,
      save: jest.fn().mockResolvedValue(true),
    }

    beforeEach(() => {
      ;(Order.findOne as jest.Mock).mockResolvedValue({ ...mockOrder, save: jest.fn() })
      ;(User.findByIdAndUpdate as jest.Mock).mockResolvedValue(null)
      ;(User.findById as jest.Mock).mockResolvedValue(mockUser)
      ;(Course.findById as jest.Mock).mockResolvedValue(mockCourse)
    })

    it('marks order completed and grants course access on success code', async () => {
      const saveMock = jest.fn()
      const order = { ...mockOrder, status: 'pending', save: saveMock }
      ;(Order.findOne as jest.Mock).mockResolvedValue(order)
      mockPayos.webhooks.verify.mockResolvedValue({
        code: '00',
        data: {
          orderCode: 123456789012,
          code: '00',
          reference: 'TXN001',
        },
      })

      await service.handleWebhook({ orderCode: '123456789012', code: '00' })

      expect(order.status).toBe('completed')
      expect(saveMock).toHaveBeenCalled()
      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        USER_ID,
        { $addToSet: { purchasedCourses: COURSE_ID } },
      )
    })

    it('marks order failed on non-00 code', async () => {
      const saveMock = jest.fn()
      const order = { ...mockOrder, status: 'pending', save: saveMock }
      ;(Order.findOne as jest.Mock).mockResolvedValue(order)
      mockPayos.webhooks.verify.mockResolvedValue({
        code: '01',
        data: { orderCode: 123456789012, code: '01' },
      })

      await service.handleWebhook({})

      expect(order.status).toBe('failed')
      expect(saveMock).toHaveBeenCalled()
    })

    it('skips processing if order already completed (idempotency)', async () => {
      const saveMock = jest.fn()
      ;(Order.findOne as jest.Mock).mockResolvedValue({
        ...mockOrder,
        status: 'completed',
        save: saveMock,
      })
      mockPayos.webhooks.verify.mockResolvedValue({
        code: '00',
        data: { orderCode: 123456789012, code: '00' },
      })

      await service.handleWebhook({})

      expect(saveMock).not.toHaveBeenCalled()
      expect(User.findByIdAndUpdate).not.toHaveBeenCalled()
    })

    it('throws 400 on invalid webhook signature', async () => {
      mockPayos.webhooks.verify.mockRejectedValue(new Error('Invalid signature'))

      await expect(service.handleWebhook({})).rejects.toThrow(AppError)
    })

    it('throws 503 if PayOS not configured', async () => {
      ;(payosLib.getPayOS as jest.Mock).mockReturnValue(null)
      await expect(service.handleWebhook({})).rejects.toThrow(AppError)
    })

    it('returns silently for unknown orderCode', async () => {
      ;(Order.findOne as jest.Mock).mockResolvedValue(null)
      mockPayos.webhooks.verify.mockResolvedValue({
        code: '00',
        data: { orderCode: 999999, code: '00' },
      })

      // Should not throw
      await expect(service.handleWebhook({})).resolves.toBeUndefined()
    })
  })

  // ─── getMyOrders ─────────────────────────────────────────────────────────

  describe('getMyOrders', () => {
    it('returns user orders sorted by createdAt desc', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ _id: ORDER_ID }]),
      }
      ;(Order.find as jest.Mock).mockReturnValue(chainMock)

      const result = await service.getMyOrders(USER_ID)

      expect(Order.find).toHaveBeenCalledWith({ userId: USER_ID })
      expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(result).toHaveLength(1)
    })
  })

  // ─── getAllOrders ─────────────────────────────────────────────────────────

  describe('getAllOrders', () => {
    it('returns paginated orders with filters', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ _id: ORDER_ID }]),
      }
      ;(Order.find as jest.Mock).mockReturnValue(chainMock)
      ;(Order.countDocuments as jest.Mock).mockResolvedValue(1)

      const result = await service.getAllOrders({ page: 1, limit: 10, status: 'completed' })

      expect(Order.find).toHaveBeenCalledWith({ status: 'completed' })
      expect(result.pagination.total).toBe(1)
      expect(result.orders).toHaveLength(1)
    })
  })

  // ─── getOrderById ─────────────────────────────────────────────────────────

  describe('getOrderById', () => {
    const validOrderId = new Types.ObjectId().toString()

    const populatedOrder = {
      _id: validOrderId,
      userId: { _id: USER_ID, fullName: 'Nguyen Test', email: 'student@test.com' },
      courseId: { _id: COURSE_ID, title: 'Learn ChatGPT', thumbnail: '', slug: 'learn-chatgpt' },
      amount: 500000,
      status: 'completed',
    }

    const buildChain = (result: unknown) => ({
      populate: jest.fn().mockReturnThis(),
      lean: jest.fn().mockResolvedValue(result),
    })

    it('returns order when user is the owner', async () => {
      ;(Order.findById as jest.Mock).mockReturnValue(buildChain(populatedOrder))

      const result = await service.getOrderById(validOrderId, USER_ID, false)

      expect(Order.findById).toHaveBeenCalledWith(validOrderId)
      expect(result).toMatchObject({ amount: 500000, status: 'completed' })
    })

    it('throws 404 for invalid ObjectId format', async () => {
      await expect(service.getOrderById('not-an-id', USER_ID)).rejects.toThrow(AppError)
    })

    it('throws 404 when order does not exist', async () => {
      ;(Order.findById as jest.Mock).mockReturnValue(buildChain(null))

      await expect(service.getOrderById(validOrderId, USER_ID)).rejects.toThrow(AppError)
    })

    it('throws 403 when non-admin requests another user\'s order', async () => {
      const otherUserId = new Types.ObjectId().toString()
      ;(Order.findById as jest.Mock).mockReturnValue(buildChain(populatedOrder))

      await expect(service.getOrderById(validOrderId, otherUserId, false)).rejects.toThrow(AppError)
    })

    it('allows admin to view any order', async () => {
      const otherUserId = new Types.ObjectId().toString()
      ;(Order.findById as jest.Mock).mockReturnValue(buildChain(populatedOrder))

      const result = await service.getOrderById(validOrderId, otherUserId, true)

      expect(result).toMatchObject({ amount: 500000 })
    })
  })

  // ─── expirePendingOrders ──────────────────────────────────────────────────

  describe('expirePendingOrders', () => {
    it('updates pending orders older than threshold to failed', async () => {
      ;(Order.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 3 })

      const expired = await service.expirePendingOrders(30)

      expect(Order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending' }),
        { $set: { status: 'failed' } },
      )
      expect(expired).toBe(3)
    })

    it('returns 0 when no orders to expire', async () => {
      ;(Order.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 0 })

      const expired = await service.expirePendingOrders(30)

      expect(expired).toBe(0)
    })
  })
})
