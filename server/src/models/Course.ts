import slugify from 'slugify'
import { Schema, model, Document } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface ICourse extends Document {
  title: string
  slug: string
  description: string
  thumbnail: string
  price: number
  originalPrice?: number
  instructor: string
  status: 'draft' | 'published' | 'archived'
  totalLessons: number
  previewLessons: number
  ratings: { average: number; count: number }
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [200, 'Title must be at most 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [10, 'Description must be at least 10 characters'],
    },
    thumbnail: {
      type: String,
      required: [true, 'Course thumbnail URL is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price must be non-negative'],
      default: 0,
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be non-negative'],
    },
    instructor: {
      type: String,
      required: [true, 'Instructor name is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    totalLessons: {
      type: Number,
      default: 0,
      min: 0,
    },
    previewLessons: {
      type: Number,
      default: 2,
      min: 0,
    },
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
courseSchema.index({ status: 1 })
courseSchema.index({ title: 'text', description: 'text' })

// ─── Pre-Save Hook: Slug Generation ───────────────────────────────────────────
courseSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    const baseSlug = slugify(this.title, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1
    while (await (this.constructor as typeof Course).findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${++counter}`
    }
    this.slug = slug
  }
  next()
})

// ─── Model ────────────────────────────────────────────────────────────────────
export const Course = model<ICourse>('Course', courseSchema)
