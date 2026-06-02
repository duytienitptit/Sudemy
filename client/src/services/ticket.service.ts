import api from '@/lib/api'

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface ITicketReply {
  _id: string
  sender: {
    _id: string
    name: string
    role: string
  }
  message: string
  attachments: string[]
  isStaffReply: boolean
  createdAt: string
}

export interface ITicket {
  _id: string
  ticketNumber: string
  user: {
    _id: string
    name: string
    email: string
  }
  subject: string
  category: string
  priority: TicketPriority
  status: TicketStatus
  replies: ITicketReply[]
  createdAt: string
  updatedAt: string
}

export interface GetTicketsParams {
  page?: number
  limit?: number
  status?: TicketStatus
  priority?: TicketPriority
  search?: string
}

interface TicketsResponse {
  success: boolean
  data: ITicket[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export const getAdminTickets = async (params?: GetTicketsParams): Promise<TicketsResponse> => {
  const { data } = await api.get<TicketsResponse>('/tickets', { params })
  return {
    success: data.success,
    data: data.data || [],
    pagination: data.pagination || { total: 0, page: 1, limit: 20, pages: 1 },
  }
}

export const updateTicketStatus = async (ticketId: string, status: TicketStatus): Promise<ITicket> => {
  const { data } = await api.patch<{ success: boolean; data: ITicket }>(`/tickets/${ticketId}/status`, { status })
  return data.data
}

export const addAdminTicketReply = async (ticketId: string, message: string): Promise<ITicket> => {
  const { data } = await api.post<{ success: boolean; data: ITicket }>(`/tickets/${ticketId}/reply`, { message })
  return data.data
}

// User facing methods
export const getUserTickets = async (): Promise<ITicket[]> => {
  const { data } = await api.get<{ success: boolean; data: ITicket[] }>('/tickets')
  return data.data
}

export const getTicket = async (ticketId: string): Promise<ITicket> => {
  const { data } = await api.get<{ success: boolean; data: ITicket }>(`/tickets/${ticketId}`)
  return data.data
}

export const createTicket = async (ticketData: { subject: string; category: string; priority: string; message: string }): Promise<ITicket> => {
  const { data } = await api.post<{ success: boolean; data: ITicket }>('/tickets', ticketData)
  return data.data
}

export const addTicketReply = async (ticketId: string, message: string): Promise<ITicket> => {
  const { data } = await api.post<{ success: boolean; data: ITicket }>(`/tickets/${ticketId}/reply`, { message })
  return data.data
}
