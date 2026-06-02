import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Receipt, PlayCircle, Clock, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import { getMyOrders } from '@/services/payment.service'
import type { Order } from '@/types/payment.types'

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Order['status'] }) {
  const map = {
    completed: {
      label: 'Thành công',
      icon: CheckCircle2,
      className: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300',
    },
    pending: {
      label: 'Đang xử lý',
      icon: Clock,
      className: 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300',
    },
    failed: {
      label: 'Thất bại',
      icon: XCircle,
      className: 'text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300',
    },
  }
  const { label, icon: Icon, className } = map[status] ?? map.failed

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

// ── Order row ─────────────────────────────────────────────────────────────────

function OrderRow({ order }: { order: Order }) {
  const course =
    order.courseId && typeof order.courseId !== 'string' ? order.courseId : null

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl hover:border-[var(--color-primary)] transition-all group">
      {/* Thumbnail */}
      {course && (
        <div className="w-full sm:w-24 h-14 sm:h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--color-on-surface)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
          {course ? course.title : `Đơn hàng #${order._id.slice(-8).toUpperCase()}`}
        </p>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <StatusBadge status={order.status} />
          <span className="text-xs text-[var(--color-on-surface-variant)]">{formattedDate}</span>
        </div>
      </div>

      {/* Amount + action */}
      <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 ml-auto shrink-0">
        <span className="font-bold text-[var(--color-on-surface)]">
          {formatPrice(order.amount)}
        </span>
        {order.originalAmount > order.amount && (
          <span className="text-xs text-[var(--color-on-surface-variant)] line-through">
            {formatPrice(order.originalAmount)}
          </span>
        )}
      </div>

      {/* Continue learning */}
      {order.status === 'completed' && course && (
        <Link
          to={`/learn/${course.slug}`}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)]/10 hover:bg-[var(--color-primary)] hover:text-white rounded-lg transition-all"
        >
          <PlayCircle className="w-4 h-4" />
          <span className="hidden sm:inline">Học ngay</span>
          <ChevronRight className="w-4 h-4 sm:hidden" />
        </Link>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrderHistoryPage() {
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
    staleTime: 30_000,
  })

  return (
    <>
      <Helmet>
        <title>Lịch sử đơn hàng — Sudemy</title>
        <meta name="description" content="Xem toàn bộ lịch sử thanh toán và đơn hàng của bạn trên Sudemy." />
      </Helmet>

      <div className="container-sudemy py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 rounded-xl bg-[var(--color-primary-light)]/20">
            <Receipt className="w-6 h-6 text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-headline-md text-[var(--color-on-surface)]">Lịch sử đơn hàng</h1>
            <p className="text-body-sm text-[var(--color-on-surface-variant)]">
              Tất cả giao dịch và khóa học đã mua
            </p>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-[var(--color-surface-container)] rounded-xl animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-16">
            <p className="text-[var(--color-error)] mb-4">Không thể tải lịch sử đơn hàng.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-[var(--color-primary)] underline"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && orders.length === 0 && (
          <div className="text-center py-20 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl">
            <Receipt className="w-14 h-14 text-[var(--color-on-surface-variant)] opacity-40 mx-auto mb-4" />
            <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-2">
              Chưa có đơn hàng nào
            </h2>
            <p className="text-body-md text-[var(--color-on-surface-variant)] mb-6 max-w-sm mx-auto">
              Bạn chưa thực hiện giao dịch nào. Hãy khám phá các khóa học AI thực chiến!
            </p>
            <Link to="/courses" className="btn-primary">
              Khám phá khóa học
            </Link>
          </div>
        )}

        {/* Order list */}
        {!isLoading && !isError && orders.length > 0 && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
              <SumCard
                label="Tổng đơn hàng"
                value={String(orders.length)}
                color="text-[var(--color-primary)]"
              />
              <SumCard
                label="Đã hoàn thành"
                value={String(orders.filter((o) => o.status === 'completed').length)}
                color="text-emerald-600 dark:text-emerald-400"
              />
              <SumCard
                label="Tổng đã chi"
                value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  orders
                    .filter((o) => o.status === 'completed')
                    .reduce((sum, o) => sum + o.amount, 0),
                )}
                color="text-[var(--color-on-surface)]"
              />
            </div>

            <div className="space-y-3">
              {orders.map((order) => (
                <OrderRow key={order._id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function SumCard({
  label,
  value,
  color,
}: {
  label: string
  value: string
  color: string
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl p-4">
      <p className="text-xs text-[var(--color-on-surface-variant)] mb-1">{label}</p>
      <p className={`font-bold text-lg ${color} truncate`}>{value}</p>
    </div>
  )
}
