import slugify from 'slugify'
import { Schema, model, Document } from 'mongoose'

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface IPrompt extends Document {
  title: string
  slug: string
  content: string
  type: 'image' | 'video'
  sampleImage?: string // only for image prompts
  copyCount: number
  createdAt: Date
  updatedAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const promptSchema = new Schema<IPrompt>(
  {
    title: {
      type: String,
      required: [true, 'Tiêu đề prompt là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung prompt là bắt buộc'],
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: [true, 'Loại prompt là bắt buộc (image/video)'],
      default: 'video',
    },
    sampleImage: {
      type: String,
      trim: true,
    },
    copyCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
promptSchema.index({ type: 1 })
promptSchema.index({ title: 'text', content: 'text' })

// ─── Pre-Save Hook: Slug Generation ───────────────────────────────────────────
promptSchema.pre('save', async function (next) {
  if (this.isModified('title') || this.isNew) {
    const baseSlug = slugify(this.title, { lower: true, strict: true })
    let slug = baseSlug
    let counter = 1
    while (await (this.constructor as typeof Prompt).findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${++counter}`
    }
    this.slug = slug
  }
  next()
})

// ─── Model ────────────────────────────────────────────────────────────────────
export const Prompt = model<IPrompt>('Prompt', promptSchema)
