import { logger } from '@/config/logger'
import { paymentService } from '@/services/payment.service'

let _intervalHandle: ReturnType<typeof setInterval> | null = null

/**
 * Start a background scheduler that expires pending orders older than
 * `thresholdMinutes` (default 30). The check runs every `intervalMs` ms.
 *
 * Safe to call multiple times — subsequent calls are no-ops if already started.
 */
export function startOrderExpiryScheduler(
  thresholdMinutes = 30,
  intervalMs = 60_000,
): void {
  if (_intervalHandle) return // already running

  logger.info(
    `Order expiry scheduler started (threshold=${thresholdMinutes}min, interval=${intervalMs}ms)`,
  )

  _intervalHandle = setInterval(async () => {
    try {
      await paymentService.expirePendingOrders(thresholdMinutes)
    } catch (err) {
      logger.error('Order expiry scheduler error', { error: (err as Error).message })
    }
  }, intervalMs)

  // Allow the process to exit even if the interval is still registered
  _intervalHandle.unref()
}

/**
 * Stop the scheduler. Primarily useful in tests.
 */
export function stopOrderExpiryScheduler(): void {
  if (_intervalHandle) {
    clearInterval(_intervalHandle)
    _intervalHandle = null
    logger.info('Order expiry scheduler stopped')
  }
}
