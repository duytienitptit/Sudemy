import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/admin/StatsCard'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { DataTable } from '@/components/ui/DataTable'
import { UsersIcon, DollarSignIcon, BookOpenIcon, ShoppingCartIcon } from '@/components/ui/Icons'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { getAdminStats, getRecentOrders } from '@/services/admin.service'
import type { IAdminStats, IRecentOrder } from '@/services/admin.service'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<IAdminStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<IRecentOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          getAdminStats(),
          getRecentOrders()
        ])
        setStats(statsData)
        setRecentOrders(ordersData)
      } catch (error) {
        console.error('Failed to load dashboard data', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const columns = [
    {
      header: 'Mã đơn',
      accessorKey: 'orderNumber',
      cell: (item: IRecentOrder) => <span className="font-mono text-sm">{item.orderNumber}</span>
    },
    {
      header: 'Người dùng',
      cell: (item: IRecentOrder) => (
        <div>
          <p className="font-medium">{item.user.name}</p>
          <p className="text-xs text-[var(--color-on-surface-variant)]">{item.user.email}</p>
        </div>
      )
    },
    {
      header: 'Khóa học',
      cell: (item: IRecentOrder) => item.course.title
    },
    {
      header: 'Số tiền',
      cell: (item: IRecentOrder) => <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}</span>
    },
    {
      header: 'Trạng thái',
      cell: (item: IRecentOrder) => {
        switch (item.status) {
          case 'pending': return <StatusBadge status="Chờ thanh toán" variant="warning" />
          case 'completed': return <StatusBadge status="Hoàn thành" variant="success" />
          case 'failed': return <StatusBadge status="Thất bại" variant="error" />
          default: return <StatusBadge status={item.status} />
        }
      }
    },
    {
      header: 'Ngày đặt',
      cell: (item: IRecentOrder) => new Date(item.createdAt).toLocaleDateString('vi-VN')
    }
  ]

  if (isLoading) {
    return <div className="p-8 text-[var(--color-on-surface-variant)]">Đang tải tổng quan...</div>
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-display-sm font-bold text-[var(--color-on-surface)]">Tổng quan Hệ thống</h1>
        <p className="text-body-lg text-[var(--color-on-surface-variant)] mt-2">
          Theo dõi các chỉ số hiệu suất chính của nền tảng.
        </p>
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Tổng người dùng"
              value={stats.totalUsers}
              icon={<UsersIcon size={24} />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatsCard
              title="Tổng doanh thu"
              value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
              icon={<DollarSignIcon size={24} />}
              trend={{ value: 8, isPositive: true }}
            />
            <StatsCard
              title="Tổng khóa học"
              value={stats.totalCourses}
              icon={<BookOpenIcon size={24} />}
            />
            <StatsCard
              title="Tổng đơn hàng"
              value={stats.totalOrders}
              icon={<ShoppingCartIcon size={24} />}
              trend={{ value: 5, isPositive: false }}
            />
          </div>

          <div className="elevation-1 rounded-xl p-6">
            <h2 className="text-title-lg font-semibold text-[var(--color-on-surface)] mb-6">Doanh thu & Đơn hàng</h2>
            {stats.revenueTrend && stats.revenueTrend.length > 0 ? (
              <RevenueChart data={stats.revenueTrend} />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-[var(--color-on-surface-variant)]">
                Chưa có dữ liệu doanh thu
              </div>
            )}
          </div>
        </>
      )}

      <div className="elevation-1 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[var(--color-outline-variant)] flex justify-between items-center">
          <h2 className="text-title-lg font-semibold text-[var(--color-on-surface)]">Đơn hàng gần đây</h2>
        </div>
        <div className="p-6">
          <DataTable data={recentOrders} columns={columns} />
        </div>
      </div>
    </div>
  )
}
