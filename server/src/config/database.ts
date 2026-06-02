import mongoose from 'mongoose'
import { env } from './env'
import { logger } from './logger'
import { seedSettings } from '@/models/Settings'

const MAX_RETRIES = 5
const RETRY_DELAY_MS = 3000

// ─── Connect with Retry ───────────────────────────────────────────────────────
export async function connectDB(attempt = 1): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      dbName: 'sudemy',
      serverSelectionTimeoutMS: 5000,
    })
    logger.info('✅ MongoDB connected successfully')

    // Seed singleton Settings document if it doesn't exist
    await seedSettings()
    logger.info('✅ Settings collection seeded')
  } catch (error) {
    logger.error(`❌ MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`, { error })

    if (attempt < MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt
      logger.info(`⏳ Retrying in ${delay / 1000}s…`)
      await new Promise((resolve) => setTimeout(resolve, delay))
      return connectDB(attempt + 1)
    }

    if (env.NODE_ENV === 'production') {
      logger.error('💀 Max retries reached — shutting down')
      process.exit(1)
    } else {
      logger.warn('⚠️  Running without database (development mode)')
    }
  }
}

// ─── Graceful Shutdown ─────────────────────────────────────────────────────────
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close()
  logger.info('MongoDB connection closed')
}

// ─── Connection Events ─────────────────────────────────────────────────────────
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected')
})

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected')
})
