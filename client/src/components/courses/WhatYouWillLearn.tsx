import { Check } from 'lucide-react'

// Since the course schema might not have an array of learning objectives explicitly,
// we might derive it or use a default placeholder list for now if the API doesn't provide it.
// We'll accept an array of strings as a prop.

interface WhatYouWillLearnProps {
  items?: string[]
}

const defaultItems = [
  "Nắm vững các công cụ AI và kỹ thuật viết prompt hiệu quả",
  "Xây dựng các dự án thực tế có thể đưa vào portfolio cá nhân",
  "Tự động hóa công việc hàng ngày và tiết kiệm nhiều giờ làm việc",
  "Hiểu cách tích hợp AI vào doanh nghiệp hoặc sự nghiệp của bạn",
  "Học kỹ thuật nâng cao cho Midjourney và ChatGPT",
  "Truy cập trọn đời và cập nhật theo sự phát triển của AI"
]

export function WhatYouWillLearn({ items = defaultItems }: WhatYouWillLearnProps) {
  const displayItems = items.length > 0 ? items : defaultItems

  return (
    <div className="border border-[var(--color-primary)]/15 rounded-xl p-6 lg:p-8 bg-[var(--color-surface-container-lowest)] relative overflow-hidden">
      {/* Subtle brand accent top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--color-primary)] via-[#7c3aed] to-[var(--color-secondary)]" />
      
      <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6">Bạn sẽ học được gì?</h2>
      
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {displayItems.map((item, index) => (
          <li key={index} className="flex items-start group">
            <span className="flex-shrink-0 mt-0.5 mr-3 w-5 h-5 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
              <Check className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            </span>
            <span className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
