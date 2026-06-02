import { ProgressService } from '@/services/progress.service'
import { Progress } from '@/models/Progress'
import { Lesson } from '@/models/Lesson'
import { CertificateService } from '@/services/certificate.service'

jest.mock('@/models/Progress', () => ({
  Progress: {
    findOneAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
  },
}))

jest.mock('@/models/Lesson', () => ({
  Lesson: {
    countDocuments: jest.fn(),
  },
}))

jest.mock('@/services/certificate.service', () => ({
  CertificateService: {
    generateCertificate: jest.fn(),
  },
}))

const mockProgressFindOneAndUpdate = Progress.findOneAndUpdate as jest.Mock
const mockProgressCountDocuments = Progress.countDocuments as jest.Mock
const mockProgressFind = Progress.find as jest.Mock
const mockLessonCountDocuments = Lesson.countDocuments as jest.Mock
const mockGenerateCertificate = CertificateService.generateCertificate as jest.Mock

describe('ProgressService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockProgressFind.mockReturnValue({
      lean: jest.fn().mockResolvedValue([])
    })
  })

  describe('completeLesson', () => {
    it('marks a lesson as completed and calculates progress (<100%)', async () => {
      mockProgressFindOneAndUpdate.mockResolvedValue({})
      mockLessonCountDocuments.mockResolvedValue(10) // 10 total lessons
      mockProgressFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { lessonId: 'l1' }, { lessonId: 'l2' }, { lessonId: 'l3' }, { lessonId: 'l4' }, { lessonId: 'l5' }
        ])
      })

      const result = await ProgressService.completeLesson('user1', 'course1', 'lesson1', 85)

      expect(mockProgressFindOneAndUpdate).toHaveBeenCalledWith(
        { userId: 'user1', courseId: 'course1', lessonId: 'lesson1' },
        expect.objectContaining({
          userId: 'user1',
          courseId: 'course1',
          lessonId: 'lesson1',
          completed: true,
          quizScore: 85,
        }),
        { upsert: true, new: true }
      )
      expect(result.progressPercent).toBe(50)
      expect(result.completedLessons.length).toBe(5)
      expect(result.totalLessons).toBe(10)
      expect(result.certificate).toBeNull()
      expect(mockGenerateCertificate).not.toHaveBeenCalled()
    })

    it('generates certificate when progress reaches 100%', async () => {
      mockProgressFindOneAndUpdate.mockResolvedValue({})
      mockLessonCountDocuments.mockResolvedValue(5) // 5 total
      mockProgressFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([
          { lessonId: 'l1' }, { lessonId: 'l2' }, { lessonId: 'l3' }, { lessonId: 'l4' }, { lessonId: 'l5' }
        ])
      })
      const mockCert = { verificationCode: 'XYZ123' }
      mockGenerateCertificate.mockResolvedValue(mockCert)

      const result = await ProgressService.completeLesson('user1', 'course1', 'lesson5')

      expect(result.progressPercent).toBe(100)
      expect(mockGenerateCertificate).toHaveBeenCalledWith('user1', 'course1')
      expect(result.certificate).toEqual(mockCert)
    })

    it('returns 0% if course has no published lessons', async () => {
      mockProgressFindOneAndUpdate.mockResolvedValue({})
      mockLessonCountDocuments.mockResolvedValue(0)
      mockProgressFind.mockReturnValue({
        lean: jest.fn().mockResolvedValue([{ lessonId: 'l1' }])
      })

      const result = await ProgressService.completeLesson('user1', 'course1', 'lesson1')

      expect(result.progressPercent).toBe(0)
      expect(mockGenerateCertificate).not.toHaveBeenCalled()
    })
  })

  describe('getCourseProgress', () => {
    it('calculates course progress correctly', async () => {
      const chainMock = {
        lean: jest.fn().mockResolvedValue([
          { lessonId: 'lesson1' },
          { lessonId: 'lesson2' },
        ])
      }
      mockProgressFind.mockReturnValue(chainMock)
      mockLessonCountDocuments.mockResolvedValue(4) // 4 total lessons

      const result = await ProgressService.getCourseProgress('user1', 'course1')

      expect(mockProgressFind).toHaveBeenCalledWith({ userId: 'user1', courseId: 'course1', completed: true })
      expect(mockLessonCountDocuments).toHaveBeenCalledWith({ courseId: 'course1' })
      expect(result.progressPercent).toBe(50)
      expect(result.completedLessons).toEqual(['lesson1', 'lesson2'])
      expect(result.totalLessons).toBe(4)
    })

    it('returns 0% if course has no published lessons', async () => {
      const chainMock = { lean: jest.fn().mockResolvedValue([]) }
      mockProgressFind.mockReturnValue(chainMock)
      mockLessonCountDocuments.mockResolvedValue(0)

      const result = await ProgressService.getCourseProgress('user1', 'course1')

      expect(result.progressPercent).toBe(0)
      expect(result.completedLessons).toEqual([])
      expect(result.totalLessons).toBe(0)
    })
  })
})
