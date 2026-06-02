import { Schema, model, Document, Types } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IProgress extends Document {
  userId: Types.ObjectId
  courseId: Types.ObjectId
  lessonId: Types.ObjectId
  completed: boolean
  quizScore?: number
  completedAt?: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const progressSchema = new Schema<IProgress>(
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
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: [true, 'Lesson ID is required'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    quizScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
progressSchema.index({ userId: 1, courseId: 1 })
// One progress record per user per lesson — globally unique
progressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true })

// ─── Model ────────────────────────────────────────────────────────────────────
export const Progress = model<IProgress>('Progress', progressSchema)
