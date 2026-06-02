import { User } from '../models/User'
import { Course } from '../models/Course'
import { Order } from '../models/Order'

export interface RevenueTrendItem {
  date: string    // "DD/MM"
  revenue: number
  orders: number
}

export interface AdminStats {
  totalUsers: number
  totalCourses: number
  totalOrders: number
  totalRevenue: number
  recentOrders: any[]
  revenueTrend: RevenueTrendItem[]
}

export class StatsService {
  /**
   * Aggregates stats for the admin dashboard
   */
  async getAdminStats(): Promise<AdminStats> {
    const VN_TZ = '+07:00'

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
    thirtyDaysAgo.setHours(0, 0, 0, 0)

    const [totalUsers, totalCourses, totalOrders, revenueResult, recentOrders, trendRaw] =
      await Promise.all([
        User.countDocuments(),
        Course.countDocuments(),
        Order.countDocuments({ status: 'completed' }),
        Order.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
        ]),
        Order.find({ status: 'completed' })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('userId', 'fullName email')
          .populate('courseId', 'title slug')
          .lean(),
        // Revenue trend for the last 30 days (grouped by Vietnam timezone)
        Order.aggregate([
          {
            $match: {
              status: 'completed',
              createdAt: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                  timezone: VN_TZ,
                },
              },
              revenue: { $sum: '$amount' },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ])

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

    // Build a map from aggregation results
    const trendMap = new Map<string, { revenue: number; orders: number }>()
    for (const item of trendRaw) {
      trendMap.set(item._id, { revenue: item.revenue, orders: item.orders })
    }

    // Fill all 30 days (including days with 0 orders)
    // Use local date parts (matching server timezone) instead of toISOString() (UTC)
    const revenueTrend: RevenueTrendItem[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo)
      d.setDate(d.getDate() + i)
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      const key = `${year}-${month}-${day}`
      const label = `${day}/${month}`
      const entry = trendMap.get(key)
      revenueTrend.push({
        date: label,
        revenue: entry?.revenue ?? 0,
        orders: entry?.orders ?? 0,
      })
    }

    return {
      totalUsers,
      totalCourses,
      totalOrders,
      totalRevenue,
      recentOrders,
      revenueTrend,
    }
  }
}
