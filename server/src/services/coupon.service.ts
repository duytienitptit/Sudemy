import { Coupon, ICoupon } from '@/models/Coupon'
import { Course } from '@/models/Course'
import { AppError } from '@/middlewares/errorHandler'

// ─── Input Types ───────────────────────────────────────────────────────────────

export interface CreateCouponInput {
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxUses?: number
  expiresAt?: string
  isActive?: boolean
}

export type UpdateCouponInput = Partial<CreateCouponInput>

export interface ValidateCouponInput {
  code: string
  courseId: string
}

export interface ValidateCouponResult {
  valid: true
  discountType: 'percent' | 'fixed'
  discountValue: number
  finalPrice: number
}

// ─── CouponService ─────────────────────────────────────────────────────────────

export class CouponService {
  // ─── listAll ──────────────────────────────────────────────────────────────────

  /**
   * Return all coupons sorted newest-first (admin/moderator).
   */
  async listAll(): Promise<ICoupon[]> {
    return Coupon.find().sort({ createdAt: -1 }).lean() as unknown as ICoupon[]
  }

  // ─── create ───────────────────────────────────────────────────────────────────

  /**
   * Create a new coupon.
   *
   * Validation rules (beyond schema):
   *   - discountType 'percent' → discountValue must be ≤ 100
   *   - code is automatically uppercased (schema also enforces this)
   *   - duplicate code → Mongoose throws 11000 (unique index), we re-raise as 409
   *
   * Throws:
   *   - 400 INVALID_DISCOUNT — percent discount > 100
   *   - 409 COUPON_CODE_EXISTS — duplicate code
   */
  async create(input: CreateCouponInput): Promise<ICoupon> {
    // Business rule: percent discount cannot exceed 100
    if (input.discountType === 'percent' && input.discountValue > 100) {
      throw new AppError('Percent discount cannot exceed 100', 400, 'INVALID_DISCOUNT')
    }

    try {
      const coupon = await Coupon.create({
        ...input,
        code: input.code.toUpperCase(),
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
      })
      return coupon as unknown as ICoupon
    } catch (err: any) {
      if (err.code === 11000) {
        throw new AppError('A coupon with this code already exists', 409, 'COUPON_CODE_EXISTS')
      }
      throw err
    }
  }

  // ─── update ───────────────────────────────────────────────────────────────────

  /**
   * Update an existing coupon.
   *
   * Throws:
   *   - 404 COUPON_NOT_FOUND — coupon doesn't exist
   *   - 400 INVALID_DISCOUNT — percent discount > 100 after update
   */
  async update(id: string, input: UpdateCouponInput): Promise<ICoupon> {
    if (
      input.discountType === 'percent' &&
      input.discountValue !== undefined &&
      input.discountValue > 100
    ) {
      throw new AppError('Percent discount cannot exceed 100', 400, 'INVALID_DISCOUNT')
    }

    const update: Record<string, unknown> = { ...input }
    if (input.expiresAt) update.expiresAt = new Date(input.expiresAt)

    const coupon = await Coupon.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean()

    if (!coupon) throw new AppError('Coupon not found', 404, 'COUPON_NOT_FOUND')
    return coupon as unknown as ICoupon
  }

  // ─── remove ───────────────────────────────────────────────────────────────────

  /**
   * Delete a coupon by ID.
   *
   * Throws:
   *   - 404 COUPON_NOT_FOUND — coupon doesn't exist
   */
  async remove(id: string): Promise<void> {
    const coupon = await Coupon.findByIdAndDelete(id)
    if (!coupon) throw new AppError('Coupon not found', 404, 'COUPON_NOT_FOUND')
  }

  // ─── validate ─────────────────────────────────────────────────────────────────

  /**
   * Validate a coupon code against a specific course.
   *
   * Returns the discount details and calculated finalPrice.
   *
   * Throws:
   *   - 404 COURSE_NOT_FOUND  — course not found
   *   - 400 INVALID_COUPON    — coupon code invalid or inactive
   *   - 400 COUPON_EXPIRED    — coupon past expiresAt
   *   - 400 COUPON_MAXED      — usedCount >= maxUses
   */
  async validate(input: ValidateCouponInput): Promise<ValidateCouponResult> {
    const { code, courseId } = input

    const course = await Course.findById(courseId).lean()
    if (!course) throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND')

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true,
    }).lean()

    if (!coupon) {
      throw new AppError('Coupon code is invalid or inactive', 400, 'INVALID_COUPON')
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new AppError('Coupon has expired', 400, 'COUPON_EXPIRED')
    }

    if (coupon.maxUses !== undefined && coupon.usedCount >= coupon.maxUses) {
      throw new AppError('Coupon usage limit has been reached', 400, 'COUPON_MAXED')
    }

    let finalPrice: number
    if (coupon.discountType === 'percent') {
      finalPrice = Math.round((course as any).price * (1 - coupon.discountValue / 100))
    } else {
      finalPrice = Math.max(0, (course as any).price - coupon.discountValue)
    }

    return {
      valid: true,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      finalPrice,
    }
  }
}

export const couponService = new CouponService()
