/**
 * cleanup-users.ts
 * ─────────────────
 * Giữ lại DUY NHẤT tài khoản admin gắn với Gmail: duytienit04@gmail.com
 * Xóa toàn bộ tài khoản khác khỏi Firebase Auth + MongoDB.
 *
 * Usage:
 *   cd server && npx tsx src/scripts/cleanup-users.ts
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { env } from '@/config/env'
import { logger } from '@/config/logger'
import { firebaseAuth } from '@/config/firebase'
import { User } from '@/models/User'

const ADMIN_GOOGLE_EMAIL = 'duytienit04@gmail.com'
const ADMIN_NAME = 'Sudemy Admin'

async function main() {
  logger.info('🧹 Starting user cleanup…')
  logger.info(`   Keeping ONLY: ${ADMIN_GOOGLE_EMAIL}`)

  await mongoose.connect(env.MONGODB_URI)
  logger.info('✅ Connected to MongoDB')

  // ── Step 1: Ensure Firebase user exists for the Google account ────────────
  let keepUid: string
  try {
    const fbUser = await firebaseAuth.getUserByEmail(ADMIN_GOOGLE_EMAIL)
    keepUid = fbUser.uid
    logger.info(`✅ Firebase user found`, { uid: keepUid, email: ADMIN_GOOGLE_EMAIL })
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      // User has never signed in via Google to this Firebase project yet.
      // We cannot pre-create a Google OAuth user via Admin SDK — they must
      // sign in via Google at least once to generate a Firebase UID.
      logger.error(
        '❌ Firebase user not found for this Google account.\n' +
        '   The user must sign in with Google (via the app) at least once first.\n' +
        '   After they sign in, re-run this script.',
      )
      process.exit(1)
    }
    throw err
  }

  // ── Step 2: Upsert MongoDB admin record for this Firebase UID ─────────────
  let adminMongoUser = await User.findOne({ firebaseUid: keepUid })

  if (!adminMongoUser) {
    // Also check by email (in case created with different UID previously)
    adminMongoUser = await User.findOne({ email: ADMIN_GOOGLE_EMAIL })
  }

  if (adminMongoUser) {
    // Ensure it's admin and linked to correct UID
    adminMongoUser.firebaseUid = keepUid
    adminMongoUser.email = ADMIN_GOOGLE_EMAIL
    adminMongoUser.fullName = adminMongoUser.fullName || ADMIN_NAME
    adminMongoUser.role = 'admin'
    await adminMongoUser.save()
    logger.info('✅ MongoDB admin user updated', {
      _id: adminMongoUser._id,
      email: adminMongoUser.email,
      firebaseUid: adminMongoUser.firebaseUid,
    })
  } else {
    adminMongoUser = await User.create({
      firebaseUid: keepUid,
      fullName: ADMIN_NAME,
      email: ADMIN_GOOGLE_EMAIL,
      role: 'admin',
    })
    logger.info('✅ MongoDB admin user created', {
      _id: adminMongoUser._id,
      email: adminMongoUser.email,
    })
  }

  const keepMongoId = String(adminMongoUser._id)

  // ── Step 3: Delete all OTHER MongoDB users ────────────────────────────────
  const deleteResult = await User.deleteMany({ _id: { $ne: keepMongoId } })
  logger.info(`🗑️  Deleted ${deleteResult.deletedCount} MongoDB user(s)`)

  // ── Step 4: Delete all OTHER Firebase users ───────────────────────────────
  logger.info('🔍 Listing all Firebase users…')
  const allFirebaseUsers: string[] = []
  let nextPageToken: string | undefined

  do {
    const listResult = await firebaseAuth.listUsers(1000, nextPageToken)
    for (const fbUser of listResult.users) {
      if (fbUser.uid !== keepUid) {
        allFirebaseUsers.push(fbUser.uid)
      }
    }
    nextPageToken = listResult.pageToken
  } while (nextPageToken)

  if (allFirebaseUsers.length === 0) {
    logger.info('✅ No other Firebase users to delete')
  } else {
    logger.info(`🗑️  Deleting ${allFirebaseUsers.length} Firebase user(s)…`)
    // deleteUsers supports up to 1000 UIDs per call
    const chunkSize = 1000
    for (let i = 0; i < allFirebaseUsers.length; i += chunkSize) {
      const chunk = allFirebaseUsers.slice(i, i + chunkSize)
      const result = await firebaseAuth.deleteUsers(chunk)
      logger.info(`   Deleted chunk: success=${result.successCount}, failed=${result.failureCount}`)
      if (result.errors.length > 0) {
        result.errors.forEach((e) =>
          logger.warn(`   Failed to delete UID=${e.index}: ${e.error.message}`),
        )
      }
    }
  }

  // ── Step 5: Summary ───────────────────────────────────────────────────────
  logger.info('')
  logger.info('✅ Cleanup complete!')
  logger.info(`   Retained admin account: ${ADMIN_GOOGLE_EMAIL}`)
  logger.info(`   Firebase UID           : ${keepUid}`)
  logger.info(`   MongoDB _id            : ${keepMongoId}`)
  logger.info('')
  logger.info('⚠️  Login method: Google Sign-In only (no email/password)')
}

main()
  .catch((err) => {
    logger.error('❌ Cleanup failed', { error: err.message, stack: err.stack })
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
    logger.info('🔌 Disconnected from MongoDB')
  })
