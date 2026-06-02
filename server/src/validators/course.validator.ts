import { z } from 'zod'

// Accepts standard https:// URLs or base64 data URIs (data:image/...)
const thumbnailSchema = z
  .string()
  .min(1, 'Thumbnail is required')
  .refine(
    (val) => {
      // Accept http/https URL
      try { new URL(val); return true } catch { /* not a URL */ }
      // Accept base64 data URI for images
      if (val.startsWith('data:image/')) return true
      return false
    },
    { message: 'Thumbnail must be a valid URL or uploaded image' }
  )

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  thumbnail: thumbnailSchema,
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  originalPrice: z.coerce.number().min(0, 'Original price must be non-negative').optional(),
  instructor: z.string().min(1, 'Instructor is required'),
  previewLessons: z.coerce.number().min(0).optional(),
  status: z.enum(['draft', 'published']).optional().default('draft'),
})

export const updateCourseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title must be at most 200 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  thumbnail: thumbnailSchema.optional(),
  price: z.coerce.number().min(0, 'Price must be non-negative').optional(),
  originalPrice: z.coerce.number().min(0, 'Original price must be non-negative').optional().nullable(),
  instructor: z.string().min(1, 'Instructor is required').optional(),
  previewLessons: z.coerce.number().min(0).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export const updateCourseStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived'], {
    errorMap: () => ({ message: 'Status must be draft, published, or archived' }),
  }),
})

export const courseIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Course ID'),
})

export const courseSlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
})

export const listCoursesQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  minPrice: z.string().regex(/^\d+$/).optional(),
  maxPrice: z.string().regex(/^\d+$/).optional(),
})
