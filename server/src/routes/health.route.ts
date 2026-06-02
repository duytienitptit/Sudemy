import { Router, Request, Response } from 'express'

const router = Router()

/**
 * GET /api/v1/health
 * Simple health check endpoint — returns server status and uptime.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV ?? 'development',
    },
  })
})

export default router
