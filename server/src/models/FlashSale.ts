import { Schema, model, Document } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IFlashSale extends Document {
  name: string
  discountPercent: number
  startTime: Date
  endTime: Date
  isActive: boolean
  createdAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const flashSaleSchema = new Schema<IFlashSale>(
  {
    name: {
      type: String,
      required: [true, 'Flash sale name is required'],
      trim: true,
    },
    discountPercent: {
      type: Number,
      required: [true, 'Discount percent is required'],
      min: [1, 'Discount must be at least 1%'],
      max: [99, 'Discount must be at most 99%'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
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
flashSaleSchema.index({ isActive: 1, startTime: 1, endTime: 1 })

// ─── Model ────────────────────────────────────────────────────────────────────
export const FlashSale = model<IFlashSale>('FlashSale', flashSaleSchema)
