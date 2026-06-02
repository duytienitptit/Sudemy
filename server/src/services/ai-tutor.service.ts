import { GoogleGenAI } from '@google/genai'
import { ChatMessage } from '@/models/ChatMessage'
import { Lesson } from '@/models/Lesson'
import { Course } from '@/models/Course'
import { User } from '@/models/User'
import { AppError } from '@/middlewares/errorHandler'
import { env } from '@/config/env'
import { logger } from '@/config/logger'
import type { Types } from 'mongoose'

// ─── Constants ────────────────────────────────────────────────────────────────

const FREE_DAILY_LIMIT = 10
const MAX_HISTORY_PER_REQUEST = 10 // Recent messages sent as context to Gemini
const MAX_HISTORY_FETCH = 50 // Max messages returned to client
const MODEL_ID = 'gemini-2.5-flash'

// ─── Gemini Client (lazy init) ────────────────────────────────────────────────

let genAI: GoogleGenAI | null = null

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    if (!env.GEMINI_API_KEY) {
      throw new AppError('AI Tutor is not configured — GEMINI_API_KEY missing', 503, 'AI_NOT_CONFIGURED')
    }
    genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  }
  return genAI
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

function buildSystemPrompt(courseName: string, lessonTitle: string): string {
  return `Bạn là **AI Tutor** của nền tảng học trực tuyến Sudemy — một trợ giảng AI thông minh hỗ trợ học viên Việt Nam.

## Ngữ cảnh hiện tại
- **Khóa học:** ${courseName}
- **Bài học đang xem:** ${lessonTitle}

## Quy tắc ứng xử
1. **Luôn trả lời bằng tiếng Việt**, trừ khi thuật ngữ chuyên ngành cần giữ nguyên tiếng Anh.
2. Trả lời ngắn gọn, dễ hiểu, thân thiện — phù hợp với người mới bắt đầu.
3. Nếu câu hỏi liên quan đến bài học hiện tại, hãy đưa ra ví dụ cụ thể dựa trên nội dung bài học.
4. Nếu câu hỏi nằm ngoài phạm vi khóa học, hãy lịch sự hướng dẫn học viên quay lại chủ đề.
5. Sử dụng markdown khi cần (bullet points, bold, code blocks).
6. Giữ thái độ khích lệ, tích cực — giúp học viên tự tin hơn khi học.
7. Nếu không chắc chắn, hãy nói rõ là bạn không chắc và khuyên học viên hỏi giảng viên.
8. KHÔNG bao giờ tạo nội dung bạo lực, phân biệt đối xử, hoặc không phù hợp.`
}

// ─── Rate Limit Check ─────────────────────────────────────────────────────────

export async function checkRateLimit(
  userId: Types.ObjectId,
  courseId: string,
): Promise<{ allowed: boolean; remaining: number; limit: number }> {
  // Check if user has purchased the course → unlimited
  const user = await User.findById(userId).lean()
  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND')
  }

  // Admin, editor, moderator → unlimited
  if (['admin', 'editor', 'moderator'].includes(user.role)) {
    return { allowed: true, remaining: Infinity, limit: Infinity }
  }

  // Check if user purchased this course → unlimited for that course
  const hasPurchased = user.purchasedCourses?.some(
    (id) => id.toString() === courseId,
  )
  if (hasPurchased) {
    return { allowed: true, remaining: Infinity, limit: Infinity }
  }

  // Free user → count today's user messages
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const todayCount = await ChatMessage.countDocuments({
    userId,
    role: 'user',
    createdAt: { $gte: startOfDay },
  })

  const remaining = Math.max(0, FREE_DAILY_LIMIT - todayCount)
  return {
    allowed: todayCount < FREE_DAILY_LIMIT,
    remaining,
    limit: FREE_DAILY_LIMIT,
  }
}

// ─── Get Chat History ─────────────────────────────────────────────────────────

export async function getChatHistory(
  userId: Types.ObjectId,
  courseId: string,
  lessonId: string,
) {
  const messages = await ChatMessage.find({
    userId,
    courseId,
    lessonId,
  })
    .sort({ createdAt: 1 })
    .limit(MAX_HISTORY_FETCH)
    .lean()

  return messages.map((msg) => ({
    _id: msg._id,
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt,
  }))
}

// ─── Get Usage Stats ──────────────────────────────────────────────────────────

export async function getUsage(userId: Types.ObjectId) {
  const user = await User.findById(userId).lean()
  if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND')

  if (['admin', 'editor', 'moderator'].includes(user.role)) {
    return { used: 0, limit: -1, remaining: -1 } // -1 = unlimited
  }

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const todayCount = await ChatMessage.countDocuments({
    userId,
    role: 'user',
    createdAt: { $gte: startOfDay },
  })

  return {
    used: todayCount,
    limit: FREE_DAILY_LIMIT,
    remaining: Math.max(0, FREE_DAILY_LIMIT - todayCount),
  }
}

// ─── Stream Chat Response ─────────────────────────────────────────────────────

export async function streamChat(
  userId: Types.ObjectId,
  courseId: string,
  lessonId: string,
  userMessage: string,
  onChunk: (text: string) => void,
  onDone: (fullResponse: string) => void,
  onError: (error: Error) => void,
) {
  try {
    // 1. Validate lesson and course exist
    const [lesson, course] = await Promise.all([
      Lesson.findById(lessonId).lean(),
      Course.findById(courseId).lean(),
    ])

    if (!lesson) throw new AppError('Lesson not found', 404, 'LESSON_NOT_FOUND')
    if (!course) throw new AppError('Course not found', 404, 'COURSE_NOT_FOUND')

    // 2. Check rate limit
    const rateLimit = await checkRateLimit(userId, courseId)
    if (!rateLimit.allowed) {
      throw new AppError(
        `Bạn đã hết lượt hỏi hôm nay (${FREE_DAILY_LIMIT} câu/ngày). Hãy mua khóa học để được hỏi không giới hạn!`,
        429,
        'RATE_LIMITED',
      )
    }

    // 3. Save user message
    await ChatMessage.create({
      userId,
      courseId,
      lessonId,
      role: 'user',
      content: userMessage,
    })

    // 4. Fetch recent history for context
    const recentHistory = await ChatMessage.find({
      userId,
      courseId,
      lessonId,
    })
      .sort({ createdAt: -1 })
      .limit(MAX_HISTORY_PER_REQUEST)
      .lean()

    // Reverse to chronological order and format for Gemini
    const historyContents = recentHistory
      .reverse()
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: msg.content }],
      }))

    // 5. Build system prompt
    const systemPrompt = buildSystemPrompt(course.title, lesson.title)

    // 6. Call Gemini with streaming
    const ai = getGenAI()

    const response = await ai.models.generateContentStream({
      model: MODEL_ID,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
      contents: historyContents,
    })

    // 7. Stream chunks
    let fullResponse = ''

    for await (const chunk of response) {
      const text = chunk.text ?? ''
      if (text) {
        fullResponse += text
        onChunk(text)
      }
    }

    // 8. Save assistant response
    if (fullResponse) {
      await ChatMessage.create({
        userId,
        courseId,
        lessonId,
        role: 'assistant',
        content: fullResponse,
      })
    }

    onDone(fullResponse)
  } catch (error) {
    logger.error('AI Tutor stream error', { error: (error as Error).message })
    onError(error as Error)
  }
}
