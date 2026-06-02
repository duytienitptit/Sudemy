import { Link } from 'react-router-dom'
import { MyCoursesGrid } from '@/components/dashboard/MyCoursesGrid'
import { ProgressOverview } from '@/components/dashboard/ProgressOverview'
import { CertificateList } from '@/components/dashboard/CertificateList'
import { RecentOrders } from '@/components/dashboard/RecentOrders'

export default function DashboardPage() {
  return (
    <div className="container-sudemy py-12 space-y-12">
      <section>
        <h1 className="text-headline-md text-[var(--color-on-surface)] mb-6">Tổng quan học tập</h1>
        <ProgressOverview />
      </section>

      <section>
        <h2 className="text-headline-md text-[var(--color-on-surface)] mb-6">Khóa học của tôi</h2>
        <MyCoursesGrid />
      </section>

      <section>
        <h2 className="text-headline-md text-[var(--color-on-surface)] mb-6">Chứng chỉ của tôi</h2>
        <div className="max-w-4xl">
          <CertificateList />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-headline-md text-[var(--color-on-surface)]">Lịch sử đơn hàng</h2>
          <Link
            to="/dashboard/orders"
            className="text-sm text-[var(--color-primary)] font-medium hover:underline flex items-center gap-1"
          >
            Xem tất cả →
          </Link>
        </div>
        <RecentOrders />
      </section>
    </div>
  )
}
