import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

// ─── Firebase config from environment variables ───────────────────────────────
// All VITE_ vars are injected at build time by Vite.
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID as string,
}

// ─── Graceful init — avoids crash when env vars are missing in dev ────────────

let app: FirebaseApp
let auth: Auth

try {
  // Avoid re-initialising on HMR
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
} catch (e) {
  console.warn(
    '[Firebase] Initialization failed. Auth features will be disabled.\n' +
    'Please create client/.env from client/.env.example and add your Firebase Web SDK config.\n',
    e,
  )
  // Create a minimal stub so imports don't break
  app = {} as FirebaseApp
  auth = {} as Auth
}

/**
 * Firebase Auth instance for client-side authentication.
 * Used by AuthContext to listen for auth state changes
 * and to sign in / sign out users.
 */
export { auth }
export default app
