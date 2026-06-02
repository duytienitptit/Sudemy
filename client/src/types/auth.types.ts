/** Shared types for authenticated user data returned from the API */

export type UserRole = 'user' | 'editor' | 'moderator' | 'admin'

export interface AuthUser {
  _id: string
  fullName: string
  email: string
  role: UserRole
  purchasedCourses: string[]
  createdAt: string
}
