import { Request, Response, NextFunction } from 'express'
import { CertificateService } from '@/services/certificate.service'
import { sendSuccess } from '@/lib/response'

export const getUserCertificates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = String(req.user!._id)
    const certificates = await CertificateService.getUserCertificates(userId)

    sendSuccess(res, certificates)
  } catch (error) {
    next(error)
  }
}

export const verifyCertificate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params
    const certificate = await CertificateService.verifyCertificate(String(code))

    sendSuccess(res, certificate)
  } catch (error) {
    next(error)
  }
}
