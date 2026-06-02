import slugify from 'slugify'
import { Schema, model, Document, Types } from 'mongoose'

// ─── Nested Interfaces ─────────────────────────────────────────────────────────
export interface IQuizItem {
  question: string
  options: string[]
  correctAnswer: number
}

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface ILesson extends Document {
  courseId: Types.ObjectId
  title: string
  slug: string
  youtubeUrl: string
  order: number
  isFree: boolean
  quiz: IQuizItem[]
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const quizItemSchema = new Schema<IQuizItem>(
  {
    question: { type: String, required: true, trim: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const lessonSchema = new Schema<ILesson>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Lesson title is required'],
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Lesson order is required'],
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    quiz: {
      type: [quizItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Compound: order unique within course
lessonSchema.index({ courseId: 1, order: 1 }, { unique: true })
// Compound: slug unique within course
lessonSchema.index({ courseId: 1, slug: 1 }, { unique: true })

// ─── Pre-Save Hook: Slug Generation ───────────────────────────────────────────
lessonSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    const baseSlug = slugify(this.title, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1
    // Slug uniqueness scoped to courseId
    while (
      await (this.constructor as typeof Lesson).findOne({
        courseId: this.courseId,
        slug,
        _id: { $ne: this._id },
      })
    ) {
      slug = `${baseSlug}-${++counter}`
    }
    this.slug = slug
  }
  next()
})

// ─── Model ────────────────────────────────────────────────────────────────────
export const Lesson = model<ILesson>('Lesson', lessonSchema)
