import { motion } from 'framer-motion'
import { Quote, Star } from 'lucide-react'

interface Testimonial {
  name: string
  role: string
  content: string
  initials: string
  color: string
  rating: number
}

const testimonials: Testimonial[] = [
  {
    name: 'Phạm Minh Tuấn',
    role: 'Marketing Manager tại FPT Software',
    content: 'Từ khi áp dụng ChatGPT vào quy trình content marketing, tốc độ ra bài của team mình tăng gấp 3 lần. Khóa học thực sự rất thực chiến, mỗi bài đều có bài tập áp dụng ngay.',
    initials: 'PT',
    color: 'bg-blue-500',
    rating: 5,
  },
  {
    name: 'Nguyễn Thị Hương Giang',
    role: 'Graphic Designer Freelancer',
    content: 'Canva AI đã thay đổi hoàn toàn cách mình làm việc. Giờ mình có thể nhận thêm 40% job thiết kế mỗi tháng mà vẫn đảm bảo chất lượng. Cảm ơn Sudemy rất nhiều!',
    initials: 'HG',
    color: 'bg-purple-500',
    rating: 5,
  },
  {
    name: 'Trần Đức Anh',
    role: 'Content Creator — 120K followers TikTok',
    content: 'Khóa CapCut AI giúp mình tự động hóa phụ đề và giọng đọc AI, tiết kiệm 4-5 tiếng edit mỗi video. Video viral dễ dàng hơn hẳn từ khi áp dụng các kỹ thuật trong khóa.',
    initials: 'ĐA',
    color: 'bg-emerald-500',
    rating: 5,
  },
]

function InitialsAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <div className={`w-14 h-14 rounded-full ${color} text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-lg`}>
      {initials}
    </div>
  )
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 mb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

export function TestimonialSlider() {
  return (
    <section className="py-24 bg-[var(--color-surface)] dark:bg-[var(--color-surface-container)]">
      <div className="container-sudemy">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-display-sm text-[var(--color-on-surface)] mb-4">Học Viên Nói Gì Về Sudemy?</h2>
          <p className="text-body-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
            Hàng ngàn học viên đã thay đổi cách làm việc và tăng hiệu suất nhờ ứng dụng AI.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative p-8 rounded-3xl bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]/50 transition-colors"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-[var(--color-primary)]/10" />
              <StarRating rating={test.rating} />
              <p className="text-body-lg text-[var(--color-on-surface-variant)] italic mb-6">
                "{test.content}"
              </p>
              <div className="flex items-center gap-4">
                <InitialsAvatar initials={test.initials} color={test.color} />
                <div>
                  <h4 className="text-title-md text-[var(--color-on-surface)] font-bold">{test.name}</h4>
                  <p className="text-label-md text-[var(--color-on-surface-variant)]">{test.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
