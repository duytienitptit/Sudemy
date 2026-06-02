import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { XCircle, RotateCcw, MessageCircle, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function PaymentCancelPage() {
  const [searchParams] = useSearchParams()
  const courseSlug = searchParams.get('courseSlug') || ''

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <>
      <Helmet>
        <title>Thanh toán bị hủy — Sudemy</title>
        <meta name="description" content="Thanh toán bị hủy. Bạn có thể thử lại hoặc liên hệ hỗ trợ." />
      </Helmet>

      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          {/* Card */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl shadow-xl overflow-hidden">
            {/* Top strip */}
            <div className="h-2 bg-gradient-to-r from-orange-400 to-red-500" />

            <div className="p-8 sm:p-10 text-center">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex items-center justify-center mb-6"
              >
                <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <XCircle className="w-14 h-14 text-red-500" strokeWidth={1.5} />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] mb-3">
                  Thanh toán bị hủy
                </h1>
                <p className="text-[var(--color-on-surface-variant)] mb-8 max-w-sm mx-auto">
                  Đơn hàng của bạn đã bị hủy và bạn <strong>không bị trừ tiền</strong>. Bạn có thể
                  thử lại bất cứ lúc nào.
                </p>
              </motion.div>

              {/* Info box */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-xl p-4 mb-8 text-left"
              >
                <p className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-2">
                  💡 Tại sao thanh toán thất bại?
                </p>
                <ul className="text-sm text-orange-600 dark:text-orange-400 space-y-1 list-disc list-inside">
                  <li>Số dư tài khoản không đủ</li>
                  <li>Ngân hàng từ chối giao dịch</li>
                  <li>Hết thời gian thanh toán (30 phút)</li>
                  <li>Tự hủy giao dịch</li>
                </ul>
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="space-y-3"
              >
                {courseSlug ? (
                  <Button
                    as={Link}
                    to={`/courses/${courseSlug}`}
                    id="btn-retry-payment"
                    variant="primary"
                    size="xl"
                    fullWidth
                  >
                    <RotateCcw className="w-5 h-5" />
                    Thử lại thanh toán
                  </Button>
                ) : (
                  <Button
                    as={Link}
                    to="/courses"
                    id="btn-browse-courses"
                    variant="primary"
                    size="xl"
                    fullWidth
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Quay lại danh sách khóa học
                  </Button>
                )}

                <Button
                  as={Link}
                  to="/support"
                  id="btn-contact-support"
                  variant="outline"
                  size="default"
                  fullWidth
                  className="rounded-xl"
                >
                  <MessageCircle className="w-4 h-4" />
                  Liên hệ hỗ trợ
                </Button>
              </motion.div>
            </div>
          </div>

          <p className="text-center text-xs text-[var(--color-on-surface-variant)] mt-4">
            Mọi thắc mắc vui lòng liên hệ{' '}
            <a
              href="mailto:support@sudemy.vn"
              className="text-[var(--color-primary)] underline hover:no-underline"
            >
              support@sudemy.vn
            </a>
          </p>
        </motion.div>
      </div>
    </>
  )
}
