import type { PaginatedResponse } from './index'

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

export interface Lesson {
  _id: string
  courseId: string
  title: string
  slug: string
  youtubeUrl?: string
  order: number
  isFree: boolean
  quiz?: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

export interface Course {
  _id: string
  title: string
  slug: string
  description: string
  thumbnail: string
  price: number
  originalPrice?: number
  instructor: string
  status: 'draft' | 'published' | 'archived'
  totalLessons: number
  previewLessons: number
  ratings: {
    average: number
    count: number
  }
  lessons?: Lesson[]
  createdAt: string
  updatedAt: string
}

export interface CourseFilters {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  order?: 'asc' | 'desc'
  status?: string
}

export type CourseListResponse = PaginatedResponse<Course>
