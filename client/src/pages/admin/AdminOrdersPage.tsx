import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, ShoppingBag } from 'lucide-react'
import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { getAdminOrders } from '@/services/payment.service'
import type { Order, OrderStatus } from '@/types/payment.types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ thanh toán',
  completed: 'Hoàn thành',
  failed: 'Thất bại',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'amber',
  completed: 'green',
  failed: 'red',
}

function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

// ─── Order status filter options ──────────────────────────────────────────────

const STATUS_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ thanh toán', value: 'pending' },
  { label: 'Hoàn thành', value: 'completed' },
  { label: 'Thất bại', value: 'failed' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, statusFilter],
    queryFn: () => getAdminOrders({ page, limit: 10, status: statusFilter || undefined }),
  })

  const columns: ColumnDef<Order>[] = [
    {
      header: 'Mã đơn',
      accessorKey: '_id',
      cell: (order: Order) => (
        <span className="font-mono text-xs text-[var(--color-on-surface-variant)]">
          #{order._id.slice(-8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Khóa học',
      cell: (order: Order) => (
        <span className="font-medium text-[var(--color-on-surface)] line-clamp-1">
          {typeof order.courseId === 'object' ? order.courseId.title : '—'}
        </span>
      ),
    },
    {
      header: 'Số tiền',
      accessorKey: 'amount',
      cell: (order: Order) => (
        <span className="font-semibold text-[var(--color-primary)]">
          {formatVND(order.amount)}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: (order: Order) => {
        const color = STATUS_COLORS[order.status]
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
              ${color === 'green' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]' : ''}
              ${color === 'amber' ? 'bg-[var(--color-tertiary-light)] text-[var(--color-tertiary-container)]' : ''}
              ${color === 'red' ? 'bg-[var(--color-error-container)] text-[var(--color-error)]' : ''}
            `}
          >
            {STATUS_LABELS[order.status]}
          </span>
        )
      },
    },
    {
      header: 'Ngày đặt',
      cell: (order: Order) => (
        <span className="text-sm text-[var(--color-on-surface-variant)]">
          {formatDate(order.createdAt)}
        </span>
      ),
    },
    {
      header: 'Chi tiết',
      accessorKey: '_id',
      cell: (order: Order) => (
        <button
          onClick={() => setSelectedOrder(order)}
          className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
          title="Xem chi tiết"
        >
          <Eye size={16} />
        </button>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)] flex items-center gap-2">
            <ShoppingBag size={26} className="text-[var(--color-primary)]" />
            Quản lý Đơn hàng
          </h1>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">
            Theo dõi và kiểm tra toàn bộ đơn hàng trên hệ thống.
          </p>
        </div>

        {/* Status filter */}
        <select
          id="order-status-filter"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface)] text-[var(--color-on-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="elevation-1 rounded-2xl overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: data?.pagination?.pages || 1,
            onPageChange: setPage,
          }}
        />
      </div>

      {/* Order detail modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Chi tiết đơn hàng #${selectedOrder?._id.slice(-8).toUpperCase() ?? ''}`}
        maxWidth="max-w-xl"
      >
        {selectedOrder && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Mã đơn" value={`#${selectedOrder._id.slice(-8).toUpperCase()}`} mono />
              <Detail
                label="Trạng thái"
                value={STATUS_LABELS[selectedOrder.status]}
                color={STATUS_COLORS[selectedOrder.status] as 'green' | 'amber' | 'red'}
              />
              <Detail
                label="Khóa học"
                value={typeof selectedOrder.courseId === 'object' ? selectedOrder.courseId.title : selectedOrder.courseId}
              />
              <Detail label="Số tiền" value={formatVND(selectedOrder.amount)} />
              {selectedOrder.originalAmount !== selectedOrder.amount && (
                <Detail label="Giá gốc" value={formatVND(selectedOrder.originalAmount)} />
              )}
              {selectedOrder.couponId && (
                <Detail label="Mã coupon" value={String(selectedOrder.couponId)} mono />
              )}
              {selectedOrder.payosOrderId && (
                <Detail label="PayOS ID" value={selectedOrder.payosOrderId} mono />
              )}
              <Detail label="Ngày tạo" value={formatDate(selectedOrder.createdAt)} />
              <Detail label="Cập nhật" value={formatDate(selectedOrder.updatedAt)} />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

// ─── Detail row helper ────────────────────────────────────────────────────────

function Detail({
  label,
  value,
  mono = false,
  color,
}: {
  label: string
  value: string
  mono?: boolean
  color?: 'green' | 'amber' | 'red'
}) {
  return (
    <div className="bg-[var(--color-surface-variant)]/50 rounded-lg p-3">
      <p className="text-xs text-[var(--color-on-surface-variant)] mb-0.5">{label}</p>
      <p
        className={`font-medium truncate
          ${mono ? 'font-mono text-xs' : ''}
          ${color === 'green' ? 'text-[var(--color-primary)]' : ''}
          ${color === 'amber' ? 'text-[var(--color-tertiary-container)]' : ''}
          ${color === 'red' ? 'text-[var(--color-error)]' : ''}
          ${!color ? 'text-[var(--color-on-surface)]' : ''}
        `}
      >
        {value}
      </p>
    </div>
  )
}
