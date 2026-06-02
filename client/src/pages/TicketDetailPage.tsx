import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTicket, addTicketReply } from '@/services/ticket.service'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { UserIcon } from '@/components/ui/Icons'
import toast from 'react-hot-toast'

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [replyMessage, setReplyMessage] = useState('')
  const queryClient = useQueryClient()

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicket(id as string),
    enabled: !!id
  })

  const replyMutation = useMutation({
    mutationFn: (message: string) => addTicketReply(id as string, message),
    onSuccess: () => {
      toast.success('Reply sent')
      setReplyMessage('')
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    },
    onError: () => {
      toast.error('Failed to send reply')
    }
  })

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim()) return
    replyMutation.mutate(replyMessage)
  }

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-[var(--color-on-surface-variant)]">Loading ticket details...</div>
  }

  if (!ticket) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-500">Ticket not found.</div>
  }

  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
      <Link to="/support" className="text-sm font-medium text-[var(--color-primary)] hover:underline mb-6 inline-block">
        ← Back to Support Center
      </Link>
      
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="p-6 md:p-8 border-b border-[var(--color-border)]">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <h1 className="text-title-lg md:text-display-sm font-bold text-[var(--color-on-surface)]">
              {ticket.subject}
            </h1>
            <StatusBadge status={ticket.status} />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-on-surface-variant)]">
            <span className="font-mono">#{ticket.ticketNumber}</span>
            <span>Category: <span className="capitalize">{ticket.category}</span></span>
            <span>Priority: <span className="capitalize">{ticket.priority}</span></span>
            <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className="p-6 md:p-8 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="space-y-6">
            {ticket.replies.map((reply, idx) => (
              <div key={reply._id || idx} className={`flex gap-4 ${reply.isStaffReply ? '' : 'flex-row-reverse'}`}>
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface-variant)] flex items-center justify-center shrink-0">
                  {reply.isStaffReply ? <span className="text-xl">🛡️</span> : <UserIcon size={20} />}
                </div>
                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                  reply.isStaffReply 
                    ? 'bg-white dark:bg-[#1A1D21] border border-[var(--color-border)]' 
                    : 'bg-[var(--color-primary)] text-white'
                }`}>
                  <div className={`text-xs font-medium mb-1 ${reply.isStaffReply ? 'text-[var(--color-on-surface-variant)]' : 'text-white/80'}`}>
                    {reply.sender.name} • {new Date(reply.createdAt).toLocaleString()}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {reply.message}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {!isClosed && (
          <div className="p-6 md:p-8 border-t border-[var(--color-border)]">
            <form onSubmit={handleReply}>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Type your reply here..."
                rows={4}
                className="w-full bg-transparent border border-[var(--color-border)] rounded-xl p-4 focus:outline-none focus:border-[var(--color-primary)] resize-none"
              />
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={!replyMessage.trim() || replyMutation.isPending}
                  className="bg-[var(--color-primary)] text-white font-medium py-2 px-6 rounded-full hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
                >
                  {replyMutation.isPending ? 'Sending...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        )}
        {isClosed && (
          <div className="p-6 border-t border-[var(--color-border)] bg-[var(--color-surface-variant)]/30 text-center text-sm text-[var(--color-on-surface-variant)]">
            This ticket is closed. You cannot reply to it anymore.
          </div>
        )}
      </div>
    </div>
  )
}
