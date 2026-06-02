import { Prompt } from '@/models/Prompt'
import { AppError } from '@/middlewares/errorHandler'

interface ListPromptsFilters {
  page?: number
  limit?: number
  type?: 'image' | 'video'
  search?: string
}

export class PromptService {
  static async getPrompts(filters: ListPromptsFilters) {
    const page = filters.page || 1
    const limit = filters.limit || 12
    const skip = (page - 1) * limit

    const query: any = {}

    if (filters.type) {
      query.type = filters.type
    }

    if (filters.search) {
      const escapedSearch = filters.search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
      query.title = { $regex: new RegExp(escapedSearch, 'i') }
    }

    const [prompts, total] = await Promise.all([
      Prompt.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Prompt.countDocuments(query),
    ])

    return {
      prompts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  static async getPromptBySlug(slug: string) {
    const prompt = await Prompt.findOne({ slug })
    if (!prompt) {
      throw new AppError('Prompt không tìm thấy', 404)
    }
    return prompt
  }

  static async createPrompt(data: any) {
    const prompt = await Prompt.create(data)
    return prompt
  }

  static async updatePrompt(id: string, data: any) {
    const prompt = await Prompt.findById(id)
    if (!prompt) {
      throw new AppError('Prompt không tìm thấy', 404)
    }
    Object.assign(prompt, data)
    await prompt.save()
    return prompt
  }

  static async deletePrompt(id: string) {
    const prompt = await Prompt.findByIdAndDelete(id)
    if (!prompt) {
      throw new AppError('Prompt không tìm thấy', 404)
    }
    return prompt
  }

  static async incrementCopyCount(id: string) {
    const prompt = await Prompt.findByIdAndUpdate(
      id,
      { $inc: { copyCount: 1 } },
      { new: true },
    )
    if (!prompt) {
      throw new AppError('Prompt không tìm thấy', 404)
    }
    return prompt
  }
}
