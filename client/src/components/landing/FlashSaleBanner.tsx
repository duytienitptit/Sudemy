import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, X, Clock } from 'lucide-react'
import { getActiveFlashSale } from '@/services/payment.service'

const DISMISS_KEY = 'sudemy_flash_sale_dismissed'

interface TimeLeft {
  hours: number
  minutes: number
  seconds: number
}

function calculateTimeLeft(endTime: string): TimeLeft {
  const diff = new Date(endTime).getTime() - Date.now()
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 }
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
  }
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

export function FlashSaleBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true'
    } catch {
      return false
    }
  })

  const { data: flashSale } = useQuery({
    queryKey: ['flash-sale-active'],
    queryFn: getActiveFlashSale,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ hours: 0, minutes: 0, seconds: 0 })

  const tick = useCallback(() => {
    if (flashSale?.endTime) {
      setTimeLeft(calculateTimeLeft(flashSale.endTime))
    }
  }, [flashSale?.endTime])

  useEffect(() => {
    if (!flashSale) return
    tick()
    const id = setInterval(tick, 1_000)
    return () => clearInterval(id)
  }, [flashSale, tick])

  const handleDismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, 'true')
    } catch {
      // ignore
    }
  }

  const isExpired =
    timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  const shouldShow = flashSale && !dismissed && !isExpired

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full bg-gradient-to-r from-[#FF6B35] via-[#FF3CAC] to-[#7B2FF7] text-white overflow-hidden"
          role="banner"
          aria-label="Flash sale banner"
        >
          {/* Animated shimmer */}
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            style={{ animation: 'shimmer 3s infinite' }}
          />

          <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 px-4 py-3 sm:py-2.5 text-center sm:text-left">
            {/* Title */}
            <div className="flex items-center gap-2 font-bold text-sm sm:text-base shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-300 text-yellow-300 animate-pulse" />
              <span>FLASH SALE — Giảm {flashSale!.discountPercent}%!</span>
            </div>

            <span className="hidden sm:block text-white/40">|</span>

            {/* Countdown */}
            <div className="flex items-center gap-1.5 text-sm font-mono">
              <Clock className="w-4 h-4 opacity-80 shrink-0" />
              <span className="opacity-80">Kết thúc sau:</span>
              <div className="flex items-center gap-1 ml-1">
                <TimeUnit value={timeLeft.hours} label="giờ" />
                <span className="text-white/70 font-bold">:</span>
                <TimeUnit value={timeLeft.minutes} label="phút" />
                <span className="text-white/70 font-bold">:</span>
                <TimeUnit value={timeLeft.seconds} label="giây" />
              </div>
            </div>

            {/* CTA */}
            <Link
              to="/courses"
              className="ml-0 sm:ml-2 px-4 py-1.5 bg-white text-[#7B2FF7] font-bold text-xs sm:text-sm rounded-full hover:bg-yellow-300 hover:text-black transition-all duration-200 shrink-0 shadow"
            >
              Mua ngay →
            </Link>
          </div>

          {/* Dismiss */}
          <button
            onClick={handleDismiss}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Đóng thông báo flash sale"
          >
            <X className="w-4 h-4" />
          </button>

          <style>{`
            @keyframes shimmer {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(200%); }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="bg-white/20 backdrop-blur px-2 py-0.5 rounded font-bold text-sm tabular-nums min-w-[2rem] text-center">
        {pad(value)}
      </span>
      <span className="text-[9px] opacity-60 leading-tight hidden sm:block">{label}</span>
    </div>
  )
}
