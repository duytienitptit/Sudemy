import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative w-full overflow-hidden gradient-hero py-20 lg:py-32">
      <div className="container-sudemy relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-4 py-1.5 border border-[var(--color-primary-container)]/50 bg-[var(--color-primary-container)]/10 rounded-full mb-8"
            >
              <span className="text-[var(--color-on-surface)] text-label-md font-medium">🤖 Nền tảng học AI #1 Việt Nam</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[var(--color-on-surface)] font-display-lg text-display-lg lg:text-[64px] lg:leading-[1.1] mb-6"
            >
              Thành Thạo <br />
              <span className="text-gradient-ai">AI Trong 30 Ngày</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-[var(--color-on-surface-variant)] text-body-lg mb-10 max-w-lg"
            >
              Học ChatGPT, Gemini, Canva AI, CapCut AI — thực chiến, không lý thuyết suông.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto"
            >
              {/* If already logged in → go to courses; otherwise → register */}
              <Link
                to={user ? '/courses' : '/register'}
                className="flex items-center justify-center bg-[var(--color-primary)] text-[var(--color-on-primary)] h-14 px-8 rounded-xl font-label-md text-body-md hover:bg-[var(--color-primary-hover)] transition-all shadow-xl"
              >
                Bắt Đầu Học Miễn Phí
              </Link>
              {/* Always points to /prompts */}
              <Link
                to="/prompts"
                className="flex items-center justify-center border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] h-14 px-8 rounded-xl font-label-md text-body-md hover:bg-[var(--color-surface-container)] transition-all"
              >
                Xem Thư Viện Prompt
              </Link>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center gap-4 text-[var(--color-on-surface-variant)] text-label-sm sm:text-body-sm"
            >
              <span>🎓 2,000+ học viên</span>
              <span className="opacity-30">|</span>
              <span>⭐ 4.9/5 đánh giá</span>
              <span className="opacity-30">|</span>
              <span>🤖 5 khóa AI thực chiến</span>
            </motion.div>
          </div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative group hidden lg:block"
          >
            <div className="absolute -inset-4 bg-[var(--color-primary-container)]/20 blur-[80px] rounded-full group-hover:bg-[var(--color-primary-container)]/30 transition-all"></div>
            <img
              alt="AI Learning Dashboard"
              className="relative z-10 w-full h-auto rounded-2xl shadow-2xl animate-[float_6s_ease-in-out_infinite]"
              src="/hero-dashboard.png"
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = 'none'
                // Insert fallback gradient placeholder
                const fallback = document.createElement('div')
                fallback.className = 'relative z-10 w-full aspect-[4/3] rounded-2xl shadow-2xl flex items-center justify-center animate-[float_6s_ease-in-out_infinite]'
                fallback.style.background = 'linear-gradient(135deg, var(--color-primary-container), var(--color-primary))'
                fallback.innerHTML = '<span style="font-size:3rem">🤖</span>'
                img.parentElement?.appendChild(fallback)
              }}
            />
          </motion.div>
        </div>
      </div>
      <style>{`
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
      `}</style>
    </section>
  )
}
