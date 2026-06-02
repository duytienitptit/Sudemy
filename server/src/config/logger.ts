import winston from 'winston'
import { AsyncLocalStorage } from 'async_hooks'
import { env } from './env'

// ─── Correlation ID store ─────────────────────────────────────────────────────
// Allows any log call to automatically include the current request's correlation ID
// without explicitly threading it through every function.
export const correlationStore = new AsyncLocalStorage<{ correlationId: string }>()

// ─── Custom format: inject correlationId from AsyncLocalStorage ───────────────
const withCorrelationId = winston.format((info) => {
  const store = correlationStore.getStore()
  if (store?.correlationId) {
    info.correlationId = store.correlationId
  }
  return info
})

const { combine, timestamp, errors, json, colorize, simple } = winston.format

const devFormat = combine(withCorrelationId(), colorize(), simple())

const prodFormat = combine(timestamp(), errors({ stack: true }), withCorrelationId(), json())

export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [new winston.transports.Console()],
})
