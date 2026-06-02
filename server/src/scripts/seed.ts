/**
 * Seed Script — Sudemy Full Sample Data
 * Usage: npx tsx src/scripts/seed.ts
 *        npx tsx src/scripts/seed.ts --reset
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { env } from '@/config/env'
import { logger } from '@/config/logger'
import { firebaseAuth } from '@/config/firebase'
import { User } from '@/models/User'
import { Settings } from '@/models/Settings'

import { Course } from '@/models/Course'
import { Lesson } from '@/models/Lesson'
import { Prompt } from '@/models/Prompt'
import { Coupon } from '@/models/Coupon'
import { FlashSale } from '@/models/FlashSale'

const args = process.argv.slice(2)
const RESET = args.includes('--reset')

const ADMIN_EMAIL = 'admin@sudemy.vn'
const ADMIN_PASSWORD = 'Admin@2026!'
const ADMIN_NAME = 'Nguyễn Văn Admin'

const STUDENT_EMAIL = 'student@sudemy.vn'
const STUDENT_PASSWORD = 'Student@2026!'
const STUDENT_NAME = 'Phạm Minh Tuấn'
// ─── Settings ────────────────────────────────────────────────────────────────

async function seedSettings() {
  logger.info('⚙️  Seeding settings…')
  const existing = await Settings.findOne()
  if (existing) { logger.info('✅ Settings already exist, skipping'); return }
  await Settings.create({
    siteName: 'Sudemy',
    siteDescription: 'Nền tảng học AI thực chiến hàng đầu Việt Nam',
    contactEmail: 'contact@sudemy.vn',
    socialLinks: {
      facebook: 'https://facebook.com/sudemy',
      youtube: 'https://youtube.com/@sudemy',
      tiktok: 'https://tiktok.com/@sudemy',
    },
  })
  logger.info('✅ Settings seeded')
}

// ─── Admin User ───────────────────────────────────────────────────────────────

async function seedAdminUser() {
  logger.info('🔑 Seeding admin user…')
  const existingUser = await User.findOne({ email: ADMIN_EMAIL })
  if (existingUser) {
    if (existingUser.role !== 'admin') {
      existingUser.role = 'admin'
      await existingUser.save()
      logger.info('✅ Existing user promoted to admin')
    } else {
      logger.info('✅ Admin user already exists, skipping')
    }
    return
  }

  let firebaseUid: string
  try {
    const fbUser = await firebaseAuth.createUser({
      email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
      displayName: ADMIN_NAME, emailVerified: true,
    })
    firebaseUid = fbUser.uid
    logger.info('✅ Firebase admin created', { uid: firebaseUid })
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    if (code === 'auth/email-already-exists') {
      const existing = await firebaseAuth.getUserByEmail(ADMIN_EMAIL)
      firebaseUid = existing.uid
      logger.info('✅ Firebase admin already exists', { uid: firebaseUid })
    } else { throw err }
  }

  await User.create({ firebaseUid, fullName: ADMIN_NAME, email: ADMIN_EMAIL, role: 'admin' })
  logger.info('✅ Admin user seeded')
}

// ─── Student User ─────────────────────────────────────────────────────────────

async function seedStudentUser() {
  logger.info('👤 Seeding student user…')
  const existingUser = await User.findOne({ email: STUDENT_EMAIL })
  if (existingUser) { logger.info('✅ Student user already exists, skipping'); return }

  let firebaseUid: string
  try {
    const fbUser = await firebaseAuth.createUser({
      email: STUDENT_EMAIL, password: STUDENT_PASSWORD,
      displayName: STUDENT_NAME, emailVerified: true,
    })
    firebaseUid = fbUser.uid
    logger.info('✅ Firebase student created', { uid: firebaseUid })
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? ''
    if (code === 'auth/email-already-exists') {
      const existing = await firebaseAuth.getUserByEmail(STUDENT_EMAIL)
      firebaseUid = existing.uid
      logger.info('✅ Firebase student already exists', { uid: firebaseUid })
    } else { throw err }
  }

  await User.create({ firebaseUid, fullName: STUDENT_NAME, email: STUDENT_EMAIL, role: 'user' })
  logger.info('✅ Student user seeded')
}



// ─── Courses + Lessons ────────────────────────────────────────────────────────

async function seedCoursesAndLessons() {
  logger.info('📚 Seeding courses and lessons…')
  const count = await Course.countDocuments()
  if (count > 0) { logger.info('✅ Courses already exist, skipping'); return }

  const coursesData = [
    {
      title: 'NanoBanana AI - Tạo Ảnh Sản Phẩm Chuyên Nghiệp Từ A-Z',
      description: 'Học cách sử dụng NanoBanana AI để tạo ảnh sản phẩm đẹp mắt, chuyên nghiệp cho shop online, không cần biết Photoshop.',
      thumbnail: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=800&q=80',
      price: 299000,
      originalPrice: 599000,
      instructor: ADMIN_NAME,
      status: 'published' as const,
      totalLessons: 4,
      previewLessons: 2,
      ratings: { average: 4.8, count: 45 },
      lessons: [
        { title: 'Giới thiệu NanoBanana AI và cách đăng ký tài khoản', order: 1, isFree: true, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Giao diện và các tính năng cơ bản', order: 2, isFree: true, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [{ question: 'NanoBanana AI dùng để làm gì?', options: ['Tạo video', 'Tạo ảnh sản phẩm', 'Viết content', 'Dịch thuật'], correctAnswer: 1 }] },
        { title: 'Kỹ thuật viết prompt hiệu quả', order: 3, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Dự án thực tế: Ảnh sản phẩm cho shop thời trang', order: 4, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [{ question: 'Bước nào quan trọng nhất khi tạo ảnh sản phẩm?', options: ['Chọn nền', 'Viết prompt chi tiết', 'Chọn bộ lọc', 'Resize ảnh'], correctAnswer: 1 }] },
      ],
    },
    {
      title: 'ChatGPT Thực Chiến - Viết Content Marketing X10 Năng Suất',
      description: 'Hướng dẫn chi tiết cách dùng ChatGPT để viết content marketing hiệu quả, từ caption Facebook đến blog SEO.',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      price: 399000,
      originalPrice: 799000,
      instructor: ADMIN_NAME,
      status: 'published' as const,
      totalLessons: 4,
      previewLessons: 2,
      ratings: { average: 4.6, count: 32 },
      lessons: [
        { title: 'ChatGPT là gì? Tại sao cần học AI Marketing?', order: 1, isFree: true, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Prompt Engineering căn bản cho Content Creator', order: 2, isFree: true, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Viết Caption Facebook & Instagram bán hàng', order: 3, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [{ question: 'Hook tốt nhất cho caption bán hàng nên đặt ở đâu?', options: ['Giữa bài', 'Cuối bài', 'Dòng đầu tiên', 'Phần hashtag'], correctAnswer: 2 }] },
        { title: 'Viết Blog SEO với ChatGPT từ A-Z', order: 4, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
      ],
    },
    {
      title: 'Canva AI - Thiết Kế Đồ Họa Cho Người Không Chuyên',
      description: 'Sử dụng Canva AI để tạo poster, banner, social media graphics chuyên nghiệp chỉ trong vài phút.',
      thumbnail: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80',
      price: 199000,
      originalPrice: 399000,
      instructor: ADMIN_NAME,
      status: 'published' as const,
      totalLessons: 3,
      previewLessons: 1,
      ratings: { average: 4.7, count: 28 },
      lessons: [
        { title: 'Bắt đầu với Canva AI - Tổng quan và đăng ký', order: 1, isFree: true, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Magic Design và Text to Image trong Canva', order: 2, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Thiết kế bộ nhận diện thương hiệu hoàn chỉnh', order: 3, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [{ question: 'Brand kit trong Canva chứa gì?', options: ['Chỉ logo', 'Logo, màu sắc, font chữ', 'Chỉ màu sắc', 'Chỉ template'], correctAnswer: 1 }] },
      ],
    },
    {
      title: 'CapCut AI - Chỉnh Sửa Video Cho TikTok & Reels',
      description: 'Học cách dùng CapCut AI để edit video viral cho TikTok, Instagram Reels một cách nhanh chóng.',
      thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80',
      price: 349000,
      originalPrice: 699000,
      instructor: ADMIN_NAME,
      status: 'draft' as const,
      totalLessons: 3,
      previewLessons: 1,
      ratings: { average: 0, count: 0 },
      lessons: [
        { title: 'Tổng quan CapCut AI và cài đặt', order: 1, isFree: true, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Auto-caption và dịch phụ đề tự động', order: 2, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
        { title: 'Tạo video TikTok viral từ text', order: 3, isFree: false, youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', quiz: [] },
      ],
    },
  ]

  for (const courseData of coursesData) {
    const { lessons, ...courseFields } = courseData
    const course = new Course(courseFields)
    await course.save()

    for (const lessonData of lessons) {
      const lesson = new Lesson({ courseId: course._id, ...lessonData })
      await lesson.save()
    }
    logger.info(`✅ Course seeded: ${course.title}`)
  }
  logger.info('✅ All courses and lessons seeded')
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

async function seedPrompts() {
  logger.info('💡 Seeding prompts…')
  const count = await Prompt.countDocuments()
  if (count > 0) { logger.info('✅ Prompts already exist, skipping'); return }

  const videoPromptsData = [
    { title: 'Tư thế Quyến rũ chạm váy', type: 'video' as const, content: '1-2s: Đứng 3/4 sang trái.\n2-5s: Tay trái vuốt chậm từ ngực xuống eo rồi đến hông.\n5-7s: Nhấn mạnh phần ruched bằng cách đẩy hông ra sau.\n7-8s: Nhìn máy, môi hơi hé, biểu cảm gợi cảm.', copyCount: 0 },
    { title: 'Váy Body Nhún Hông', type: 'video' as const, content: 'Đứng nghiêng người kiểu 3/4 (xoay hông sang phải hoặc trái khoảng 30-45 độ).\nĐẩy hông nhẹ ra sau để tôn đường cong và phần nhún ruched ở eo - hông.\nChân gần máy ảnh bước nhẹ về trước, chân kia duỗi thẳng sau.\nVai thả lỏng, ngực nâng tự nhiên, bụng hóp nhẹ.\nTay trái đặt nhẹ lên eo hoặc vuốt nhẹ xuống hông váy để khoe chất liệu và form.\nMặt quay về phía máy ảnh, cằm hơi nghiêng xuống, mắt nhìn thẳng hoặc nhìn hơi chếch lên, mỉm cười nhẹ tự tin.', copyCount: 0 },
    { title: 'Tư thế Quyến rũ nhẹ nhàng', type: 'video' as const, content: '1-2s: Đứng thẳng mặt trước, tay phải cầm túi, tay trái buông nhẹ.\n2-4s: Xoay người chậm sang phải 3/4, đẩy hông nhẹ ra sau.\n4-6s: Tay trái vuốt nhẹ từ eo xuống hông.\n6-8s: Ngẩng cằm, nhìn máy ảnh, mỉm cười nhẹ.', copyCount: 0 },
    { title: 'Tư thế Tự tin & Năng động', type: 'video' as const, content: '1-3s: Đứng thẳng, hai chân khép, vai mở rộng.\n3-5s: Bước chân phải lên trước một bước nhỏ, nghiêng người sang trái.\n5-7s: Tay trái đặt hông, tay phải cầm túi đưa ra sau lưng.\n7-8s: Cười rạng rỡ, nhìn thẳng máy.', copyCount: 0 },
    { title: 'Tư thế Sang trọng & Thanh lịch', type: 'video' as const, content: '1-2s: Đứng nghiêng 3/4 sang trái, tay phải cầm túi trước người.\n2-5s: Tay trái đưa lên chạm nhẹ vai phải, mắt nhìn xuống dưới.\n5-7s: Từ từ ngẩng đầu nhìn máy, vai thả lỏng.\n7-8s: Mỉm cười nhẹ nhàng, giữ tư thế.', copyCount: 0 },
    { title: 'Tư thế Quyến rũ Back View', type: 'video' as const, content: '1-3s: Quay lưng về máy, nhìn qua vai trái.\n3-5s: Tay trái vuốt dọc theo đường nhún hông.\n5-7s: Xoay hông nhẹ sang phải để khoe form.\n7-8s: Nhìn máy qua vai, môi hơi chu, biểu cảm sexy.', copyCount: 0 },
    { title: 'Tư thế Dịu dàng & Bay bổng', type: 'video' as const, content: '1-2s: Đứng thẳng, hai tay cầm túi trước bụng.\n2-5s: Xoay người chậm sang phải, tay trái buông ra và vẫy nhẹ.\n5-7s: Hông lắc nhẹ theo nhịp.\n7-8s: Quay lại nhìn máy, cười tươi.', copyCount: 0 },
    { title: 'Tư thế Bold & Cá tính', type: 'video' as const, content: '1-2s: Đứng chân rộng bằng vai, tay phải cầm túi buông thẳng.\n2-4s: Đặt tay trái lên hông, đẩy hông mạnh sang bên phải.\n4-6s: Nghiêng đầu sang trái, nhìn máy với ánh mắt mạnh mẽ.\n6-8s: Hạ tay trái xuống, bước chân phải chéo trước.', copyCount: 0 },
    { title: 'Tư thế Ngọt ngào & Duyên dáng', type: 'video' as const, content: '1-3s: Đứng nghiêng 3/4, hai tay cầm túi trước người.\n3-5s: Tay trái đưa lên chạm nhẹ má, nghiêng đầu sang phải.\n5-7s: Nhìn máy với nụ cười e thẹn.\n7-8s: Hạ tay xuống, khép chân lại duyên dáng.', copyCount: 0 },
    { title: 'Tư thế Catwalk chuyên nghiệp', type: 'video' as const, content: '1-4s: Bước chậm 2 bước về phía trước (chân phải trước).\n4-6s: Dừng lại, xoay người 3/4 sang trái.\n6-8s: Tay trái đặt sau gáy, tay phải cầm túi, nhìn thẳng máy với vẻ tự tin.', copyCount: 0 },
    { title: 'Back View Slow Motion - Vuốt lưng', type: 'video' as const, content: '0-1s: Quay lưng hoàn toàn về camera.\n1-4s: Tay trái vuốt cực chậm từ gáy xuống sống lưng rồi dừng ở eo (slow-motion).\n4-6s: Đẩy hông ra sau, lắc nhẹ hông sang hai bên.\n6-7s: Tay trái vuốt xuống lớp váy/hông.\n7-8s: Nhìn qua vai phải về camera với biểu cảm gợi cảm.', copyCount: 0 },
    { title: 'Front to Back Chuyển Mượt', type: 'video' as const, content: '0-1s: Đứng mặt trước gần camera.\n1-3s: Xoay người chậm từ front sang back view.\n3-5s: Tay trái vuốt dọc thân trang phục từ ngực xuống eo.\n5-7s: Dừng ở back view 3/4, giơ điện thoại lên quay sau.\n7-8s: Lắc nhẹ hông, nhìn qua vai.', copyCount: 0 },
    { title: 'Vuốt Chi Tiết Trang Phục (Cầm Điện Thoại)', type: 'video' as const, content: '0-2s: Đứng thẳng mặt trước.\n2-4s: Tay trái vuốt chậm từ ngực xuống eo (slow-motion).\n4-6s: Tiếp tục vuốt xuống hông và đùi.\n6-7s: Nghiêng người sang trái, nhấn mạnh form ôm.\n7-8s: Nhìn vào điện thoại, mỉm cười duyên dáng.', copyCount: 0 },
    { title: 'Xoay 360° + Lắc Hông', type: 'video' as const, content: '0-1s: Đứng mặt trước.\n1-5s: Xoay chậm một vòng 360° (slow-motion), tay trái vuốt dọc body.\n5-7s: Lắc hông nhẹ khi xoay xong.\n7-8s: Dừng ở góc 3/4, giơ phone selfie và cười.', copyCount: 0 },
    { title: 'Tiến Tới Chậm + Lắc Hông', type: 'video' as const, content: '0-2s: Bước chân phải chậm về phía camera.\n2-4s: Bước chân trái tiếp, lắc hông nhẹ nhàng.\n4-6s: Tay trái vuốt hông bên trái khi bước.\n6-8s: Dừng sát camera, hông vẫn nghiêng nhẹ.', copyCount: 0 },
    { title: 'Tiến Tới + Vuốt Tóc', type: 'video' as const, content: '0-1s: Đứng thẳng.\n1-3s: Bước 2 bước chậm tiến gần camera.\n3-5s: Tay trái vuốt tóc từ vai xuống.\n5-7s: Tiếp tục bước gần hơn, hông lắc nhẹ.\n7-8s: Dừng gần máy, nhìn vào điện thoại.', copyCount: 0 },
  ]

  for (const p of videoPromptsData) {
    const prompt = new Prompt(p)
    await prompt.save()
  }
  logger.info(`✅ Seeded ${videoPromptsData.length} video prompts`)
}

// ─── Coupons ──────────────────────────────────────────────────────────────────

async function seedCoupons() {
  logger.info('🎫 Seeding coupons…')
  const count = await Coupon.countDocuments()
  if (count > 0) { logger.info('✅ Coupons already exist, skipping'); return }

  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + 3)

  await Coupon.insertMany([
    { code: 'WELCOME20', discountType: 'percent', discountValue: 20, maxUses: 100, isActive: true, expiresAt },
    { code: 'SUDEMY50K', discountType: 'fixed', discountValue: 50000, maxUses: 50, isActive: true, expiresAt },
    { code: 'FIRSTBUY', discountType: 'percent', discountValue: 30, maxUses: 200, isActive: true, expiresAt },
  ])
  logger.info('✅ Coupons seeded')
}

// ─── Flash Sale ───────────────────────────────────────────────────────────────

async function seedFlashSale() {
  logger.info('⚡ Seeding flash sale…')
  const count = await FlashSale.countDocuments()
  if (count > 0) { logger.info('✅ Flash sale already exists, skipping'); return }

  const startTime = new Date()
  const endTime = new Date()
  endTime.setDate(endTime.getDate() + 3)

  await FlashSale.create({
    name: 'Flash Sale Khai Trương - Giảm 40%',
    discountPercent: 40,
    startTime,
    endTime,
    isActive: true,
  })
  logger.info('✅ Flash sale seeded')
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  logger.info('🌱 Seed script starting…')
  logger.info(`   Environment : ${env.NODE_ENV}`)
  logger.info(`   Reset mode  : ${RESET}`)

  await mongoose.connect(env.MONGODB_URI, { dbName: 'sudemy' })
  logger.info('✅ Connected to MongoDB')

  if (RESET) {
    if (env.NODE_ENV === 'production') {
      logger.error('❌ --reset is not allowed in production. Aborting.')
      process.exit(1)
    }
    logger.warn('⚠️  Dropping all collections…')
    const collections = await mongoose.connection.db!.collections()
    await Promise.all(collections.map((c) => c.drop()))
    logger.info('✅ All collections dropped')
  }

  await seedSettings()
  await seedAdminUser()
  await seedStudentUser()

  await seedCoursesAndLessons()
  await seedPrompts()
  await seedCoupons()
  await seedFlashSale()

  logger.info('')
  logger.info('✅ Seed complete!')
  logger.info('📋 Credentials:')
  logger.info(`   Admin   — Email: ${ADMIN_EMAIL} / Password: ${ADMIN_PASSWORD}`)
  logger.info(`   Student — Email: ${STUDENT_EMAIL} / Password: ${STUDENT_PASSWORD}`)
  logger.info('')
}

main()
  .catch((err) => {
    logger.error('❌ Seed failed', { error: err.message, stack: err.stack })
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
    logger.info('🔌 Disconnected from MongoDB')
  })
