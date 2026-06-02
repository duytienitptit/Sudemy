import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import type { ReactNode } from 'react'

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

/**
 * Redirects unauthenticated users to /login, preserving the intended destination
 * in the `state.from` property so the login page can redirect back after success.
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

// ─── AdminRoute ───────────────────────────────────────────────────────────────

/**
 * Extends ProtectedRoute: also requires `role === 'admin'`.
 * Non-admin authenticated users are redirected to /dashboard.
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

// ─── Loading screen ───────────────────────────────────────────────────────────

function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div
          className="w-10 h-10 rounded-full border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] animate-spin"
          role="status"
          aria-label="Đang tải..."
        />
        <p className="text-body-sm text-[var(--color-on-surface-variant)]">Đang tải...</p>
      </div>
    </div>
  )
}
