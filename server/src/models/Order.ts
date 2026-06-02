import { Schema, model, Document, Types } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IOrder extends Document {
  userId: Types.ObjectId
  courseId: Types.ObjectId
  amount: number
  originalAmount: number
  couponId?: Types.ObjectId
  payosOrderId: string
  payosTransactionId?: string
  status: 'pending' | 'completed' | 'failed'
  idempotencyKey: string
  createdAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be non-negative'],
    },
    originalAmount: {
      type: Number,
      required: [true, 'Original amount is required'],
      min: [0, 'Original amount must be non-negative'],
    },
    couponId: {
      type: Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    payosOrderId: {
      type: String,
      required: [true, 'PayOS Order ID is required'],
      unique: true,
      trim: true,
    },
    payosTransactionId: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    idempotencyKey: {
      type: String,
      required: [true, 'Idempotency key is required'],
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
orderSchema.index({ userId: 1 })

// ─── Model ────────────────────────────────────────────────────────────────────
export const Order = model<IOrder>('Order', orderSchema)
