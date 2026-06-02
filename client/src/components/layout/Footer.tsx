import { Link } from 'react-router-dom'
import { FacebookIcon, YoutubeIcon, TiktokIcon } from '@/components/ui/Icons'
import { useSettings } from '@/hooks/useSettings'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterColumn {
  title: string
  links: { label: string; to: string }[]
}

// ─── Data (static fallback) ───────────────

const columns: FooterColumn[] = [
  {
    title: 'Học tập',
    links: [
      { label: 'Tất cả khóa học', to: '/courses' },
      { label: 'Thư viện Prompt AI', to: '/prompts' },
    ],
  },
]

// ─── Footer ───────────────────────────────────────────────────────────────────

export function Footer() {
  const { data: settings } = useSettings()
  const year = new Date().getFullYear()

  const platformName = settings?.platformName || 'Sudemy'
  const footerText = settings?.footerText || `© ${year} Sudemy. Tất cả quyền được bảo lưu.`
  const socialLinks = settings?.socialLinks || {}

  const dynamicSocials = [
    { label: 'Facebook', to: socialLinks.facebook || 'https://facebook.com/sudemy', icon: FacebookIcon },
    { label: 'YouTube', to: socialLinks.youtube || 'https://youtube.com/@sudemy', icon: YoutubeIcon },
    { label: 'TikTok', to: socialLinks.tiktok || 'https://tiktok.com/@sudemy', icon: TiktokIcon },
  ]

  return (
    <footer
      id="site-footer"
      className="bg-slate-950 text-slate-300"
      aria-label="Thông tin website"
    >
      <div className="container-sudemy py-14">
        {/* Top section: brand + columns */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
          {/* Brand column */}
          <div className="flex flex-col gap-5">
            {/* Logo */}
            <Link
              to="/"
              aria-label={`${platformName} – Trang chủ`}
              className="flex items-center gap-2 group w-fit"
            >
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={platformName} className="h-9 w-auto object-contain" />
              ) : (
                <>
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold
                      bg-[var(--color-primary)] group-hover:opacity-90 transition-opacity"
                  >
                    {platformName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-xl text-white tracking-tight">
                    {platformName}
                  </span>
                </>
              )}
            </Link>

            <p className="text-body-sm text-slate-300 leading-relaxed">
              Nền tảng học AI thực chiến hàng đầu Việt Nam. Thành thạo ChatGPT, Gemini, Canva AI và CapCut AI.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {dynamicSocials.filter(s => s.to).map((s) => (
                <a
                  key={s.label}
                  href={s.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center transition-transform
                    hover:scale-110 hover:opacity-90 bg-white/10 hover:bg-white/20"
                >
                  <s.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-4">
              <h3 className="text-label-md text-white uppercase tracking-widest">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-body-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <hr className="my-10 border-white/10" />

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-label-sm text-slate-500">
            {footerText}
          </p>
          <p className="text-label-sm text-slate-500">
            Made with ❤️ in Vietnam 🇻🇳
          </p>
        </div>
      </div>
    </footer>
  )
}
