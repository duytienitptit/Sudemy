import { Types } from 'mongoose'
import { ticketService } from '../ticket.service'
import { Ticket } from '@/models/Ticket'
import { User } from '@/models/User'
import { AppError } from '@/middlewares/errorHandler'
import { sendTicketReplyEmail } from '@/lib/email'

jest.mock('@/models/Ticket', () => ({
  Ticket: {
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findById: jest.fn(),
  },
}))

jest.mock('@/lib/email')
const mockSendTicketReplyEmail = sendTicketReplyEmail as jest.Mock
mockSendTicketReplyEmail.mockResolvedValue(undefined)


const mockCreate = Ticket.create as jest.Mock
const mockFind = Ticket.find as jest.Mock
const mockCountDocuments = Ticket.countDocuments as jest.Mock
const mockFindByIdAndUpdate = Ticket.findByIdAndUpdate as jest.Mock
const mockFindById = Ticket.findById as jest.Mock

const USER_ID = new Types.ObjectId().toString()
const ADMIN_ID = new Types.ObjectId().toString()
const TICKET_ID = new Types.ObjectId().toString()

describe('TicketService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSendTicketReplyEmail.mockResolvedValue(undefined)
  })

  describe('createTicket', () => {
    it('creates a new ticket', async () => {
      const data = { subject: 'Test', message: 'Hello' }
      const mockResult = { _id: TICKET_ID, ...data, userId: USER_ID, status: 'new' }
      mockCreate.mockResolvedValue(mockResult)

      const result = await ticketService.createTicket(USER_ID, data)

      expect(mockCreate).toHaveBeenCalledWith({
        userId: USER_ID,
        subject: 'Test',
        message: 'Hello',
        status: 'new',
      })
      expect(result).toEqual(mockResult)
    })
  })

  describe('getMyTickets', () => {
    it('returns sorted tickets for user', async () => {
      const chainMock = {
        sort: jest.fn().mockResolvedValue([{ subject: 'Test' }]),
      }
      mockFind.mockReturnValue(chainMock)

      const result = await ticketService.getMyTickets(USER_ID)

      expect(mockFind).toHaveBeenCalledWith({ userId: USER_ID })
      expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
      expect(result).toHaveLength(1)
    })
  })

  describe('getAllTickets', () => {
    it('returns paginated tickets with filter', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ subject: 'Test' }]),
      }
      mockFind.mockReturnValue(chainMock)
      mockCountDocuments.mockResolvedValue(1)

      const result = await ticketService.getAllTickets({ page: 1, limit: 10, status: 'processing' })

      expect(mockFind).toHaveBeenCalledWith({ status: 'processing' })
      expect(chainMock.skip).toHaveBeenCalledWith(0)
      expect(chainMock.limit).toHaveBeenCalledWith(10)
      expect(result.pagination.total).toBe(1)
    })
  })

  describe('updateTicketStatus', () => {
    it('updates the status', async () => {
      mockFindByIdAndUpdate.mockResolvedValue({ status: 'resolved' })

      const result = await ticketService.updateTicketStatus(TICKET_ID, 'resolved')

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith(
        TICKET_ID,
        { status: 'resolved' },
        { new: true, runValidators: true }
      )
      expect(result.status).toBe('resolved')
    })

    it('throws AppError if not found', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null)
      await expect(ticketService.updateTicketStatus(TICKET_ID, 'resolved')).rejects.toThrow(AppError)
    })
  })

  describe('addReply', () => {
    it('adds a reply and changes status if new, sends email', async () => {
      const mockTicket = {
        _id: TICKET_ID,
        userId: { fullName: 'Test User', email: 'test@test.com' }, // Populated
        subject: 'My Subject',
        status: 'new',
        replies: [],
        save: jest.fn().mockResolvedValue(true),
      }

      const chainMock = {
        populate: jest.fn().mockResolvedValue(mockTicket),
      }
      mockFindById.mockReturnValue(chainMock)

      await ticketService.addReply(TICKET_ID, ADMIN_ID, 'A reply')

      expect(mockTicket.replies).toHaveLength(1)
      expect(mockTicket.status).toBe('processing')
      expect(mockTicket.save).toHaveBeenCalled()
      expect(sendTicketReplyEmail).toHaveBeenCalledWith('test@test.com', 'Test User', 'My Subject', 'A reply')
    })
  })
})
