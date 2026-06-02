import { z } from 'zod'

export const verifyCertificateParamSchema = z.object({
  code: z.string().regex(/^[A-Z0-9]{8}$/, 'Verification code must be 8 alphanumeric uppercase characters'),
})
