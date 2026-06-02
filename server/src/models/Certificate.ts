import { Schema, model, Document, Types } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface ICertificate extends Document {
  userId: Types.ObjectId
  courseId: Types.ObjectId
  verificationCode: string
  issuedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const certificateSchema = new Schema<ICertificate>(
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
    verificationCode: {
      type: String,
      required: [true, 'Verification code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Z0-9]{8}$/, 'Verification code must be 8 alphanumeric characters'],
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
certificateSchema.index({ userId: 1 })
// One certificate per user per course
certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true })

// ─── Model ────────────────────────────────────────────────────────────────────
export const Certificate = model<ICertificate>('Certificate', certificateSchema)
