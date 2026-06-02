import { Ticket, ITicket } from '@/models/Ticket'
import { AppError } from '@/middlewares/errorHandler'
import { sendTicketReplyEmail } from '@/lib/email'

export class TicketService {
  /**
   * Create a new support ticket
   */
  async createTicket(userId: string, data: { subject: string; message: string }): Promise<ITicket> {
    const ticket = await Ticket.create({
      userId,
      subject: data.subject,
      message: data.message,
      status: 'new',
    })
    return ticket
  }

  /**
   * Get tickets for the authenticated user
   */
  async getMyTickets(userId: string): Promise<ITicket[]> {
    return Ticket.find({ userId }).sort({ createdAt: -1 })
  }

  /**
   * Get all tickets (for Admin/Moderator)
   */
  async getAllTickets(query: {
    page?: number
    limit?: number
    status?: string
  }) {
    const page = Math.max(1, query.page || 1)
    const limit = Math.max(1, Math.min(100, query.limit || 20))
    const skip = (page - 1) * limit

    const filter: any = {}
    if (query.status && ['new', 'processing', 'resolved'].includes(query.status)) {
      filter.status = query.status
    }

    const [tickets, total] = await Promise.all([
      Ticket.find(filter)
        .populate('userId', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Ticket.countDocuments(filter),
    ])

    return {
      tickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Update the status of a ticket
   */
  async updateTicketStatus(ticketId: string, status: 'new' | 'processing' | 'resolved'): Promise<ITicket> {
    const ticket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status },
      { new: true, runValidators: true },
    )
    if (!ticket) {
      throw new AppError('Ticket not found', 404)
    }
    return ticket
  }

  /**
   * Add a reply to a ticket
   */
  async addReply(ticketId: string, adminId: string, message: string): Promise<ITicket> {
    const ticket = await Ticket.findById(ticketId).populate('userId', 'fullName email')
    if (!ticket) {
      throw new AppError('Ticket not found', 404)
    }

    // Add reply
    ticket.replies.push({
      message,
      repliedBy: adminId as any,
      repliedAt: new Date(),
    })

    // Auto-update status to 'processing' if it is 'new'
    if (ticket.status === 'new') {
      ticket.status = 'processing'
    }

    await ticket.save()

    // Send email notification to user asynchronously
    const user = ticket.userId as any // populated
    if (user && user.email) {
      // Background email send
      sendTicketReplyEmail(user.email, user.fullName, ticket.subject, message).catch(console.error)
    }

    return ticket
  }
}

export const ticketService = new TicketService()
