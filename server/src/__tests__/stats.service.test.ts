import { StatsService } from '../services/stats.service'
import { User } from '../models/User'
import { Course } from '../models/Course'
import { Order } from '../models/Order'

jest.mock('../models/User')
jest.mock('../models/Course')
jest.mock('../models/Order')

describe('StatsService', () => {
  let statsService: StatsService

  beforeEach(() => {
    statsService = new StatsService()
    jest.clearAllMocks()
  })

  describe('getAdminStats', () => {
    it('should return aggregated admin stats', async () => {
      ;(User.countDocuments as jest.Mock).mockResolvedValue(100)
      ;(Course.countDocuments as jest.Mock).mockResolvedValue(20)
      ;(Order.countDocuments as jest.Mock).mockResolvedValue(50)

      ;(Order.aggregate as jest.Mock).mockResolvedValue([{ _id: null, totalRevenue: 5000000 }])

      const mockRecentOrders = [
        { _id: '1', amount: 100000 },
        { _id: '2', amount: 150000 },
      ]
      
      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockRecentOrders),
      }
      ;(Order.find as jest.Mock).mockReturnValue(mockQuery)

      const stats = await statsService.getAdminStats()

      expect(User.countDocuments).toHaveBeenCalled()
      expect(Course.countDocuments).toHaveBeenCalled()
      expect(Order.countDocuments).toHaveBeenCalledWith({ status: 'completed' })
      expect(Order.aggregate).toHaveBeenCalled()
      expect(Order.find).toHaveBeenCalledWith({ status: 'completed' })

      expect(stats).toEqual({
        totalUsers: 100,
        totalCourses: 20,
        totalOrders: 50,
        totalRevenue: 5000000,
        recentOrders: mockRecentOrders,
      })
    })

    it('should handle zero revenue correctly', async () => {
      ;(User.countDocuments as jest.Mock).mockResolvedValue(0)
      ;(Course.countDocuments as jest.Mock).mockResolvedValue(0)
      ;(Order.countDocuments as jest.Mock).mockResolvedValue(0)
      ;(Order.aggregate as jest.Mock).mockResolvedValue([])

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      }
      ;(Order.find as jest.Mock).mockReturnValue(mockQuery)

      const stats = await statsService.getAdminStats()

      expect(stats.totalRevenue).toBe(0)
      expect(stats.recentOrders).toEqual([])
    })
  })
})
