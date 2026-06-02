import 'dotenv/config'
import mongoose from 'mongoose'
import { env } from '@/config/env'

async function main() {
  // IMPORTANT: Must use same dbName as server (database.ts)
  await mongoose.connect(env.MONGODB_URI, { dbName: 'sudemy' })
  const db = mongoose.connection.db!
  
  console.log('Database name:', db.databaseName)
  
  // Find ALL docs with admin email
  const users = await db.collection('users').find(
    { email: 'admin@sudemy.vn' },
    { projection: { email: 1, role: 1, _id: 1, createdAt: 1 } }
  ).toArray()
  console.log('Admin users in sudemy DB:', JSON.stringify(users, null, 2))
  
  // Update all admin@sudemy.vn to role: admin
  const result = await db.collection('users').updateMany(
    { email: 'admin@sudemy.vn' },
    { $set: { role: 'admin' } }
  )
  console.log(`✅ Updated ${result.modifiedCount} document(s) to admin role`)
  
  await mongoose.disconnect()
}

main().catch(console.error)
