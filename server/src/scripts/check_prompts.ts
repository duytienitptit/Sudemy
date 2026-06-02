import 'dotenv/config'
import mongoose from 'mongoose'
import { env } from '@/config/env'

async function main() {
  await mongoose.connect(env.MONGODB_URI)
  const col = mongoose.connection.db!.collection('prompts')
  const count = await col.countDocuments()
  console.log('Prompts in DB:', count)
  const sample = await col.findOne()
  console.log('Sample:', JSON.stringify(sample, null, 2))
  await mongoose.disconnect()
}
main()
