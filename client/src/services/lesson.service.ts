import api from '@/lib/api'
import type { ApiResponse } from '@/types'
import type { Lesson } from '@/types/course.types'
import type { QuizSubmissionRequest, QuizSubmissionResponse } from '@/types/progress.types'

/**
 * Fetch a single lesson by its ID
 * (Requires auth if the lesson is not free)
 */
export async function getLessonById(id: string): Promise<Lesson> {
  const { data } = await api.get<ApiResponse<{ lesson: Lesson }>>(`/lessons/${id}`)
  return data.data.lesson
}

/**
 * Submit answers for a lesson's quiz
 */
export async function submitQuiz(
  id: string,
  submission: QuizSubmissionRequest
): Promise<QuizSubmissionResponse> {
  const { data } = await api.post<ApiResponse<QuizSubmissionResponse>>(
    `/lessons/${id}/quiz/submit`,
    submission
  )
  return data.data
}

/**
 * Fetch all lessons for a course (Admin)
 */
export async function getCourseLessons(courseId: string): Promise<Lesson[]> {
  const { data } = await api.get<ApiResponse<Lesson[]>>(`/courses/${courseId}/lessons`)
  return data.data
}

/**
 * Create a new lesson (Admin)
 */
export async function createLesson(
  courseId: string,
  lessonData: Partial<Lesson>
): Promise<Lesson> {
  const { data } = await api.post<ApiResponse<{ lesson: Lesson }>>(
    `/courses/${courseId}/lessons`,
    lessonData
  )
  return data.data.lesson
}

/**
 * Update a lesson (Admin)
 */
export async function updateLesson(
  id: string,
  lessonData: Partial<Lesson>
): Promise<Lesson> {
  const { data } = await api.put<ApiResponse<{ lesson: Lesson }>>(
    `/lessons/${id}`,
    lessonData
  )
  return data.data.lesson
}

/**
 * Delete a lesson (Admin)
 */
export async function deleteLesson(id: string): Promise<void> {
  await api.delete(`/lessons/${id}`)
}
