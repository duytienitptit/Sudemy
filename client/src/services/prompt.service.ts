import api from '@/lib/api'

export interface IPrompt {
  _id: string
  title: string
  slug: string
  content: string
  type: 'image' | 'video'
  sampleImage?: string
  copyCount: number
  createdAt: string
  updatedAt: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface PromptsResponse {
  status: string
  data: {
    prompts: IPrompt[]
    pagination: PaginationInfo
  }
}

interface PromptDetailResponse {
  status: string
  data: {
    prompt: IPrompt
  }
}

export interface GetPromptsParams {
  page?: number
  limit?: number
  search?: string
  type?: 'image' | 'video'
}

export const getPrompts = async (params?: GetPromptsParams): Promise<{ prompts: IPrompt[], pagination: PaginationInfo }> => {
  const { data } = await api.get<PromptsResponse>('/prompts', { params })
  return data.data
}

export const getPromptBySlug = async (slug: string): Promise<IPrompt> => {
  const { data } = await api.get<PromptDetailResponse>(`/prompts/${slug}`)
  return data.data.prompt
}


export const createPrompt = async (promptData: Partial<IPrompt>): Promise<IPrompt> => {
  const { data } = await api.post<PromptDetailResponse>('/prompts', promptData)
  return data.data.prompt
}

export const updatePrompt = async (id: string, promptData: Partial<IPrompt>): Promise<IPrompt> => {
  const { data } = await api.put<PromptDetailResponse>(`/prompts/${id}`, promptData)
  return data.data.prompt
}

export const deletePrompt = async (id: string): Promise<void> => {
  await api.delete(`/prompts/${id}`)
}
