import { FlashSaleService } from '@/services/flash-sale.service'
import { FlashSale } from '@/models/FlashSale'
import { AppError } from '@/middlewares/errorHandler'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/models/FlashSale', () => ({
  FlashSale: {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
  },
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

const mockFind = FlashSale.find as jest.Mock
const mockFindOne = FlashSale.findOne as jest.Mock
const mockFindById = FlashSale.findById as jest.Mock
const mockFindByIdAndUpdate = FlashSale.findByIdAndUpdate as jest.Mock
const mockCreate = FlashSale.create as jest.Mock

const service = new FlashSaleService()

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const FUTURE_START = '2099-01-01T00:00:00.000Z'
const FUTURE_END = '2099-01-31T23:59:59.000Z'

const validInput = {
  name: 'Tết Sale',
  discountPercent: 30,
  startTime: FUTURE_START,
  endTime: FUTURE_END,
}

describe('FlashSaleService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ─── getActive ──────────────────────────────────────────────────────────────

  describe('getActive', () => {
    it('returns the currently active flash sale', async () => {
      const sale = { name: 'Weekend Deal', discountPercent: 20 }
      const leanChain = { lean: jest.fn().mockResolvedValue(sale) }
      mockFindOne.mockReturnValue(leanChain)

      const result = await service.getActive()

      expect(mockFindOne).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: true }),
      )
      expect(result).toMatchObject({ name: 'Weekend Deal' })
    })

    it('returns null when no active flash sale', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue(null) }
      mockFindOne.mockReturnValue(leanChain)

      const result = await service.getActive()

      expect(result).toBeNull()
    })

    it('queries with startTime <= now and endTime >= now', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue(null) }
      mockFindOne.mockReturnValue(leanChain)

      await service.getActive()

      const [filter] = mockFindOne.mock.calls[0]
      expect(filter).toMatchObject({
        isActive: true,
        startTime: expect.objectContaining({ $lte: expect.any(Date) }),
        endTime: expect.objectContaining({ $gte: expect.any(Date) }),
      })
    })
  })

  // ─── listAll ────────────────────────────────────────────────────────────────

  describe('listAll', () => {
    it('returns flash sales sorted by createdAt desc', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue([{ name: 'Old Sale' }]) }
      const findChain = { sort: jest.fn().mockReturnValue(leanChain) }
      mockFind.mockReturnValue(findChain)

      const result = await service.listAll()

      expect(findChain.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(result).toHaveLength(1)
    })
  })

  // ─── create ─────────────────────────────────────────────────────────────────

  describe('create', () => {
    beforeEach(() => {
      // Default: no overlap
      const leanChain = { lean: jest.fn().mockResolvedValue(null) }
      mockFindOne.mockReturnValue(leanChain)
    })

    it('creates a flash sale successfully', async () => {
      const created = { name: 'Tết Sale', discountPercent: 30 }
      mockCreate.mockResolvedValue(created)

      const result = await service.create(validInput)

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Tết Sale',
          discountPercent: 30,
          startTime: new Date(FUTURE_START),
          endTime: new Date(FUTURE_END),
        }),
      )
      expect(result).toMatchObject({ name: 'Tết Sale' })
    })

    it('throws 400 INVALID_TIME_RANGE if endTime <= startTime', async () => {
      await expect(
        service.create({
          ...validInput,
          startTime: FUTURE_END,
          endTime: FUTURE_START,
        }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_TIME_RANGE' })
    })

    it('throws 400 INVALID_TIME_RANGE if startTime === endTime', async () => {
      await expect(
        service.create({ ...validInput, endTime: FUTURE_START }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_TIME_RANGE' })
    })

    it('throws 409 FLASH_SALE_OVERLAP if overlapping active sale exists', async () => {
      // findOne returns an existing sale (overlap found)
      const leanChain = { lean: jest.fn().mockResolvedValue({ name: 'Existing Sale' }) }
      mockFindOne.mockReturnValue(leanChain)

      await expect(service.create(validInput)).rejects.toMatchObject({
        statusCode: 409,
        code: 'FLASH_SALE_OVERLAP',
      })
    })
  })

  // ─── update ─────────────────────────────────────────────────────────────────

  describe('update', () => {
    const existingSale = {
      _id: 'sale123',
      name: 'Old Sale',
      discountPercent: 10,
      startTime: new Date(FUTURE_START),
      endTime: new Date(FUTURE_END),
      isActive: true,
    }

    beforeEach(() => {
      mockFindById.mockResolvedValue(existingSale)
      // Default: no overlap
      const leanChain = { lean: jest.fn().mockResolvedValue(null) }
      mockFindOne.mockReturnValue(leanChain)
    })

    it('updates a flash sale successfully', async () => {
      const updated = { ...existingSale, name: 'New Name' }
      const leanChain = { lean: jest.fn().mockResolvedValue(updated) }
      mockFindByIdAndUpdate.mockReturnValue(leanChain)

      const result = await service.update('sale123', { name: 'New Name' })

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        'sale123',
        expect.any(Object),
        expect.objectContaining({ new: true, runValidators: true }),
      )
      expect(result.name).toBe('New Name')
    })

    it('throws 404 if flash sale not found', async () => {
      mockFindById.mockResolvedValue(null)

      await expect(service.update('missing', { name: 'X' })).rejects.toMatchObject({
        statusCode: 404,
        code: 'FLASH_SALE_NOT_FOUND',
      })
    })

    it('throws 400 INVALID_TIME_RANGE if updated times are invalid', async () => {
      await expect(
        service.update('sale123', {
          startTime: FUTURE_END,
          endTime: FUTURE_START,
        }),
      ).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_TIME_RANGE' })
    })

    it('throws 409 if updated time overlaps another active sale', async () => {
      const overlapChain = { lean: jest.fn().mockResolvedValue({ name: 'Conflict' }) }
      mockFindOne.mockReturnValue(overlapChain)

      await expect(
        service.update('sale123', { startTime: FUTURE_START, endTime: FUTURE_END }),
      ).rejects.toMatchObject({ statusCode: 409, code: 'FLASH_SALE_OVERLAP' })
    })

    it('skips overlap check when time window is not changed', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue({ ...existingSale, name: 'Renamed' }) }
      mockFindByIdAndUpdate.mockReturnValue(leanChain)

      await service.update('sale123', { name: 'Renamed' })

      // findOne should NOT be called for overlap check (no time window change)
      expect(mockFindOne).not.toHaveBeenCalled()
    })

    it('excludes current sale from overlap check', async () => {
      const leanChain = { lean: jest.fn().mockResolvedValue(existingSale) }
      mockFindByIdAndUpdate.mockReturnValue(leanChain)

      await service.update('sale123', { startTime: FUTURE_START, endTime: FUTURE_END })

      const [filter] = mockFindOne.mock.calls[0]
      expect(filter).toMatchObject({ _id: { $ne: 'sale123' } })
    })
  })
})
