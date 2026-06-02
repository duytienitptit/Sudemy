import { Schema, model, Document, Types } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IUser extends Document {
  firebaseUid: string
  fullName: string
  email: string
  role: 'user' | 'editor' | 'moderator' | 'admin'
  purchasedCourses: Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: [true, 'Firebase UID is required'],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [50, 'Full name must be at most 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    role: {
      type: String,
      enum: ['user', 'editor', 'moderator', 'admin'],
      default: 'user',
    },
    purchasedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 })

// ─── Model ────────────────────────────────────────────────────────────────────
export const User = model<IUser>('User', userSchema)
