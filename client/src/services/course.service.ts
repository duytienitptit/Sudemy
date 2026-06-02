import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import type { Course, CourseFilters, CourseListResponse } from '@/types/course.types'

/**
 * Fetch a paginated list of courses with optional filtering
 * Backend returns { courses: Course[], meta: { total, page, limit, totalPages } }
 * Normalized to PaginatedResponse shape for DataTable compatibility
 */
export async function getCourses(filters?: CourseFilters): Promise<CourseListResponse> {
  const { data } = await api.get<ApiResponse<any>>('/courses', {
    params: filters,
  })
  const raw = data.data
  // Normalize: backend returns { courses, meta } → reshape to PaginatedResponse
  if (raw && raw.courses !== undefined) {
    return {
      data: raw.courses,
      total: raw.meta?.total ?? raw.courses.length,
      page: raw.meta?.page ?? 1,
      limit: raw.meta?.limit ?? 10,
      totalPages: raw.meta?.totalPages ?? 1,
    }
  }
  return raw
}

/**
 * Fetch a single course by its slug
 */
export async function getCourseBySlug(slug: string): Promise<Course> {
  // API returns { course: Course } inside the data object
  const { data } = await api.get<ApiResponse<{ course: Course }>>(`/courses/${slug}`)
  return data.data.course
}

/**
 * Fetch a single course by ID (Admin)
 */
export async function getCourseById(id: string): Promise<Course> {
  const { data } = await api.get<ApiResponse<{ course: Course }>>(`/courses/detail/${id}`)
  return data.data.course
}

/**
 * Create a new course (Admin)
 */
export async function createCourse(
  courseData: Partial<Course>
): Promise<Course> {
  const { data } = await api.post<ApiResponse<{ course: Course }>>(
    '/courses',
    courseData
  )
  return data.data.course
}

/**
 * Update an existing course (Admin)
 */
export async function updateCourse(
  id: string,
  courseData: Partial<Course>
): Promise<Course> {
  const { data } = await api.put<ApiResponse<{ course: Course }>>(
    `/courses/${id}`,
    courseData
  )
  return data.data.course
}

/**
 * Delete a course (Admin)
 */
export async function deleteCourse(id: string): Promise<void> {
  await api.delete(`/courses/${id}`)
}

/**
 * Update course status (Admin)
 */
export async function updateCourseStatus(
  id: string,
  status: 'draft' | 'published' | 'archived'
): Promise<Course> {
  const { data } = await api.patch<ApiResponse<{ course: Course }>>(
    `/courses/${id}/status`,
    { status }
  )
  return data.data.course
}

// getMyOrders has moved to @/services/payment.service
