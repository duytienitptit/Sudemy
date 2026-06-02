// ── Shared base types for Sudemy ──

export type UserRole = 'student' | 'instructor' | 'admin'

export interface User {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
