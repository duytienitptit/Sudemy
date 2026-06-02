import { CourseService } from '@/services/course.service'
import { Course } from '@/models/Course'
import { Lesson } from '@/models/Lesson'
import { Order } from '@/models/Order'
import { AppError } from '@/middlewares/errorHandler'

jest.mock('@/models/Course', () => {
  return {
    Course: {
      find: jest.fn(),
      findOne: jest.fn(),
      countDocuments: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    },
  }
})

jest.mock('@/models/Lesson', () => {
  return {
    Lesson: {
      find: jest.fn(),
      deleteMany: jest.fn(),
    },
  }
})

jest.mock('@/models/Order', () => {
  return {
    Order: {
      exists: jest.fn(),
    },
  }
})

const mockFind = Course.find as jest.Mock
const mockFindOne = Course.findOne as jest.Mock
const mockCountDocuments = Course.countDocuments as jest.Mock
const mockFindById = Course.findById as jest.Mock
const mockCreate = Course.create as jest.Mock
const mockFindByIdAndDelete = Course.findByIdAndDelete as jest.Mock
const mockFindByIdAndUpdate = Course.findByIdAndUpdate as jest.Mock

const mockLessonFind = Lesson.find as jest.Mock
const mockLessonDeleteMany = Lesson.deleteMany as jest.Mock

const mockOrderExists = Order.exists as jest.Mock

describe('CourseService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('getCourses', () => {
    it('returns published courses for non-admins', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ title: 'Course 1' }]),
      }
      mockFind.mockReturnValue(chainMock)
      mockCountDocuments.mockResolvedValue(1)

      const result = await CourseService.getCourses({}, false)

      expect(mockFind).toHaveBeenCalledWith({ status: 'published' })
      expect(chainMock.skip).toHaveBeenCalledWith(0)
      expect(chainMock.limit).toHaveBeenCalledWith(12)
      expect(result.courses).toHaveLength(1)
    })

    it('returns all courses for admins if no status filter', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ title: 'Course 1' }]),
      }
      mockFind.mockReturnValue(chainMock)
      mockCountDocuments.mockResolvedValue(1)

      await CourseService.getCourses({}, true)

      expect(mockFind).toHaveBeenCalledWith({})
    })

    it('applies text search filter correctly', async () => {
      const chainMock = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([]),
      }
      mockFind.mockReturnValue(chainMock)
      mockCountDocuments.mockResolvedValue(0)

      await CourseService.getCourses({ search: 'React' }, true)

      const callArg = mockFind.mock.calls[0][0]
      expect(callArg.$or).toBeDefined()
      expect(callArg.$or).toHaveLength(3)
      expect(callArg.$or[0]).toHaveProperty('title')
      expect(chainMock.sort).toHaveBeenCalledWith({ createdAt: -1 })
    })
  })

  describe('getCourseBySlug', () => {
    it('returns a course with lessons if found', async () => {
      const mockCourse = { _id: 'course-id', title: 'Course 1', slug: 'course-1' }
      const chainMockCourse = {
        lean: jest.fn().mockResolvedValue(mockCourse),
      }
      mockFindOne.mockReturnValue(chainMockCourse)

      const mockLessons = [{ title: 'Lesson 1' }]
      const chainMockLesson = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(mockLessons),
      }
      mockLessonFind.mockReturnValue(chainMockLesson)

      const course = await CourseService.getCourseBySlug('course-1')

      expect(mockFindOne).toHaveBeenCalledWith({ slug: 'course-1' })
      expect(mockLessonFind).toHaveBeenCalledWith({ courseId: 'course-id' })
      expect(course.slug).toBe('course-1')
      expect(course.lessons).toEqual(mockLessons)
    })

    it('throws 404 if course not found', async () => {
      const chainMockCourse = {
        lean: jest.fn().mockResolvedValue(null),
      }
      mockFindOne.mockReturnValue(chainMockCourse)

      await expect(CourseService.getCourseBySlug('not-found')).rejects.toThrow(AppError)
    })
  })

  describe('createCourse', () => {
    it('creates and returns a new course', async () => {
      const mockCourse: any = { title: 'New Course' }
      mockCreate.mockResolvedValue(mockCourse)

      const result = await CourseService.createCourse({ title: 'New Course' })

      expect(mockCreate).toHaveBeenCalledWith({ title: 'New Course' })
      expect(result).toBe(mockCourse)
    })
  })

  describe('updateCourse', () => {
    it('updates a course successfully', async () => {
      const mockCourse: any = { title: 'Old Title', save: jest.fn() }
      mockFindById.mockResolvedValue(mockCourse)

      const result = await CourseService.updateCourse('someId', { title: 'New Title' })

      expect(mockFindById).toHaveBeenCalledWith('someId')
      expect(mockCourse.title).toBe('New Title')
      expect(mockCourse.save).toHaveBeenCalled()
      expect(result).toBe(mockCourse)
    })

    it('throws 404 if course not found', async () => {
      mockFindById.mockResolvedValue(null)

      await expect(CourseService.updateCourse('invalidId', {})).rejects.toThrow(AppError)
    })
  })

  describe('updateCourseStatus', () => {
    it('updates course status successfully', async () => {
      mockFindByIdAndUpdate.mockResolvedValue({ status: 'published' })

      await CourseService.updateCourseStatus('someId', 'published')

      expect(mockFindByIdAndUpdate).toHaveBeenCalledWith('someId', { status: 'published' }, { new: true, runValidators: true })
    })

    it('throws 404 if course not found', async () => {
      mockFindByIdAndUpdate.mockResolvedValue(null)

      await expect(CourseService.updateCourseStatus('invalidId', 'published')).rejects.toThrow(AppError)
    })
  })

  describe('deleteCourse', () => {
    it('soft deletes (archives) a course if orders exist', async () => {
      const mockCourse: any = { status: 'published', save: jest.fn() }
      mockFindById.mockResolvedValue(mockCourse)
      mockOrderExists.mockResolvedValue({ _id: 'some-order' }) // Orders exist

      const result = await CourseService.deleteCourse('someId')

      expect(mockOrderExists).toHaveBeenCalledWith({ courseId: 'someId' })
      expect(mockCourse.status).toBe('archived')
      expect(mockCourse.save).toHaveBeenCalled()
      expect(result.action).toBe('archived')
    })

    it('hard deletes a course and related lessons if no orders exist', async () => {
      const mockCourse: any = { status: 'published' }
      mockFindById.mockResolvedValue(mockCourse)
      mockOrderExists.mockResolvedValue(null) // No orders
      mockFindByIdAndDelete.mockResolvedValue(mockCourse)
      mockLessonDeleteMany.mockResolvedValue({ deletedCount: 2 })

      const result = await CourseService.deleteCourse('someId')

      expect(mockOrderExists).toHaveBeenCalledWith({ courseId: 'someId' })
      expect(mockLessonDeleteMany).toHaveBeenCalledWith({ courseId: 'someId' })
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith('someId')
      expect(result.action).toBe('deleted')
    })

    it('throws 404 if course not found for deletion', async () => {
      mockFindById.mockResolvedValue(null)

      await expect(CourseService.deleteCourse('invalidId')).rejects.toThrow(AppError)
    })
  })
})
