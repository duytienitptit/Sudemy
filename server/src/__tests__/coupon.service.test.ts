import { CouponService } from '@/services/coupon.service'
import { Coupon } from '@/models/Coupon'
import { Course } from '@/models/Course'
import { AppError } from '@/middlewares/errorHandler'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/models/Coupon', () => ({
  Coupon: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
  },
}))

jest.mock('@/models/Course', () => ({
  Course: {
    findById: jest.fn(),
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockFind = Coupon.find as jest.Mock
const mockFindOne = Coupon.findOne as jest.Mock
const mockCreate = Coupon.create as jest.Mock
const mockFindByIdAndUpdate = Coupon.findByIdAndUpdate as jest.Mock
const mockFindByIdAndDelete = Coupon.findByIdAndDelete as jest.Mock

const mockCourseFindById = Course.findById as jest.Mock

const service = new CouponService()

describe('CouponService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── listAll ────────────────────────────────────────────────────────────────

  describe('listAll', () => {
    it('returns coupons sorted by createdAt desc', async () => {
      const sorted = { lean: jest.fn().mockResolvedValue([{ code: 'SAVE10' }]) }
      const findChain = { sort: jest.fn().mockReturnValue(sorted) }
      mockFind.mockReturnValue(findChain)

      const result = await service.listAll()

      expect(mockFind).toHaveBeenCalledWith()
      expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({ code: 'SAVE10' })
    })
  })

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    const validInput = {
      code: 'SAVE20',
      discountType: 'percent' as const,
      discountValue: 20,
    }

    it('creates a coupon with uppercased code', async () => {
      const created = { code: 'SAVE20', discountType: 'percent', discountValue: 20 }
      mockCreate.mockResolvedValue(created)

      const result = await service.create({ ...validInput, code: 'save20' })

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'SAVE20' }),
      )
      expect(result).toMatchObject({ code: 'SAVE20' })
    })

    it('throws 400 if percent discount > 99', async () => {
      await expect(
        service.create({ code: 'BIG', discountType: 'percent', discountValue: 100 }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DISCOUNT' })
    })

    it('throws 400 if percent discount is 0', async () => {
      await expect(
        service.create({ code: 'ZERO', discountType: 'percent', discountValue: 0 }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DISCOUNT' })
    })

    it('throws 400 if fixed discount is less than 1000', async () => {
      await expect(
        service.create({ code: 'LOW', discountType: 'fixed', discountValue: 500 }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DISCOUNT' })
    })

    it('converts expiresAt string to Date', async () => {
      const isoDate = '2030-12-31T00:00:00.000Z'
      mockCreate.mockResolvedValue({ code: 'FUTURE', expiresAt: new Date(isoDate) })

      await service.create({ ...validInput, code: 'FUTURE', expiresAt: isoDate })

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: new Date(isoDate) }),
      )
    })

    it('throws 409 if code already exists (Mongo duplicate key)', async () => {
      const dupError = Object.assign(new Error('dup'), { code: 11000 })
      mockCreate.mockRejectedValue(dupError)

      await expect(service.create(validInput)).rejects.toMatchObject({
        statusCode: 409,
        code: 'COUPON_CODE_EXISTS',
      })
    })

    it('rethrows non-duplicate errors', async () => {
      mockCreate.mockRejectedValue(new Error('DB connection failed'))

      await expect(service.create(validInput)).rejects.toThrow('DB connection failed')
    })
  })

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('updates a coupon successfully', async () => {
      const updated = { code: 'SAVE10', discountValue: 10 }
      const leanChain = { lean: jest.fn().mockResolvedValue(updated) }
      mockFindByIdAndUpdate.mockReturnValue(leanChain)

      const result = await service.update('abc123', { discountValue: 10 })

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'abc123',
        expect.any(Object),
        expect.objectContaining({ new: true, runValidators: true }),
      )
      expect(result).toMatchObject({ discountValue: 10 })
    })

    it('throws 404 if coupon not found', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue(null) }
      mockFindByIdAndUpdate.mockReturnValue(leanChain)

      await expect(service.update('nonexistent', {})).rejects.toMatchObject({
        statusCode: 404,
        code: 'COUPON_NOT_FOUND',
      })
    })

    it('throws 400 if percent discount update > 99', async () => {
      await expect(
        service.update('abc', { discountType: 'percent', discountValue: 100 }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DISCOUNT' })
    })

    it('throws 400 if update with zero discount value', async () => {
      await expect(
        service.update('abc', { discountType: 'percent', discountValue: 0 }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DISCOUNT' })
    })

    it('throws 400 if update fixed discount < 1000', async () => {
      await expect(
        service.update('abc', { discountType: 'fixed', discountValue: 100 }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_DISCOUNT' })
    })
  })

  // ─── remove ─────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('deletes a coupon', async () => {
      mockFindByIdAndDelete.mockResolvedValue({ code: 'GONE' })

      await service.remove('abc123')

      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('abc123')
    })

    it('throws 404 if coupon not found', async () => {
      mockFindByIdAndDelete.mockResolvedValue(null)

      await expect(service.remove('missing')).rejects.toMatchObject({
        statusCode: 404,
        code: 'COUPON_NOT_FOUND',
      })
    })
  })

  // ─── validate ───────────────────────────────────────────────────────────────

  describe('validate', () => {
    const courseId = 'course123'
    const mockCourse = { _id: courseId, price: 500000 }

    beforeEach(() => {
      const leanChain = { lean: jest.fn().mockResolvedValue(mockCourse) }
      mockCourseFindById.mockReturnValue(leanChain)
    })

    it('calculates finalPrice with percent discount', async () => {
      const mockCoupon = {
        code: 'SAVE20',
        discountType: 'percent',
        discountValue: 20,
        isActive: true,
        expiresAt: null,
        maxUses: undefined,
        usedCount: 0,
      }
      const leanChain = { lean: jest.fn().mockResolvedValue(mockCoupon) }
      mockFindOne.mockReturnValue(leanChain)

      const result = await service.validate({ code: 'SAVE20', courseId })

      expect(result.valid).toBe(true)
      expect(result.finalPrice).toBe(400000) // 500000 * 0.8
      expect(result.discountType).toBe('percent')
    })

    it('calculates finalPrice with fixed discount', async () => {
      const mockCoupon = {
        code: 'MINUS50K',
        discountType: 'fixed',
        discountValue: 50000,
        isActive: true,
        expiresAt: null,
        maxUses: undefined,
        usedCount: 0,
      }
      const leanChain = { lean: jest.fn().mockResolvedValue(mockCoupon) }
      mockFindOne.mockReturnValue(leanChain)

      const result = await service.validate({ code: 'MINUS50K', courseId })

      expect(result.finalPrice).toBe(450000) // 500000 - 50000
    })

    it('clamps finalPrice to 0 for large fixed discount', async () => {
      const mockCoupon = {
        discountType: 'fixed',
        discountValue: 9999999,
        isActive: true,
        expiresAt: null,
        maxUses: undefined,
        usedCount: 0,
      }
      const leanChain = { lean: jest.fn().mockResolvedValue(mockCoupon) }
      mockFindOne.mockReturnValue(leanChain)

      const result = await service.validate({ code: 'FREE', courseId })

      expect(result.finalPrice).toBe(0)
    })

    it('throws 404 if course not found', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue(null) }
      mockCourseFindById.mockReturnValue(leanChain)

      await expect(service.validate({ code: 'SAVE20', courseId })).rejects.toMatchObject({
        statusCode: 404,
        code: 'COURSE_NOT_FOUND',
      })
    })

    it('throws 400 INVALID_COUPON if coupon not found', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue(null) }
      mockFindOne.mockReturnValue(leanChain)

      await expect(service.validate({ code: 'INVALID', courseId })).rejects.toMatchObject({
        statusCode: 400,
        code: 'INVALID_COUPON',
      })
    })

    it('throws 400 COUPON_EXPIRED if past expiresAt', async () => {
      const expired = {
        discountType: 'percent',
        discountValue: 10,
        isActive: true,
        expiresAt: new Date('2000-01-01'),
        usedCount: 0,
      }
      const leanChain = { lean: jest.fn().mockResolvedValue(expired) }
      mockFindOne.mockReturnValue(leanChain)

      await expect(service.validate({ code: 'OLD', courseId })).rejects.toMatchObject({
        statusCode: 400,
        code: 'COUPON_EXPIRED',
      })
    })

    it('throws 400 COUPON_MAXED if usedCount >= maxUses', async () => {
      const maxed = {
        discountType: 'percent',
        discountValue: 10,
        isActive: true,
        expiresAt: null,
        maxUses: 5,
        usedCount: 5,
      }
      const leanChain = { lean: jest.fn().mockResolvedValue(maxed) }
      mockFindOne.mockReturnValue(leanChain)

      await expect(service.validate({ code: 'MAXED', courseId })).rejects.toMatchObject({
        statusCode: 400,
        code: 'COUPON_MAXED',
      })
    })

    it('allows usage when usedCount < maxUses', async () => {
      const notMaxed = {
        discountType: 'percent',
        discountValue: 10,
        isActive: true,
        expiresAt: null,
        maxUses: 10,
        usedCount: 4,
      }
      const leanChain = { lean: jest.fn().mockResolvedValue(notMaxed) }
      mockFindOne.mockReturnValue(leanChain)

      const result = await service.validate({ code: 'OK', courseId })
      expect(result.valid).toBe(true)
    })
  })
})
