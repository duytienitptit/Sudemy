import { Link } from 'react-router-dom'
import { BookOpen, MessageSquareText, LayoutDashboard, HelpCircle } from 'lucide-react'

const popularLinks = [
  { label: 'Khóa học', to: '/courses', icon: BookOpen, desc: 'Khám phá các khóa học AI' },
  { label: 'Thư viện Prompt', to: '/prompts', icon: MessageSquareText, desc: 'Prompt AI miễn phí' },
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, desc: 'Quản lý học tập' },
  { label: 'Hỗ trợ', to: '/support', icon: HelpCircle, desc: 'Liên hệ trợ giúp' },
]

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-20">
      <div className="text-center max-w-lg mx-auto px-4">
        <p className="text-display-lg font-extrabold text-[var(--color-primary)] mb-2">404</p>
        <h1 className="text-headline-md text-[var(--color-on-surface)] mb-4">
          Trang không tồn tại
        </h1>
        <p className="text-body-md text-[var(--color-on-surface-variant)] mb-8 max-w-md mx-auto">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]
            text-[var(--color-on-primary)] font-semibold rounded-lg transition-colors"
        >
          ← Về trang chủ
        </Link>

        {/* Popular Links */}
        <div className="mt-12 pt-8 border-t border-[var(--color-outline-variant)]">
          <p className="text-label-md text-[var(--color-on-surface-variant)] mb-6 uppercase tracking-wider">
            Hoặc thử truy cập
          </p>
          <div className="grid grid-cols-2 gap-3">
            {popularLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 p-4 rounded-xl border border-[var(--color-outline-variant)]
                    bg-[var(--color-surface-container-lowest)] hover:bg-[var(--color-surface-container)]
                    hover:border-[var(--color-primary)]/50 transition-all group text-left"
                >
                  <Icon className="w-5 h-5 text-[var(--color-primary)] shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-body-sm font-semibold text-[var(--color-on-surface)]">{link.label}</p>
                    <p className="text-label-sm text-[var(--color-on-surface-variant)]">{link.desc}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
