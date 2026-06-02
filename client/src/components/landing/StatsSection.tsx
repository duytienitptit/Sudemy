import { motion } from 'framer-motion'
import { Users, BookOpen, MessageSquareText, Star } from 'lucide-react'

const stats = [
  { label: 'Học viên', value: '2,000+', icon: Users, color: 'text-blue-500' },
  { label: 'Khóa học thực chiến', value: '5+', icon: BookOpen, color: 'text-purple-500' },
  { label: 'Prompts mẫu', value: '1,000+', icon: MessageSquareText, color: 'text-emerald-500' },
  { label: 'Đánh giá trung bình', value: '4.9/5', icon: Star, color: 'text-orange-500' },
]

export function StatsSection() {
  return (
    <section className="py-16 border-y border-[var(--color-outline-variant)] bg-[var(--color-surface)] dark:bg-[var(--color-surface-container)]">
      <div className="container-sudemy">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-x-0 md:divide-x divide-[var(--color-outline-variant)]">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center text-center px-4"
              >
                <Icon className={`w-8 h-8 mb-4 ${stat.color} opacity-80`} />
                <h3 className="text-display-sm text-[var(--color-on-surface)] font-bold mb-1">{stat.value}</h3>
                <p className="text-label-lg text-[var(--color-on-surface-variant)] uppercase tracking-wider">{stat.label}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
