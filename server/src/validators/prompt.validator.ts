import { z } from 'zod'

export const createPromptSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  type: z.enum(['image', 'video'], { errorMap: () => ({ message: 'Loại phải là image hoặc video' }) }),
  sampleImage: z.string().url('URL ảnh mẫu không hợp lệ').optional().or(z.literal('')),
})

export const updatePromptSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').optional(),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự').optional(),
  type: z.enum(['image', 'video']).optional(),
  sampleImage: z.string().url('URL ảnh mẫu không hợp lệ').optional().or(z.literal('')),
})

export const promptIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID Prompt không hợp lệ'),
})

export const promptSlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug là bắt buộc'),
})

export const listPromptsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  type: z.enum(['image', 'video']).optional(),
  search: z.string().optional(),
})
