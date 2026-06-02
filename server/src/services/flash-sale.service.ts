import { FlashSale, IFlashSale } from '@/models/FlashSale'
import { AppError } from '@/middlewares/errorHandler'

// ─── Input Types ───────────────────────────────────────────────────────────────

export interface CreateFlashSaleInput {
  name: string
  discountPercent: number
  startTime: string
  endTime: string
  isActive?: boolean
}

export type UpdateFlashSaleInput = Partial<CreateFlashSaleInput>

// ─── FlashSaleService ──────────────────────────────────────────────────────────

export class FlashSaleService {
  // ─── getActive ────────────────────────────────────────────────────────────────

  /**
   * Return the currently active flash sale (if any).
   * "Active" means: isActive=true AND now is within [startTime, endTime].
   */
  async getActive(): Promise<IFlashSale | null> {
    const now = new Date()
    const flashSale = await FlashSale.findOne({
      isActive: true,
      startTime: { $lte: now },
      endTime: { $gte: now },
    }).lean()

    return (flashSale as unknown as IFlashSale) ?? null
  }

  // ─── listAll ──────────────────────────────────────────────────────────────────

  /**
   * Return all flash sales sorted newest-first (admin only).
   */
  async listAll(): Promise<IFlashSale[]> {
    return FlashSale.find().sort({ createdAt: -1 }).lean() as unknown as IFlashSale[]
  }

  // ─── create ───────────────────────────────────────────────────────────────────

  /**
   * Create a new flash sale.
   *
   * Business rules:
   *   - endTime must be after startTime
   *   - No overlapping active flash sales
   *
   * Throws:
   *   - 400 INVALID_TIME_RANGE — endTime <= startTime
   *   - 409 FLASH_SALE_OVERLAP  — an active sale already covers the requested window
   */
  async create(input: CreateFlashSaleInput): Promise<IFlashSale> {
    const startTime = new Date(input.startTime)
    const endTime = new Date(input.endTime)

    if (endTime <= startTime) {
      throw new AppError('endTime must be after startTime', 400, 'INVALID_TIME_RANGE')
    }

    // Check for overlapping active flash sale
    await this.assertNoOverlap(startTime, endTime)

    const flashSale = await FlashSale.create({
      ...input,
      startTime,
      endTime,
    })

    return flashSale as unknown as IFlashSale
  }

  // ─── update ───────────────────────────────────────────────────────────────────

  /**
   * Update an existing flash sale.
   *
   * When updating time fields, re-validates endTime > startTime and
   * checks for overlapping active sales (excluding the current sale).
   *
   * Throws:
   *   - 404 FLASH_SALE_NOT_FOUND — flash sale doesn't exist
   *   - 400 INVALID_TIME_RANGE   — endTime <= startTime
   *   - 409 FLASH_SALE_OVERLAP   — overlapping active sale exists
   */
  async update(id: string, input: UpdateFlashSaleInput): Promise<IFlashSale> {
    const existing = await FlashSale.findById(id)
    if (!existing) throw new AppError('Flash sale not found', 404, 'FLASH_SALE_NOT_FOUND')

    const startTime = input.startTime ? new Date(input.startTime) : existing.startTime
    const endTime = input.endTime ? new Date(input.endTime) : existing.endTime

    if (endTime <= startTime) {
      throw new AppError('endTime must be after startTime', 400, 'INVALID_TIME_RANGE')
    }

    // Check overlap if time window changed
    if (input.startTime || input.endTime) {
      await this.assertNoOverlap(startTime, endTime, id)
    }

    const update: Record<string, unknown> = { ...input }
    if (input.startTime) update.startTime = startTime
    if (input.endTime) update.endTime = endTime

    const flashSale = await FlashSale.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean()

    if (!flashSale) throw new AppError('Flash sale not found', 404, 'FLASH_SALE_NOT_FOUND')
    return flashSale as unknown as IFlashSale
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  /**
   * Throw a 409 if any OTHER active flash sale overlaps [startTime, endTime].
   * Pass `excludeId` when updating an existing sale.
   */
  private async assertNoOverlap(
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<void> {
    const filter: Record<string, unknown> = {
      isActive: true,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    }
    if (excludeId) {
      filter._id = { $ne: excludeId }
    }

    const overlap = await FlashSale.findOne(filter).lean()
    if (overlap) {
      throw new AppError(
        'An active flash sale already exists in this time window',
        409,
        'FLASH_SALE_OVERLAP',
      )
    }
  }
}

export const flashSaleService = new FlashSaleService()
