import { GoogleGenAI } from '@google/genai'
import { Course } from '@/models/Course'
import { AppError } from '@/middlewares/errorHandler'
import { env } from '@/config/env'
import { logger } from '@/config/logger'

// ─── Constants ────────────────────────────────────────────────────────────────

const MODEL_ID = 'gemini-2.5-flash'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

// ─── Gemini Client (lazy init) ────────────────────────────────────────────────

let genAI: GoogleGenAI | null = null

function getGenAI(): GoogleGenAI {
  if (!genAI) {
    if (!env.GEMINI_API_KEY) {
      throw new AppError('AI không được cấu hình — GEMINI_API_KEY missing', 503, 'AI_NOT_CONFIGURED')
    }
    genAI = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  }
  return genAI
}

// ─── Course Catalog Cache ─────────────────────────────────────────────────────

let catalogCache: { text: string; expiresAt: number } | null = null

async function buildCourseCatalog(): Promise<string> {
  const now = Date.now()

  if (catalogCache && now < catalogCache.expiresAt) {
    return catalogCache.text
  }

  const courses = await Course.find({ status: 'published' })
    .select('title slug price originalPrice description instructor totalLessons ratings')
    .lean()

  if (courses.length === 0) {
    const text = 'Hiện chưa có khóa học nào được công bố.'
    catalogCache = { text, expiresAt: now + CACHE_TTL_MS }
    return text
  }

  const lines = courses.map((c) => {
    const priceText =
      c.price === 0
        ? 'MIỄN PHÍ'
        : `${c.price.toLocaleString('vi-VN')}đ${
            c.originalPrice && c.originalPrice > c.price
              ? ` (giá gốc ${c.originalPrice.toLocaleString('vi-VN')}đ — đang giảm!)`
              : ''
          }`

    const rating =
      c.ratings?.count > 0
        ? `⭐ ${c.ratings.average.toFixed(1)}/5 (${c.ratings.count} đánh giá)`
        : 'Chưa có đánh giá'

    const desc = c.description?.substring(0, 200) ?? ''

    return [
      `### ${c.title}`,
      `- **Giá:** ${priceText}`,
      `- **Giảng viên:** ${c.instructor}`,
      `- **Số bài học:** ${c.totalLessons}`,
      `- **Đánh giá:** ${rating}`,
      `- **Link:** /courses/${c.slug}`,
      `- **Mô tả ngắn:** ${desc}${desc.length >= 200 ? '...' : ''}`,
    ].join('\n')
  })

  const text = lines.join('\n\n')
  catalogCache = { text, expiresAt: now + CACHE_TTL_MS }
  logger.debug(`Course catalog cache refreshed (${courses.length} courses)`)
  return text
}

// ─── System Prompt Builder ────────────────────────────────────────────────────

async function buildSystemPrompt(): Promise<string> {
  const catalog = await buildCourseCatalog()

  return `Bạn là **Trợ lý Sudemy** — AI tư vấn học tập thông minh của nền tảng Sudemy.vn, chuyên đào tạo kỹ năng AI thực chiến cho người Việt Nam.

## Danh sách khóa học hiện có trên Sudemy

${catalog}

## Nhiệm vụ của bạn
1. **Tư vấn khóa học**: Giúp học viên chọn khóa học phù hợp với mục tiêu và nhu cầu của họ.
2. **Cung cấp thông tin giá**: Trả lời chính xác về giá, ưu đãi dựa trên dữ liệu phía trên.
3. **Giới thiệu tính năng Sudemy**: Thư viện Prompt AI, AI Tutor trong khóa học, chứng chỉ hoàn thành.
4. **Hỗ trợ học viên**: Giải đáp thắc mắc về quá trình đăng ký, thanh toán, lộ trình học.
5. **Khuyến khích hành động**: Khéo léo mời học viên đăng ký khi phù hợp.

## Quy tắc ứng xử
- Luôn trả lời **bằng tiếng Việt**, thân thiện, nhiệt tình và chuyên nghiệp.
- Trả lời **ngắn gọn, súc tích** — không dài dòng. Dùng emoji khi phù hợp để thân thiện hơn.
- Nếu hỏi về khóa học cụ thể, cung cấp thông tin chính xác từ danh sách trên.
- Nếu câu hỏi nằm ngoài phạm vi Sudemy, lịch sự từ chối và hướng về chủ đề học tập.
- KHÔNG bịa đặt giá hoặc thông tin không có trong danh sách.
- KHÔNG bao giờ tạo nội dung không phù hợp.`
}

// ─── Stream Global Chat ───────────────────────────────────────────────────────

export async function streamGlobalChat(
  userMessage: string,
  history: ChatTurn[],
  onChunk: (text: string) => void,
  onDone: (fullResponse: string) => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const systemPrompt = await buildSystemPrompt()

    // Build conversation history for Gemini (exclude last user msg — sent via contents)
    const historyContents = history.map((turn) => ({
      role: turn.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: turn.content }],
    }))

    // Append current user message
    historyContents.push({
      role: 'user' as const,
      parts: [{ text: userMessage }],
    })

    const ai = getGenAI()

    const response = await ai.models.generateContentStream({
      model: MODEL_ID,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
        maxOutputTokens: 1024,
      },
      contents: historyContents,
    })

    let fullResponse = ''

    for await (const chunk of response) {
      const text = chunk.text ?? ''
      if (text) {
        fullResponse += text
        onChunk(text)
      }
    }

    onDone(fullResponse)
  } catch (error) {
    logger.error('Global chat stream error', { error: (error as Error).message })
    onError(error as Error)
  }
}

// ─── Invalidate Catalog Cache (called when courses are updated) ───────────────

export function invalidateCatalogCache(): void {
  catalogCache = null
  logger.debug('Course catalog cache invalidated')
}
