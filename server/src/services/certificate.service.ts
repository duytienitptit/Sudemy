import crypto from 'crypto'
import { Certificate } from '@/models/Certificate'
import { Course } from '@/models/Course'
import { User } from '@/models/User'
import { AppError } from '@/middlewares/errorHandler'

export class CertificateService {
  /**
   * Generates a new certificate for a user if they have completed a course
   * and don't already have one.
   */
  static async generateCertificate(userId: string, courseId: string) {
    // 1. Check if user already has a certificate for this course
    const existing = await Certificate.findOne({ userId, courseId })
    if (existing) {
      return existing
    }

    // 2. Generate a unique 8-character verification code
    let verificationCode = ''
    let isUnique = false

    while (!isUnique) {
      // crypto.randomBytes(4) generates 4 bytes (8 hex chars).
      // e.g. 'A1B2C3D4'
      verificationCode = crypto.randomBytes(4).toString('hex').toUpperCase()
      const conflict = await Certificate.findOne({ verificationCode })
      if (!conflict) {
        isUnique = true
      }
    }

    // 3. Create certificate
    const certificate = await Certificate.create({
      userId,
      courseId,
      verificationCode,
    })

    // 4. Send email notification asynchronously
    try {
      const user = await User.findById(userId).select('email fullName').lean()
      const course = await Course.findById(courseId).select('title').lean()
      
      if (user && course) {
        const certificateUrl = `${process.env.CLIENT_URL}/verify/${verificationCode}`
        // We don't await this to avoid blocking the main thread
        import('@/lib/email').then(({ sendCertificateEmail }) => {
          if (user && user.email) {
            sendCertificateEmail(user.email, user.fullName, course.title, certificateUrl)
              .catch(err => console.error('Failed to send certificate email asynchronously', err))
          }
        }).catch(err => console.error('Failed to import email lib', err))
      }
    } catch (err) {
      console.error('Failed to prepare certificate email', err)
    }

    return certificate
  }

  /**
   * Get all certificates for a user.
   */
  static async getUserCertificates(userId: string) {
    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title instructor thumbnail')
      .sort({ issuedAt: -1 })
      .lean()

    return certificates
  }

  /**
   * Public verification of a certificate by its code.
   */
  static async verifyCertificate(code: string) {
    const certificate = await Certificate.findOne({ verificationCode: code.toUpperCase() })
      .populate('userId', 'displayName email')
      .populate('courseId', 'title instructor')
      .lean()

    if (!certificate) {
      throw new AppError('Certificate not found or invalid verification code', 404)
    }

    return certificate
  }
}
