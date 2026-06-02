import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { getUserTickets, createTicket } from '@/services/ticket.service'
import type { ITicket } from '@/services/ticket.service'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const ticketSchema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.enum(['technical', 'billing', 'content', 'other']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  message: z.string().min(10, 'Please provide more details in your message')
})

type TicketFormData = z.infer<typeof ticketSchema>

export default function SupportPage() {
  const [isCreating, setIsCreating] = useState(false)
  const queryClient = useQueryClient()

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['my-tickets'],
    queryFn: getUserTickets
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      category: 'technical',
      priority: 'medium'
    }
  })

  const createMutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      toast.success('Support ticket created successfully')
      reset()
      setIsCreating(false)
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
    },
    onError: () => {
      toast.error('Failed to create ticket')
    }
  })

  const onSubmit = (data: TicketFormData) => {
    createMutation.mutate(data)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-display-md font-bold text-[var(--color-on-surface)]">Support Center</h1>
          <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-2">
            Need help? We're here for you. Create a ticket or view your past requests.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-[var(--color-primary)] text-white font-medium py-2 px-6 rounded-full hover:bg-[var(--color-primary-dark)] transition-colors"
        >
          {isCreating ? 'View My Tickets' : 'Create New Ticket'}
        </button>
      </div>

      {isCreating ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-title-lg font-semibold text-[var(--color-on-surface)] mb-6">Create a Support Ticket</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Subject</label>
              <input 
                {...register('subject')}
                className="w-full bg-transparent border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="Briefly describe your issue..."
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Category</label>
                <select 
                  {...register('category')}
                  className="w-full bg-transparent border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="content">Course Content</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Priority</label>
                <select 
                  {...register('priority')}
                  className="w-full bg-transparent border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Message</label>
              <textarea 
                {...register('message')}
                rows={6}
                className="w-full bg-transparent border border-[var(--color-border)] rounded-lg px-4 py-3 focus:outline-none focus:border-[var(--color-primary)]"
                placeholder="Please provide as much detail as possible..."
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <button 
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-[var(--color-primary)] text-white font-medium py-3 rounded-lg hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {createMutation.isPending ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-[var(--color-on-surface-variant)]">Loading your tickets...</div>
          ) : !tickets || tickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-[var(--color-surface-variant)] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🎟️</div>
              <h3 className="text-title-lg font-semibold text-[var(--color-on-surface)] mb-2">No tickets found</h3>
              <p className="text-[var(--color-on-surface-variant)]">You haven't submitted any support requests yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[var(--color-surface-variant)]/30 border-b border-[var(--color-border)]">
                    <th className="p-4 font-medium text-[var(--color-on-surface-variant)]">Ticket #</th>
                    <th className="p-4 font-medium text-[var(--color-on-surface-variant)]">Subject</th>
                    <th className="p-4 font-medium text-[var(--color-on-surface-variant)]">Status</th>
                    <th className="p-4 font-medium text-[var(--color-on-surface-variant)]">Updated</th>
                    <th className="p-4 font-medium text-[var(--color-on-surface-variant)]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket: ITicket) => (
                    <tr key={ticket._id} className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-variant)]/10">
                      <td className="p-4 font-mono text-sm">{ticket.ticketNumber}</td>
                      <td className="p-4 font-medium text-[var(--color-on-surface)]">{ticket.subject}</td>
                      <td className="p-4"><StatusBadge status={ticket.status} /></td>
                      <td className="p-4 text-sm text-[var(--color-on-surface-variant)]">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <Link to={`/support/${ticket._id}`} className="text-[var(--color-primary)] font-medium hover:underline text-sm">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
