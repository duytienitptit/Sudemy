import { Course } from '@/models/Course'
import { Lesson } from '@/models/Lesson'
import { Order } from '@/models/Order'
import { AppError } from '@/middlewares/errorHandler'

interface ListCoursesFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  status?: 'draft' | 'published' | 'archived'
  minPrice?: number
  maxPrice?: number
}

export class CourseService {
  static async getCourses(filters: ListCoursesFilters, isAdmin: boolean = false) {
    const page = filters.page || 1
    const limit = filters.limit || 12
    const skip = (page - 1) * limit

    const query: any = {}

    // Status filtering based on role
    if (!isAdmin) {
      query.status = 'published'
    } else if (filters.status) {
      query.status = filters.status
    }

    if (filters.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      query.$or = [
        { title: regex },
        { description: regex },
        { instructor: regex },
      ]
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {}
      if (filters.minPrice !== undefined) query.price.$gte = filters.minPrice
      if (filters.maxPrice !== undefined) query.price.$lte = filters.maxPrice
    }

    // Determine sorting
    let sortQuery: any = {}
    const sortField = filters.sortBy || 'createdAt'
    const sortOrder = filters.order === 'asc' ? 1 : -1
    sortQuery[sortField] = sortOrder

    console.log("Course Query:", JSON.stringify(query))

    const [courses, total] = await Promise.all([
      Course.find(query).sort(sortQuery).skip(skip).limit(limit),
      Course.countDocuments(query),
    ])

    return {
      courses,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static async getCourseBySlug(slug: string): Promise<Record<string, unknown>> {
    const course = await Course.findOne({ slug }).lean()
    if (!course) {
      throw new AppError('Course not found', 404)
    }

    const lessons = await Lesson.find({ courseId: course._id })
      .select('_id title slug order isFree')
      .sort({ order: 1 })
      .lean()

    return {
      ...course,
      lessons,
    }
  }

  static async getCourseById(id: string): Promise<Record<string, unknown>> {
    const course = await Course.findById(id).lean()
    if (!course) {
      throw new AppError('Course not found', 404)
    }
    return course
  }

  static async createCourse(data: any) {
    const course = await Course.create(data)
    return course
  }

  static async updateCourse(id: string, data: any) {
    const course = await Course.findById(id)
    if (!course) {
      throw new AppError('Course not found', 404)
    }

    Object.assign(course, data)
    await course.save() // Triggers pre-save hook for slug regeneration if title changed
    return course
  }

  static async updateCourseStatus(id: string, status: 'draft' | 'published' | 'archived') {
    const course = await Course.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    )
    if (!course) {
      throw new AppError('Course not found', 404)
    }
    return course
  }

  static async deleteCourse(id: string) {
    const course = await Course.findById(id)
    if (!course) {
      throw new AppError('Course not found', 404)
    }

    // Check if any orders exist for this course
    const hasOrders = await Order.exists({ courseId: id })

    if (hasOrders) {
      // Soft delete
      course.status = 'archived'
      await course.save()
      return { course, action: 'archived' }
    } else {
      // Hard delete
      // Optional: Delete all related lessons too if needed (unspecified in spec, but good practice). 
      // Spec says: "Soft delete (set status to 'archived') or hard delete if no orders exist."
      await Lesson.deleteMany({ courseId: id })
      await Course.findByIdAndDelete(id)
      return { action: 'deleted' }
    }
  }
}
