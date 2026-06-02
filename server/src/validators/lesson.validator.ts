import { z } from 'zod'

const youtubeUrlRegex = /^(https?:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/

const quizItemSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(500),
  options: z.array(z.string().min(1, 'Option cannot be empty')).min(3, 'Must provide at least 3 options').max(4, 'Must provide at most 4 options'),
  correctAnswer: z.number().int().min(0),
}).refine(data => data.correctAnswer < data.options.length, {
  message: 'Correct answer index must be within options range',
  path: ['correctAnswer'],
})

export const createLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  youtubeUrl: z.string().regex(youtubeUrlRegex, 'Must be a valid YouTube URL'),
  order: z.number().int().min(0, 'Order must be a positive integer'),
  isFree: z.boolean().optional().default(false),
  quiz: z.array(quizItemSchema).optional().default([]),
})

export const updateLessonSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  youtubeUrl: z.string().regex(youtubeUrlRegex).optional(),
  order: z.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
  quiz: z.array(quizItemSchema).optional(),
})

export const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      selectedOption: z.number().int().min(0),
    })
  ),
})
