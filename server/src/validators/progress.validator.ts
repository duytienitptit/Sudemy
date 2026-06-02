import { z } from 'zod'

export const completeLessonSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Course ID'),
  lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Lesson ID'),
  quizScore: z.number().min(0, 'Quiz score must be at least 0').max(100, 'Quiz score must be at most 100').optional(),
})

export const courseIdParamSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Course ID'),
})
