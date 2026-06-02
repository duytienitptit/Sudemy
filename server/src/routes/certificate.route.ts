import { Router } from 'express'
import { getUserCertificates, verifyCertificate } from '@/controllers/certificate.controller'
import { verifyAuth } from '@/middlewares/auth'
import { validate } from '@/middlewares/validate'
import { verifyCertificateParamSchema } from '@/validators/certificate.validator'

const router = Router()

// Public verification
router.get('/verify/:code', validate({ params: verifyCertificateParamSchema }), verifyCertificate)

// Protected user routes
router.use(verifyAuth)
router.get('/', getUserCertificates)

export default router
