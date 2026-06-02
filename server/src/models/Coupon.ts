import { Schema, model, Document } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface ICoupon extends Document {
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  maxUses?: number
  usedCount: number
  expiresAt?: Date
  isActive: boolean
  createdAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]+$/, 'Coupon code must be alphanumeric uppercase'],
    },
    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      required: [true, 'Discount type is required'],
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount value must be non-negative'],
    },
    maxUses: {
      type: Number,
      min: [1, 'Max uses must be at least 1'],
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
couponSchema.index({ expiresAt: 1 })

// ─── Model ────────────────────────────────────────────────────────────────────
export const Coupon = model<ICoupon>('Coupon', couponSchema)
