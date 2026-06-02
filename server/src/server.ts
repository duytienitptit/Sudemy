import { env } from '@/config/env'
import { connectDB, disconnectDB } from '@/config/database'
import { logger } from '@/config/logger'
import { createApp } from './app'
import { startOrderExpiryScheduler } from '@/lib/orderExpiry'

async function bootstrap() {
  // Connect to MongoDB before starting the server
  await connectDB()

  // Start background scheduler: expire pending orders after 30 min
  startOrderExpiryScheduler()

  const app = createApp()

  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT}`)
    logger.info(`📍 Health check: http://localhost:${env.PORT}/api/v1/health`)
    logger.info(`🌍 Environment: ${env.NODE_ENV}`)
  })

  // ─── Graceful shutdown ────────────────────────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`)
    server.close(async () => {
      logger.info('HTTP server closed')
      await disconnectDB()
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled promise rejection', { reason })
    process.exit(1)
  })
}

bootstrap()
