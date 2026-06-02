import { PayOS } from '@payos/node'
import { env } from '@/config/env'
import { logger } from '@/config/logger'

// ─── Lazy singleton — only initialised when PayOS credentials are present ─────

let _payos: PayOS | null = null

export function getPayOS(): PayOS | null {
  if (!env.PAYOS_CLIENT_ID || !env.PAYOS_API_KEY || !env.PAYOS_CHECKSUM_KEY) {
    return null
  }
  if (!_payos) {
    _payos = new PayOS({
      clientId: env.PAYOS_CLIENT_ID,
      apiKey: env.PAYOS_API_KEY,
      checksumKey: env.PAYOS_CHECKSUM_KEY,
    })
    logger.info('PayOS SDK initialized')
  }
  return _payos
}

/** Only for tests — resets singleton so getPayOS() re-evaluates env. */
export function _resetPayOS(): void {
  _payos = null
}
