import { Router } from 'express'
import { verifyAuth, requireRole } from '@/middlewares/auth'
import { validate } from '@/middlewares/validate'
import { ticketController } from '@/controllers/ticket.controller'
import {
  createTicketSchema,
  updateTicketStatusSchema,
  replyTicketSchema,
} from '@/validators/ticket.validator'

const router = Router()

// All ticket routes require authentication
router.use(verifyAuth)

// ─── User Routes ──────────────────────────────────────────────────────────────
router.post('/', validate({ body: createTicketSchema }), ticketController.createTicket.bind(ticketController))
router.get('/my', ticketController.getMyTickets.bind(ticketController))

// ─── Admin/Moderator Routes ───────────────────────────────────────────────────
router.use(requireRole('admin', 'moderator'))

router.get('/', ticketController.getAllTickets.bind(ticketController))
router.patch(
  '/:id/status',
  validate({ body: updateTicketStatusSchema }),
  ticketController.updateTicketStatus.bind(ticketController),
)
router.post(
  '/:id/reply',
  validate({ body: replyTicketSchema }),
  ticketController.addReply.bind(ticketController),
)

export default router
