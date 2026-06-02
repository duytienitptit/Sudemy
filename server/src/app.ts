import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoSanitize from 'express-mongo-sanitize'
import { env } from '@/config/env'
import { correlationId } from '@/middlewares/correlationId'
import { notFoundHandler, errorHandler } from '@/middlewares/errorHandler'
import routes from '@/routes'

export function createApp() {
  const app = express()

  // ─── Security ────────────────────────────────────────────────────────────────
  app.use(helmet())

  // Trust first proxy (required behind Render / Railway / Vercel reverse proxies)
  // Ensures correct client IP for rate limiting and logging
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1)
  }

  // In development, accept multiple localhost origins (Vite can use 5173 or 5177)
  const allowedOrigins: string[] =
    env.NODE_ENV === 'production'
      ? [env.CLIENT_URL]
      : [
          env.CLIENT_URL,
          'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5177',
        ]

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., curl, Postman, mobile apps)
        if (!origin) return callback(null, true)
        if (allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`CORS: Origin '${origin}' not allowed`))
      },
      credentials: true,
    })
  )

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 500,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again later' },
      },
    })
  )

  // ─── Body parsing ─────────────────────────────────────────────────────────────
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  // ─── NoSQL injection protection ───────────────────────────────────────────────
  // Strips keys containing '$' or '.' from req.body, req.params, req.query.
  app.use(mongoSanitize())

  // ─── Correlation ID ──────────────────────────────────────────────────────────
  app.use(correlationId)

  // ─── API Routes ───────────────────────────────────────────────────────────────
  app.use('/api/v1', routes)

  // ─── Error handling ──────────────────────────────────────────────────────────
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
