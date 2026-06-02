import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getMyOrders } from '@/services/payment.service'
import { CheckCircle2, Clock, XCircle, PlayCircle, Receipt } from 'lucide-react'
import type { Order } from '@/types/payment.types'

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
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

function OrderRow({ order }: { order: Order }) {
  const course = order.courseId && typeof order.courseId !== 'string' ? order.courseId : null

  const formatPrice = (v: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)

  const formattedDate = new Date(order.createdAt).toLocaleDateString('vi-VN')

  return (
    <div className="flex items-center gap-4 p-4 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl hover:border-[var(--color-primary)] transition-all">
      {course && (
        <div className="w-16 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 hidden sm:block">
          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--color-on-surface)] line-clamp-1 text-sm">
          {course ? course.title : `Đơn hàng #${order._id.slice(-8).toUpperCase()}`}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <StatusBadge status={order.status} />
          <span className="text-xs text-[var(--color-on-surface-variant)]">{formattedDate}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <span className="font-bold text-[var(--color-on-surface)] text-sm">{formatPrice(order.amount)}</span>
      </div>
      {order.status === 'completed' && course && (
        <Link
          to={`/learn/${course.slug}`}
          className="shrink-0 hidden sm:flex items-center justify-center w-8 h-8 text-[var(--color-primary)] bg-[var(--color-primary-light)]/10 hover:bg-[var(--color-primary)] hover:text-white rounded-lg transition-all"
          title="Học ngay"
        >
          <PlayCircle className="w-4 h-4" />
        </Link>
      )}
    </div>
  )
}

export function RecentOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => <div key={i} className="h-20 bg-[var(--color-surface-container)] rounded-xl animate-pulse" />)}
      </div>
    )
  }

  const recentOrders = orders.slice(0, 3)

  if (recentOrders.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl p-6 text-center">
        <Receipt className="w-10 h-10 text-[var(--color-on-surface-variant)] opacity-40 mx-auto mb-3" />
        <p className="text-[var(--color-on-surface-variant)] mb-3 text-sm">Bạn chưa có đơn hàng nào.</p>
        <Link to="/courses" className="btn-primary text-sm">Khám phá khóa học</Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {recentOrders.map(order => (
        <OrderRow key={order._id} order={order} />
      ))}
    </div>
  )
}
