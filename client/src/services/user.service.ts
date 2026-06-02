import api from '@/lib/api'

export interface IUser {
  _id: string
  name: string
  email: string
  role: 'user' | 'editor' | 'admin'
  createdAt: string
  lastLogin?: string
}

export interface GetUsersParams {
  page?: number
  limit?: number
  search?: string
  role?: string
}

interface UsersResponse {
  success: boolean
  data: IUser[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

export const getUsers = async (params?: GetUsersParams): Promise<UsersResponse> => {
  const { data } = await api.get<UsersResponse>('/users', { params })
  return data
}

export const updateUserRole = async (userId: string, role: 'user' | 'editor' | 'admin'): Promise<IUser> => {
  const { data } = await api.patch<{ success: boolean; data: IUser }>(`/users/${userId}/role`, { role })
  return data.data
}
