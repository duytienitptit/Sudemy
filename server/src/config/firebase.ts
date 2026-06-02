import admin from 'firebase-admin'
import { env } from '@/config/env'
import { logger } from '@/config/logger'

/**
 * Initialize Firebase Admin SDK as a singleton.
 * Reads credentials from environment variables (validated by env.ts).
 * Safe to call multiple times — only initializes once.
 */
function initFirebase(): admin.app.App | null {
  if (admin.apps.length > 0) {
    return admin.apps[0]!
  }

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    logger.warn('Firebase credentials not fully configured — auth middleware will reject all requests')
    return null
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        // Cloud env stores \n as literal "\\n" — normalize here
        privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    })
  } catch (error) {
    logger.error('Failed to initialize Firebase — check FIREBASE_PRIVATE_KEY format:', error)
    logger.warn('Server will continue without Firebase auth. Login will not work.')
    return null
  }
}

const firebaseApp = initFirebase()

export const firebaseAuth = firebaseApp ? admin.auth() : (null as unknown as admin.auth.Auth)
