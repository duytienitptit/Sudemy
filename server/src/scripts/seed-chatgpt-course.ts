/**
 * Seed ChatGPT Course — "Khóa học ChatGPT từ A đến Z - Thực chiến 2025"
 * Usage: npx tsx src/scripts/seed-chatgpt-course.ts
 *        npx tsx src/scripts/seed-chatgpt-course.ts --replace   (delete & recreate)
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { env } from '@/config/env'
import { logger } from '@/config/logger'
import { Course } from '@/models/Course'
import { Lesson } from '@/models/Lesson'

const args = process.argv.slice(2)
const REPLACE = args.includes('--replace')

const COURSE_TITLE = 'Khóa học ChatGPT từ A đến Z - Thực chiến 2025'

const CHATGPT_COURSE = {
  title: COURSE_TITLE,
  slug: 'khoa-hoc-chatgpt-tu-a-djen-z-thuc-chien-2025',
  description: `<h2><strong>Khóa học ChatGPT toàn diện dành cho người Việt Nam</strong></h2>
<p>Bạn muốn sử dụng ChatGPT như một chuyên gia thực sự? Khóa học này sẽ đưa bạn từ người mới bắt đầu đến thành thạo, với những kỹ thuật thực chiến được áp dụng ngay vào công việc.</p>
<h3>Bạn sẽ học được gì?</h3>
<ul>
  <li>Hiểu cơ chế hoạt động của ChatGPT và các mô hình AI ngôn ngữ lớn (LLM)</li>
  <li>Kỹ thuật Prompt Engineering từ cơ bản đến nâng cao</li>
  <li>Ứng dụng ChatGPT vào viết content, marketing, coding, phân tích dữ liệu</li>
  <li>Xây dựng workflow tự động hóa với ChatGPT API</li>
  <li>Tích hợp ChatGPT vào quy trình làm việc hàng ngày để tăng năng suất X10</li>
</ul>
<h3>Khóa học phù hợp với ai?</h3>
<p>Marketers, content creators, lập trình viên, doanh nhân, freelancer hoặc bất kỳ ai muốn nắm bắt cơ hội từ cuộc cách mạng AI.</p>`,
  thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&auto=format&fit=crop',
  price: 299000,
  originalPrice: 599000,
  instructor: 'Nguyễn Văn Admin',
  status: 'published' as const,
  totalLessons: 10,
  previewLessons: 2,
  ratings: { average: 4.9, count: 128 },
}

const LESSONS = [
  {
    title: 'Giới thiệu ChatGPT và AI tổng quát — Tại sao bạn phải học ngay?',
    order: 1,
    isFree: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'ChatGPT được phát triển bởi công ty nào?',
        options: ['Google', 'OpenAI', 'Microsoft', 'Meta'],
        correctAnswer: 1,
      },
    ],
  },
  {
    title: 'Prompt Engineering căn bản — Nghệ thuật đặt câu hỏi đúng',
    order: 2,
    isFree: true,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Yếu tố nào KHÔNG thuộc về một prompt tốt?',
        options: ['Rõ ràng cụ thể', 'Cung cấp ngữ cảnh', 'Càng ngắn càng tốt', 'Xác định định dạng đầu ra'],
        correctAnswer: 2,
      },
      {
        question: 'Chain-of-thought prompting giúp gì cho ChatGPT?',
        options: ['Trả lời nhanh hơn', 'Suy nghĩ từng bước logic hơn', 'Dịch thuật tốt hơn', 'Tạo ảnh tốt hơn'],
        correctAnswer: 1,
      },
    ],
  },
  {
    title: 'Kỹ thuật Prompt nâng cao — Role-playing, Few-shot, Chain-of-thought',
    order: 3,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Few-shot prompting là gì?',
        options: [
          'Cho ChatGPT nghỉ ngơi giữa các câu hỏi',
          'Cung cấp ví dụ mẫu trong prompt để AI học theo',
          'Gửi nhiều câu hỏi cùng lúc',
          'Giới hạn số ký tự trong câu hỏi',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    title: 'ChatGPT cho Content Marketing — Viết bài viral từ A đến Z',
    order: 4,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Cấu trúc AIDA trong content marketing viết tắt của điều gì?',
        options: [
          'Analyze - Implement - Deploy - Automate',
          'Attention - Interest - Desire - Action',
          'Audience - Insight - Data - Analytics',
          'Article - Image - Data - Audience',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    title: 'ChatGPT cho SEO — Nghiên cứu từ khóa và viết bài chuẩn SEO',
    order: 5,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Khi viết meta description với ChatGPT, độ dài lý tưởng là bao nhiêu ký tự?',
        options: ['50-80 ký tự', '150-160 ký tự', '200-250 ký tự', 'Không giới hạn'],
        correctAnswer: 1,
      },
    ],
  },
  {
    title: 'ChatGPT cho Lập trình — Debug, viết code và giải thích logic',
    order: 6,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Kỹ thuật nào hiệu quả nhất khi nhờ ChatGPT debug code?',
        options: [
          'Chỉ paste error message',
          'Paste toàn bộ code dự án',
          'Paste code lỗi + error message + context mong muốn',
          'Mô tả vấn đề bằng lời',
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    title: 'ChatGPT API — Tích hợp AI vào ứng dụng của bạn',
    order: 7,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Tham số "temperature" trong ChatGPT API kiểm soát điều gì?',
        options: [
          'Tốc độ phản hồi',
          'Độ sáng tạo và ngẫu nhiên của câu trả lời',
          'Độ dài câu trả lời',
          'Ngôn ngữ phản hồi',
        ],
        correctAnswer: 1,
      },
      {
        question: 'Token trong ChatGPT API tương đương với gì?',
        options: [
          'Một từ đầy đủ',
          'Một ký tự',
          'Khoảng 3/4 từ hoặc 4 ký tự',
          'Một câu hoàn chỉnh',
        ],
        correctAnswer: 2,
      },
    ],
  },
  {
    title: 'Xây dựng Chatbot tùy chỉnh với Custom Instructions và GPTs',
    order: 8,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Custom Instructions trong ChatGPT cho phép bạn làm gì?',
        options: [
          'Thay đổi giao diện ChatGPT',
          'Thiết lập ngữ cảnh và phong cách phản hồi cố định cho mọi cuộc hội thoại',
          'Tăng giới hạn token',
          'Chia sẻ cuộc hội thoại với người khác',
        ],
        correctAnswer: 1,
      },
    ],
  },
  {
    title: 'Tự động hóa workflow với ChatGPT + Zapier/Make.com',
    order: 9,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Công cụ nào sau đây KHÔNG phải là no-code automation platform?',
        options: ['Zapier', 'Make.com', 'n8n', 'Postman'],
        correctAnswer: 3,
      },
    ],
  },
  {
    title: 'Dự án thực chiến — Xây dựng hệ thống Content Factory với ChatGPT',
    order: 10,
    isFree: false,
    youtubeUrl: 'https://www.youtube.com/watch?v=JTxsNm9IdYU',
    quiz: [
      {
        question: 'Trong dự án Content Factory, bước nào nên thực hiện TRƯỚC TIÊN?',
        options: [
          'Viết content ngay',
          'Xác định đối tượng mục tiêu và tone of voice',
          'Chọn kênh phân phối',
          'Đo lường kết quả',
        ],
        correctAnswer: 1,
      },
    ],
  },
]

async function seedChatGPTCourse() {
  await mongoose.connect(env.MONGODB_URI, { dbName: 'sudemy' })
  logger.info('✅ Connected to MongoDB')

  // Check for existing course with this title or slug
  const existing = await Course.findOne({
    $or: [
      { title: COURSE_TITLE },
      { slug: CHATGPT_COURSE.slug },
    ],
  })

  if (existing) {
    if (!REPLACE) {
      logger.info(`✅ Course already exists: "${COURSE_TITLE}" (_id: ${existing._id})`)
      logger.info('   Run with --replace to delete and recreate it.')
      return
    }
    logger.warn(`⚠️  Deleting existing course and its lessons: ${existing._id}`)
    await Lesson.deleteMany({ courseId: existing._id })
    await Course.deleteOne({ _id: existing._id })
  }

  // Create course
  const course = new Course(CHATGPT_COURSE)
  await course.save()
  logger.info(`✅ Course created: ${course.title} (${course._id})`)

  // Create lessons
  for (const lessonData of LESSONS) {
    const lesson = new Lesson({ courseId: course._id, ...lessonData })
    await lesson.save()
    logger.info(`   ✓ Lesson ${lessonData.order}: ${lessonData.title}`)
  }

  logger.info('')
  logger.info(`🎉 ChatGPT Course seeded successfully!`)
  logger.info(`   Course ID  : ${course._id}`)
  logger.info(`   Lessons    : ${LESSONS.length}`)
  logger.info(`   Admin URL  : http://localhost:5173/admin/courses/${course._id}/lessons`)
}

seedChatGPTCourse()
  .catch((err) => {
    logger.error('❌ Seed failed', { error: err.message })
    process.exit(1)
  })
  .finally(async () => {
    await mongoose.disconnect()
    logger.info('🔌 Disconnected')
  })
