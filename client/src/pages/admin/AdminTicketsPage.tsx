import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminTickets, updateTicketStatus, addAdminTicketReply } from '@/services/ticket.service'
import type { ITicket, TicketStatus } from '@/services/ticket.service'
import { DataTable } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { MessageSquareIcon } from '@/components/ui/Icons'
import toast from 'react-hot-toast'

export default function AdminTicketsPage() {
  const [page, setPage] = useState(1)
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tickets', page],
    queryFn: () => getAdminTickets({ page, limit: 10 })
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) => updateTicketStatus(ticketId, status),
    onSuccess: () => {
      toast.success('Cập nhật trạng thái thành công')
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
    }
  })

  const replyMutation = useMutation({
    mutationFn: ({ ticketId, message }: { ticketId: string; message: string }) => addAdminTicketReply(ticketId, message),
    onSuccess: () => {
      toast.success('Đã gửi phản hồi')
      setReplyMessage('')
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] })
      setSelectedTicket(null) // close modal
    }
  })

  const handleStatusChange = (ticketId: string, status: string) => {
    updateStatusMutation.mutate({ ticketId, status: status as TicketStatus })
  }

  const handleReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return
    replyMutation.mutate({ ticketId: selectedTicket._id, message: replyMessage })
  }

  const columns = [
    {
      header: 'Mã ticket',
      accessorKey: 'ticketNumber',
      cell: (item: ITicket) => <span className="font-mono text-sm">{item.ticketNumber}</span>
    },
    {
      header: 'Người dùng',
      cell: (item: ITicket) => (
        <div>
          <p className="font-medium">{item.user.name}</p>
          <p className="text-xs text-[var(--color-on-surface-variant)]">{item.user.email}</p>
        </div>
      )
    },
    {
      header: 'Chủ đề',
      accessorKey: 'subject'
    },
    {
      header: 'Trạng thái',
      cell: (item: ITicket) => (
        <select
          value={item.status}
          onChange={(e) => handleStatusChange(item._id, e.target.value)}
          className="bg-transparent border-b border-[var(--color-outline-variant)] pb-1 text-sm outline-none"
        >
          <option value="open">Mở</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="closed">Đã đóng</option>
        </select>
      )
    },
    {
      header: 'Ngày tạo',
      cell: (item: ITicket) => new Date(item.createdAt).toLocaleDateString('vi-VN')
    },
    {
      header: 'Thao tác',
      cell: (item: ITicket) => (
        <button
          onClick={() => setSelectedTicket(item)}
          className="text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] flex items-center gap-1"
        >
          <MessageSquareIcon size={16} />
          <span className="text-sm">Phản hồi</span>
        </button>
      )
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-display-sm font-bold text-[var(--color-on-surface)]">Quản lý Hỗ trợ</h1>
          <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-2">
            Theo dõi và xử lý các yêu cầu hỗ trợ từ học viên.
          </p>
        </div>
      </div>

      <div className="elevation-1 rounded-xl p-6">
        <DataTable
          data={data?.data || []}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: data?.pagination.pages || 1,
            onPageChange: setPage
          }}
        />
      </div>

      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={`Phản hồi ticket ${selectedTicket?.ticketNumber}`}>
        {selectedTicket && (
          <div className="space-y-4">
            <div className="bg-[var(--color-surface-variant)] p-4 rounded-lg">
              <h3 className="font-semibold text-[var(--color-on-surface)]">{selectedTicket.subject}</h3>
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-1">Từ: {selectedTicket.user.name}</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[var(--color-on-surface)]">Nội dung phản hồi</label>
              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={4}
                className="w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-md p-3 text-[var(--color-on-surface)]"
                placeholder="Nhập nội dung phản hồi..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-2 rounded-md font-medium border border-[var(--color-outline-variant)] hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]"
              >
                Hủy
              </button>
              <button
                onClick={handleReply}
                disabled={!replyMessage.trim() || replyMutation.isPending}
                className="px-4 py-2 rounded-md font-medium bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
              >
                {replyMutation.isPending ? 'Đang gửi...' : 'Gửi phản hồi'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
