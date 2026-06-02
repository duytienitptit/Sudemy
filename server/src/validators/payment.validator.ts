import { z } from 'zod'

// ─── Create Order ─────────────────────────────────────────────────────────────

export const createOrderSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  couponCode: z.string().optional(),
})

export type CreateOrderBody = z.infer<typeof createOrderSchema>

// ─── Coupon Validate ──────────────────────────────────────────────────────────

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  courseId: z.string().min(1, 'courseId is required'),
})

export type ValidateCouponBody = z.infer<typeof validateCouponSchema>

// ─── Admin: Create Coupon ─────────────────────────────────────────────────────

export const createCouponSchema = z.object({
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .max(20, 'Code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Code must be uppercase alphanumeric')
    .transform((v) => v.toUpperCase()),
  discountType: z.enum(['percent', 'fixed']),
  discountValue: z.number().positive('discountValue must be positive'),
  maxUses: z.number().int().min(1).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional().default(true),
})

export type CreateCouponBody = z.infer<typeof createCouponSchema>

// ─── Admin: Update Coupon ─────────────────────────────────────────────────────

export const updateCouponSchema = createCouponSchema.partial()

export type UpdateCouponBody = z.infer<typeof updateCouponSchema>

// ─── Flash Sale ───────────────────────────────────────────────────────────────

export const createFlashSaleSchema = z
  .object({
    name: z.string().min(1, 'Flash sale name is required').max(100),
    discountPercent: z
      .number()
      .int()
      .min(1, 'discountPercent must be at least 1')
      .max(99, 'discountPercent must be at most 99'),
    startTime: z.string().datetime('startTime must be a valid ISO datetime'),
    endTime: z.string().datetime('endTime must be a valid ISO datetime'),
    isActive: z.boolean().optional().default(true),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  })

export type CreateFlashSaleBody = z.infer<typeof createFlashSaleSchema>

export const updateFlashSaleSchema = z
  .object({
    name: z.string().min(1, 'Flash sale name is required').max(100).optional(),
    discountPercent: z
      .number()
      .int()
      .min(1, 'discountPercent must be at least 1')
      .max(99, 'discountPercent must be at most 99')
      .optional(),
    startTime: z.string().datetime('startTime must be a valid ISO datetime').optional(),
    endTime: z.string().datetime('endTime must be a valid ISO datetime').optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (data) =>
      !data.startTime || !data.endTime || new Date(data.endTime) > new Date(data.startTime),
    { message: 'endTime must be after startTime', path: ['endTime'] },
  )

export type UpdateFlashSaleBody = z.infer<typeof updateFlashSaleSchema>
