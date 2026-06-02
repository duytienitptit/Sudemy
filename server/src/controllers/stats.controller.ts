import { Request, Response, NextFunction } from 'express'
import { StatsService } from '../services/stats.service'

const statsService = new StatsService()

/**
 * Get aggregated stats for admin dashboard
 * GET /api/v1/admin/stats
 * Admin endpoint
 */
export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await statsService.getAdminStats()

    res.status(200).json({
      success: true,
      data: stats,
    })
  } catch (error) {
    next(error)
  }
}
