import { useQuery } from '@tanstack/react-query'
import { BookOpen, Trophy, Clock, Loader2 } from 'lucide-react'
import { getCertificates } from '@/services/progress.service'
import { getMyOrders } from '@/services/payment.service'
import { useAuth } from '@/contexts/AuthContext'

export function ProgressOverview() {
  const { user } = useAuth()

  const { data: certificates = [], isLoading } = useQuery({
    queryKey: ['my-certificates'],
    queryFn: getCertificates,
    enabled: !!user,
  })

  const { data: orders = [], isLoading: isOrdersLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
    enabled: !!user,
  })

  // Total courses comes from purchasedCourses array AND completed orders (to handle stale auth state)
  const completedOrdersCount = orders.filter((o: any) => o.status === 'completed').length
  const totalCourses = Math.max(user?.purchasedCourses?.length || 0, completedOrdersCount)

  // Completed comes from the number of certificates they have earned
  const completedCount = certificates.length

  // In progress is total minus completed
  const inProgressCount = Math.max(0, totalCourses - completedCount)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Đang học */}
      <div className="bg-gradient-to-br from-[var(--color-primary-light)]/20 to-transparent p-6 rounded-2xl border border-[var(--color-primary-light)]/30 flex items-start gap-4">
        <div className="p-3 bg-[var(--color-primary)] text-white rounded-xl shadow-lg shadow-[var(--color-primary)]/20">
          <BookOpen size={24} />
        </div>
        <div>
          <p className="text-label-md text-[var(--color-on-surface-variant)] mb-1">Khóa học đang học</p>
          {isLoading ? (
            <Loader2 size={24} className="animate-spin text-[var(--color-on-surface-variant)]" />
          ) : (
            <p className="text-3xl font-bold text-[var(--color-on-surface)]">{inProgressCount}</p>
          )}
        </div>
      </div>

      {/* Hoàn thành */}
      <div className="bg-gradient-to-br from-green-500/10 to-transparent p-6 rounded-2xl border border-green-500/20 flex items-start gap-4">
        <div className="p-3 bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20">
          <Trophy size={24} />
        </div>
        <div>
          <p className="text-label-md text-[var(--color-on-surface-variant)] mb-1">Khóa học hoàn thành</p>
          {isLoading ? (
            <Loader2 size={24} className="animate-spin text-[var(--color-on-surface-variant)]" />
          ) : (
            <p className="text-3xl font-bold text-[var(--color-on-surface)]">{completedCount}</p>
          )}
        </div>
      </div>

      {/* Tổng đơn hàng */}
      <div className="bg-gradient-to-br from-orange-500/10 to-transparent p-6 rounded-2xl border border-orange-500/20 flex items-start gap-4">
        <div className="p-3 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-label-md text-[var(--color-on-surface-variant)] mb-1">Tổng khóa học đã mua</p>
          {isLoading ? (
            <Loader2 size={24} className="animate-spin text-[var(--color-on-surface-variant)]" />
          ) : (
            <p className="text-3xl font-bold text-[var(--color-on-surface)]">{totalCourses}</p>
          )}
        </div>
      </div>
    </div>
  )
}
