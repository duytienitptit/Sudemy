import api from '@/lib/api'

export interface IAdminStats {
  totalUsers: number
  totalCourses: number
  totalOrders: number
  totalRevenue: number
  recentActivity: Array<{
    _id: string
    type: 'user_joined' | 'order_placed' | 'course_created'
    description: string
    createdAt: string
  }>
  revenueTrend: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

export interface IRecentOrder {
  _id: string
  orderNumber: string
  user: {
    _id: string
    name: string
    email: string
  }
  course: {
    _id: string
    title: string
  }
  amount: number
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  createdAt: string
}

interface StatsResponse {
  success: boolean
  data: IAdminStats
}

interface RecentOrdersResponse {
  success: boolean
  data: IRecentOrder[]
}

export const getAdminStats = async (): Promise<IAdminStats> => {
  const { data } = await api.get<StatsResponse>('/admin/stats')
  return data.data
}

export const getRecentOrders = async (): Promise<IRecentOrder[]> => {
  const { data } = await api.get<any>('/orders', { params: { limit: 5 } })
  
  const orders = data.data || []
  return orders.map((order: any) => ({
    _id: order._id,
    orderNumber: order.payosOrderId || order._id.slice(-6),
    user: {
      _id: order.userId?._id || '',
      name: order.userId?.fullName || 'Khách',
      email: order.userId?.email || 'No email'
    },
    course: {
      _id: order.courseId?._id || '',
      title: order.courseId?.title || 'Unknown Course'
    },
    amount: order.amount || 0,
    status: order.status || 'pending',
    createdAt: order.createdAt
  }))
}
