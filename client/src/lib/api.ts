import axios from 'axios'

// ─── Axios instance ───────────────────────────────────────────────────────────

/**
 * Pre-configured Axios instance for the Sudemy backend API.
 *
 * - Base URL comes from the VITE_API_URL environment variable.
 * - Auth token is injected via a request interceptor (set by AuthContext).
 * - 401 responses trigger a logout via the window event system to avoid
 *   circular dependency with AuthContext.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

// ─── Request interceptor: inject Bearer token ─────────────────────────────────

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Response interceptor: handle 401 globally ───────────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Fire a custom event so AuthContext can react without circular imports
      window.dispatchEvent(new CustomEvent('sudemy:auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

// ─── Token storage helpers ────────────────────────────────────────────────────

const TOKEN_KEY = 'sudemy_token'

export function setStoredToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function removeStoredToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export default api
