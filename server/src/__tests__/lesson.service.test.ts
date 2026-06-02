import { LessonService } from '@/services/lesson.service'
import { Lesson } from '@/models/Lesson'
import { Course } from '@/models/Course'
import { Progress } from '@/models/Progress'
import { AppError } from '@/middlewares/errorHandler'

jest.mock('@/models/Lesson', () => ({
  Lesson: {
    find: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}))

jest.mock('@/models/Course', () => ({
  Course: {
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  },
}))

jest.mock('@/models/Progress', () => ({
  Progress: {
    findOne: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
  },
}))

const mockLessonFind = Lesson.find as jest.Mock
const mockLessonFindById = Lesson.findById as jest.Mock
const mockLessonCreate = Lesson.create as jest.Mock

const mockCourseFindById = Course.findById as jest.Mock
const mockCourseFindByIdAndUpdate = Course.findByIdAndUpdate as jest.Mock

const mockProgressFindOne = Progress.findOne as jest.Mock
const mockProgressCreate = Progress.create as jest.Mock
const mockProgressCountDocuments = Progress.countDocuments as jest.Mock

describe('LessonService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCourseLessons', () => {
    it('throws 404 if course not found', async () => {
      mockCourseFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
      await expect(LessonService.getCourseLessons('course-id')).rejects.toThrow(AppError)
    })

    it('returns limited fields for unauthorized users and non-free lessons', async () => {
      mockCourseFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'course-id' }) })
      
      const mockLessons = [
        { _id: '1', title: 'Free', isFree: true, youtubeUrl: 'url1' },
        { _id: '2', title: 'Paid', isFree: false, youtubeUrl: 'url2' },
      ]
      
      mockLessonFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockLessons)
        })
      })

      const result = await LessonService.getCourseLessons('course-id')
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockLessons[0]) // full access
      expect(result[1]).not.toHaveProperty('youtubeUrl') // restricted access
      expect(result[1]).toHaveProperty('title')
    })

    it('returns full fields if user purchased the course', async () => {
      mockCourseFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: 'course-id' }) })
      
      const mockLessons = [
        { _id: '2', title: 'Paid', isFree: false, youtubeUrl: 'url2' },
      ]
      
      mockLessonFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockLessons)
        })
      })

      const mockUser: any = { role: 'user', purchasedCourses: ['course-id'] }
      const result = await LessonService.getCourseLessons('course-id', mockUser)
      
      expect(result[0]).toHaveProperty('youtubeUrl') // full access
    })
  })

  describe('getLessonById', () => {
    it('throws 404 if lesson not found', async () => {
      mockLessonFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) })
      await expect(LessonService.getLessonById('lesson-id')).rejects.toThrow(AppError)
    })

    it('throws 403 if lesson is paid and user has not purchased', async () => {
      mockLessonFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ isFree: false, courseId: 'course-id' }) })
      const mockUser: any = { role: 'user', purchasedCourses: ['other-course-id'] }
      
      await expect(LessonService.getLessonById('lesson-id', mockUser)).rejects.toThrow(AppError)
    })

    it('returns lesson if it is free', async () => {
      const lesson = { isFree: true, courseId: 'course-id', title: 'Free Lesson' }
      mockLessonFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(lesson) })
      
      const result = await LessonService.getLessonById('lesson-id')
      expect(result).toEqual(lesson)
    })
  })

  describe('createLesson', () => {
    it('creates lesson and increments course totalLessons', async () => {
      mockCourseFindById.mockResolvedValue({ _id: 'course-id' })
      const lessonData = { title: 'New Lesson' }
      mockLessonCreate.mockResolvedValue({ ...lessonData, _id: 'lesson-id' })
      
      const result = await LessonService.createLesson('course-id', lessonData)
      
      expect(mockLessonCreate).toHaveBeenCalled()
      expect(mockCourseFindByIdAndUpdate).toHaveBeenCalledWith('course-id', { $inc: { totalLessons: 1 } })
      expect(result.title).toBe('New Lesson')
    })
  })

  describe('submitQuiz', () => {
    it('calculates score correctly and updates progress', async () => {
      const lesson = { 
        _id: 'lesson-id', 
        courseId: 'course-id',
        isFree: true,
        quiz: [
          { correctAnswer: 1 },
          { correctAnswer: 2 }
        ]
      }
      mockLessonFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue(lesson) })
      
      const user: any = { _id: 'user-id', role: 'user', purchasedCourses: [] }
      const answers = [
        { questionIndex: 0, selectedOption: 1 }, // correct
        { questionIndex: 1, selectedOption: 0 }  // wrong
      ]

      mockProgressFindOne.mockResolvedValue(null) // New progress
      mockProgressCountDocuments.mockResolvedValue(1) // Completed lessons count
      mockCourseFindById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ totalLessons: 2 }) })

      const result = await LessonService.submitQuiz('lesson-id', user, answers)

      expect(result.score).toBe(50) // 1 out of 2
      expect(result.passed).toBe(false)
      expect(result.courseProgressPercent).toBe(50) // 1 out of 2 completed lessons (based on mock)
      
      expect(mockProgressCreate).toHaveBeenCalledWith({
        userId: 'user-id',
        courseId: 'course-id',
        lessonId: 'lesson-id',
        quizScore: 50,
        completed: false,
        completedAt: undefined
      })
    })
  })
})
