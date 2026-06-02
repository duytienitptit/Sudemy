import { Router } from 'express'
import { handleWebhook } from '@/controllers/payment.controller'

const router = Router()

// POST /api/v1/payments/webhook — PayOS webhook callback
// Note: No auth middleware — signature verified inside service
router.post('/webhook', handleWebhook)

export default router
