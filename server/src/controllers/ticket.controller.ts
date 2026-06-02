import { Request, Response, NextFunction } from 'express'
import { ticketService } from '@/services/ticket.service'

export class TicketController {
  /**
   * POST /api/v1/tickets
   * Create a new support ticket
   */
  async createTicket(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.createTicket(String(req.user!._id), req.body)
      res.status(201).json({ success: true, data: { ticket }, message: 'Ticket submitted successfully' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/tickets/my
   * Get tickets for the authenticated user
   */
  async getMyTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await ticketService.getMyTickets(String(req.user!._id))
      res.json({ success: true, data: tickets })
    } catch (error) {
      next(error)
    }
  }

  /**
   * GET /api/v1/tickets
   * Admin/Moderator: Get all tickets with pagination & filters
   */
  async getAllTickets(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 20
      const status = req.query.status as string

      const result = await ticketService.getAllTickets({ page, limit, status })
      res.json({
        success: true,
        data: result.tickets,
        message: 'Tickets retrieved',
        pagination: result.pagination,
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * PATCH /api/v1/tickets/:id/status
   * Admin/Moderator: Update ticket status
   */
  async updateTicketStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.updateTicketStatus(String(req.params.id), req.body.status)
      res.json({ success: true, data: { ticket }, message: 'Ticket status updated' })
    } catch (error) {
      next(error)
    }
  }

  /**
   * POST /api/v1/tickets/:id/reply
   * Admin/Moderator: Add reply to ticket
   */
  async addReply(req: Request, res: Response, next: NextFunction) {
    try {
      const ticket = await ticketService.addReply(String(req.params.id), String(req.user!._id), req.body.message)
      res.json({ success: true, data: { ticket }, message: 'Reply sent successfully' })
    } catch (error) {
      next(error)
    }
  }
}

export const ticketController = new TicketController()
