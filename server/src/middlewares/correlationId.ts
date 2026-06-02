import { Request, Response, NextFunction } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { correlationStore } from '@/config/logger'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      correlationId: string
    }
  }
}

/**
 * Attaches a X-Correlation-ID header to every request/response.
 * Uses incoming header if provided (for microservice tracing), otherwise generates a new UUID.
 * Binds correlationStore so the logger automatically includes the ID on every log line.
 */
export const correlationId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-correlation-id'] as string) ?? uuidv4()
  req.correlationId = id
  res.setHeader('X-Correlation-ID', id)
  // Run the rest of the request lifecycle inside the async store so the
  // logger can automatically pick up the correlation ID.
  correlationStore.run({ correlationId: id }, next)
}
