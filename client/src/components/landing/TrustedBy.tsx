import { motion } from 'framer-motion'

const companies = [
  'Google', 'Microsoft', 'FPT Software', 'VNG', 'Shopee', 'TikTok'
]

export function TrustedBy() {
  return (
    <section className="py-10 bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-outline-variant)] overflow-hidden">
      <div className="container-sudemy text-center">
        <p className="text-label-md text-[var(--color-on-surface-variant)] uppercase tracking-widest mb-6">
          Học viên của chúng tôi đến từ các công ty hàng đầu
        </p>
        
        {/* Simple marquee effect container */}
        <div className="relative w-full overflow-hidden flex items-center">
          {/* Fading edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[var(--color-surface-container-lowest)] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[var(--color-surface-container-lowest)] to-transparent z-10" />
          
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ repeat: Infinity, ease: 'linear', duration: 20 }}
            className="flex items-center gap-16 md:gap-24 whitespace-nowrap px-8"
          >
            {/* Double the list for seamless loop */}
            {[...companies, ...companies].map((company, index) => (
              <span 
                key={`${company}-${index}`} 
                className="text-display-sm font-black text-[var(--color-on-surface-variant)] opacity-30 select-none"
              >
                {company}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
