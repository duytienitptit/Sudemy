import { CertificateService } from '@/services/certificate.service'
import { Certificate } from '@/models/Certificate'
import { AppError } from '@/middlewares/errorHandler'
import { Types } from 'mongoose'
import crypto from 'crypto'

jest.mock('@/models/Certificate', () => ({
  Certificate: {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
  },
}))

const mockFindOne = Certificate.findOne as jest.Mock
const mockFind = Certificate.find as jest.Mock
const mockCreate = Certificate.create as jest.Mock

describe('CertificateService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateCertificate', () => {
    it('returns existing certificate if user already has one for the course', async () => {
      const existing = { _id: 'cert123', verificationCode: 'ABCD1234' }
      mockFindOne.mockResolvedValueOnce(existing)

      const result = await CertificateService.generateCertificate('user1', 'course1')

      expect(mockFindOne).toHaveBeenCalledWith({ userId: 'user1', courseId: 'course1' })
      expect(result).toEqual(existing)
      expect(mockCreate).not.toHaveBeenCalled()
    })

    it('generates a unique certificate if none exists', async () => {
      mockFindOne.mockResolvedValueOnce(null) // No existing cert for user
      mockFindOne.mockResolvedValueOnce(null) // verificationCode is unique
      
      const newCert = { _id: 'cert456', verificationCode: 'NEWCODE1' }
      mockCreate.mockResolvedValue(newCert)

      const result = await CertificateService.generateCertificate('user1', 'course1')

      expect(mockFindOne).toHaveBeenCalledTimes(2)
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user1',
        courseId: 'course1',
        verificationCode: expect.any(String),
      }))
      expect(result).toEqual(newCert)
    })

    it('retries generation if verification code conflicts', async () => {
      mockFindOne.mockResolvedValueOnce(null) // No existing cert
      mockFindOne.mockResolvedValueOnce({ verificationCode: 'CONFLICT' }) // 1st try code exists
      mockFindOne.mockResolvedValueOnce(null) // 2nd try code unique

      const newCert = { _id: 'cert789', verificationCode: 'UNIQUE99' }
      mockCreate.mockResolvedValue(newCert)

      await CertificateService.generateCertificate('user1', 'course1')

      expect(mockFindOne).toHaveBeenCalledTimes(3)
      expect(mockCreate).toHaveBeenCalledTimes(1)
    })
  })

  describe('getUserCertificates', () => {
    it('returns certificates for a user', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ _id: 'cert1' }]),
      }
      mockFind.mockReturnValue(chainMock)

      const result = await CertificateService.getUserCertificates('user1')

      expect(mockFind).toHaveBeenCalledWith({ userId: 'user1' })
      expect(chainMock.populate).toHaveBeenCalledWith('courseId', 'title instructor thumbnail')
      expect(chainMock.sort).toHaveBeenCalledWith({ issuedAt: -1 })
      expect(result).toEqual([{ _id: 'cert1' }])
    })
  })

  describe('verifyCertificate', () => {
    it('returns certificate if verification code is valid', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue({ _id: 'cert1', verificationCode: 'CODE1234' }),
      }
      mockFindOne.mockReturnValue(chainMock)

      const result = await CertificateService.verifyCertificate('code1234')

      expect(mockFindOne).toHaveBeenCalledWith({ verificationCode: 'CODE1234' })
      expect(chainMock.populate).toHaveBeenCalledWith('userId', 'displayName email')
      expect(chainMock.populate).toHaveBeenCalledWith('courseId', 'title instructor')
      expect(result).toEqual({ _id: 'cert1', verificationCode: 'CODE1234' })
    })

    it('throws 404 if verification code is invalid', async () => {
      const chainMock = {
        populate: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(null),
      }
      mockFindOne.mockReturnValue(chainMock)

      await expect(CertificateService.verifyCertificate('INVALIDX')).rejects.toThrow(AppError)
      await expect(CertificateService.verifyCertificate('INVALIDX')).rejects.toMatchObject({
        statusCode: 404,
      })
    })
  })
})
