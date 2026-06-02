import { Schema, model, Document, Types } from 'mongoose'

// ─── Nested Interface ─────────────────────────────────────────────────────────
export interface ITicketReply {
  message: string
  repliedBy: Types.ObjectId
  repliedAt: Date
}

// ─── TypeScript Interface ──────────────────────────────────────────────────────
export interface ITicket extends Document {
  userId: Types.ObjectId
  subject: string
  message: string
  status: 'new' | 'processing' | 'resolved'
  replies: ITicketReply[]
  createdAt: Date
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const ticketReplySchema = new Schema<ITicketReply>(
  {
    message: { type: String, required: true, trim: true },
    repliedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    repliedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const ticketSchema = new Schema<ITicket>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters'],
      maxlength: [200, 'Subject must be at most 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [10, 'Message must be at least 10 characters'],
      maxlength: [2000, 'Message must be at most 2000 characters'],
    },
    status: {
      type: String,
      enum: ['new', 'processing', 'resolved'],
      default: 'new',
    },
    replies: {
      type: [ticketReplySchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  },
)

// ─── Indexes ──────────────────────────────────────────────────────────────────
ticketSchema.index({ userId: 1 })
ticketSchema.index({ status: 1, createdAt: -1 })

// ─── Model ────────────────────────────────────────────────────────────────────
export const Ticket = model<ITicket>('Ticket', ticketSchema)
