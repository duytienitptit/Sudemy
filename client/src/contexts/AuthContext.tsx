import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import api, { setStoredToken, removeStoredToken } from '@/lib/api'
import type { AuthUser } from '@/types/auth.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

interface AuthContextValue {
  /** Currently signed-in application user (null = unauthenticated) */
  user: AuthUser | null
  /** Firebase user object (used internally; exposed for advanced use-cases) */
  firebaseUser: FirebaseUser | null
  /** True while the initial auth state is being determined */
  loading: boolean
  /** True while a login / register / logout operation is in-flight */
  authLoading: boolean
  login: (email: string, password: string) => Promise<string>
  loginWithGoogle: () => Promise<string>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  /** Re-sync user data from the backend (e.g. after payment updates purchasedCourses) */
  refreshUser: () => Promise<void>
  /** Directly update purchasedCourses in local state without backend round-trip */
  updatePurchasedCourses: (courses: string[]) => void
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

const googleProvider = new GoogleAuthProvider()

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)      // initial auth state check
  const [authLoading, setAuthLoading] = useState(false)
  // Ref tracks authLoading for use inside async closures (avoids stale closure)
  const authLoadingRef = useRef(false)

  // ── Helper: exchange Firebase ID token for app JWT + user data ────────────

  const syncWithBackend = useCallback(async (fbUser: FirebaseUser): Promise<AuthUser> => {
    const idToken = await fbUser.getIdToken()
    const { data } = await api.post<{ success: boolean; data: { user: AuthUser; token: string } }>(
      '/auth/login',
      { idToken },
    )
    setStoredToken(data.data.token)
    setUser(data.data.user)
    return data.data.user
  }, [])

  // ── Listen for Firebase auth state changes ────────────────────────────────

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    try {
      unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setFirebaseUser(fbUser)

        // Skip background sync when an explicit login/register/logout is
        // already handling the backend round-trip — prevents race conditions
        // where a stale onAuthStateChanged event overwrites fresh user state.
        if (authLoadingRef.current) {
          setLoading(false)
          return
        }

        if (fbUser) {
          try {
            await syncWithBackend(fbUser)
          } catch {
            // Backend sync failed (e.g. first registration handled separately)
            setUser(null)
            removeStoredToken()
          }
        } else {
          setUser(null)
          removeStoredToken()
        }
        setLoading(false)
      })
    } catch (e) {
      // Firebase not configured (e.g. missing env vars in dev)
      console.warn('[AuthContext] Firebase not configured:', e)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false)
    }

    return () => unsubscribe?.()
  }, [syncWithBackend])

  // ── Listen for global 401 events from api.ts interceptor ──────────────────

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null)
      removeStoredToken()
      signOut(auth).catch(() => null)
    }
    window.addEventListener('sudemy:auth:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('sudemy:auth:unauthorized', handleUnauthorized)
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<string> => {
    authLoadingRef.current = true
    setAuthLoading(true)
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const loggedInUser = await syncWithBackend(credential.user)
      return loggedInUser.role
    } finally {
      authLoadingRef.current = false
      setAuthLoading(false)
    }
  }, [syncWithBackend])

  const loginWithGoogle = useCallback(async (): Promise<string> => {
    authLoadingRef.current = true
    setAuthLoading(true)
    try {
      const credential = await signInWithPopup(auth, googleProvider)
      const loggedInUser = await syncWithBackend(credential.user)
      return loggedInUser.role
    } finally {
      authLoadingRef.current = false
      setAuthLoading(false)
    }
  }, [syncWithBackend])

  const register = useCallback(
    async ({ fullName, email, password }: RegisterPayload): Promise<void> => {
      setAuthLoading(true)
      try {
        // Call our backend register endpoint (creates Firebase user + MongoDB doc)
        const { data } = await api.post<{ success: boolean; data: { user: AuthUser; token: string } }>(
          '/auth/register',
          { fullName, email, password },
        )
        setStoredToken(data.data.token)
        setUser(data.data.user)

        // Sign in to Firebase so onAuthStateChanged fires and keeps SDK in sync
        await signInWithEmailAndPassword(auth, email, password)
        // Update Firebase display name
        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: fullName })
        }
      } finally {
        setAuthLoading(false)
      }
    },
    [],
  )

  const logout = useCallback(async (): Promise<void> => {
    setAuthLoading(true)
    try {
      await signOut(auth)
      setUser(null)
      removeStoredToken()
    } finally {
      setAuthLoading(false)
    }
  }, [])

  // Re-sync user data from backend (useful after payment updates purchasedCourses)
  const refreshUser = useCallback(async (): Promise<void> => {
    const fbUser = firebaseUser
    if (!fbUser) return
    try {
      await syncWithBackend(fbUser)
    } catch {
      // Refresh failed — keep current state
    }
  }, [firebaseUser, syncWithBackend])

  // Directly update purchasedCourses without backend round-trip
  const updatePurchasedCourses = useCallback((courses: string[]) => {
    setUser((prev) => prev ? { ...prev, purchasedCourses: courses } : prev)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, loading, authLoading, login, loginWithGoogle, register, logout, refreshUser, updatePurchasedCourses }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Access the authentication context. Must be used inside `<AuthProvider>`.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
