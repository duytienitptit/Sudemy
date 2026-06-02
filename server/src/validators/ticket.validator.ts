import { z } from 'zod'

// ─── Create Ticket ────────────────────────────────────────────────────────────

export const createTicketSchema = z.object({
  subject: z
    .string({ required_error: 'Subject is required' })
    .trim()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be at most 200 characters'),
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be at most 2000 characters'),
})

export type CreateTicketBody = z.infer<typeof createTicketSchema>

// ─── Update Ticket Status ─────────────────────────────────────────────────────

export const updateTicketStatusSchema = z.object({
  status: z.enum(['new', 'processing', 'resolved'], {
    required_error: 'Status is required',
    invalid_type_error: 'Invalid status',
  }),
})

export type UpdateTicketStatusBody = z.infer<typeof updateTicketStatusSchema>

// ─── Add Reply ────────────────────────────────────────────────────────────────

export const replyTicketSchema = z.object({
  message: z
    .string({ required_error: 'Message is required' })
    .trim()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be at most 2000 characters'),
})

export type ReplyTicketBody = z.infer<typeof replyTicketSchema>
