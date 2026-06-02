import { Schema, model, Document, Types } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IChatMessage extends Document {
  userId: Types.ObjectId
  courseId: Types.ObjectId
  lessonId: Types.ObjectId
  role: 'user' | 'assistant'
  content: string
  createdAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const chatMessageSchema = new Schema<IChatMessage>(
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
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Message role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [10000, 'Message must be at most 10,000 characters'],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Query chat history for a lesson
chatMessageSchema.index({ userId: 1, courseId: 1, lessonId: 1, createdAt: 1 })
// Rate-limit counting: user messages today
chatMessageSchema.index({ userId: 1, role: 1, createdAt: -1 })
// TTL: auto-delete messages older than 30 days to save storage
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 })

// ─── Model ────────────────────────────────────────────────────────────────────
export const ChatMessage = model<IChatMessage>('ChatMessage', chatMessageSchema)
