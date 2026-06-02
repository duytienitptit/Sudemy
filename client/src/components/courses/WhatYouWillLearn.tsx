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
    <div className="border border-[var(--color-outline-variant)] rounded-sm p-6 lg:p-8 bg-[var(--color-surface)]">
      <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6">Bạn sẽ học được gì?</h2>
      
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {displayItems.map((item, index) => (
          <li key={index} className="flex items-start">
            <Check className="w-5 h-5 mr-3 text-[var(--color-on-surface)] flex-shrink-0 mt-0.5" />
            <span className="text-[var(--color-on-surface-variant)] text-sm leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
