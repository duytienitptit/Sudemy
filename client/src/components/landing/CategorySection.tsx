import { motion } from 'framer-motion'
import { Sparkles, Image, Video, Wand2 } from 'lucide-react'

const categories = [
  {
    title: 'ChatGPT & Trợ Lý AI',
    description: 'Viết lách, phân tích dữ liệu, lên ý tưởng kịch bản và tối ưu hóa công việc hàng ngày.',
    icon: Sparkles,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  {
    title: 'Midjourney & Canva AI',
    description: 'Tạo hình ảnh chất lượng cao, thiết kế ấn phẩm truyền thông chuyên nghiệp trong vài phút.',
    icon: Image,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20'
  },
  {
    title: 'CapCut & Video AI',
    description: 'Dựng video TikTok/Reels tự động, tạo phụ đề, lồng tiếng AI chân thực.',
    icon: Video,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  {
    title: 'Google Gemini & Tools',
    description: 'Khai thác tối đa hệ sinh thái AI của Google cho nghiên cứu và xử lý tài liệu.',
    icon: Wand2,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20'
  }
]

export function CategorySection() {
  return (
    <section className="py-24 bg-[var(--color-surface-container-lowest)] dark:bg-[var(--color-surface-container-lowest)]">
      <div className="container-sudemy">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-display-sm text-[var(--color-on-surface)] mb-4">Làm Chủ Kỹ Năng Của Tương Lai</h2>
          <p className="text-body-xl text-[var(--color-on-surface-variant)] max-w-2xl mx-auto">
            Hệ thống bài giảng bao quát toàn bộ các công cụ AI thiết yếu nhất hiện nay
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, index) => {
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`p-6 rounded-3xl border ${cat.border} bg-[var(--color-surface)] dark:bg-[var(--color-surface-container)] hover:-translate-y-1 transition-transform`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${cat.bg} ${cat.color}`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-title-lg text-[var(--color-on-surface)] mb-3 font-bold">{cat.title}</h3>
                <p className="text-body-md text-[var(--color-on-surface-variant)] leading-relaxed">
                  {cat.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
