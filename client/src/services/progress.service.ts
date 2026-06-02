import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import type { ProgressResponse, CompleteLessonResponse } from '@/types/progress.types'

/**
 * Fetch progress for a specific course for the authenticated user
 */
export async function getCourseProgress(courseId: string): Promise<ProgressResponse> {
  const { data } = await api.get<ApiResponse<ProgressResponse>>(`/progress/${courseId}`)
  return data.data
}

/**
 * Mark a lesson as completed
 */
export async function completeLesson(
  courseId: string,
  lessonId: string,
  quizScore?: number
): Promise<CompleteLessonResponse> {
  const { data } = await api.post<ApiResponse<CompleteLessonResponse>>(`/progress/complete`, {
    courseId,
    lessonId,
    quizScore,
  })
  return data.data
}

/**
 * Fetch all certificates for the current user
 */
export async function getCertificates(): Promise<any[]> {
  const { data } = await api.get<ApiResponse<any[]>>(`/certificates`)
  return data.data
}
