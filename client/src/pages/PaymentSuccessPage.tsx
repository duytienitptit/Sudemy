import { useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { CheckCircle, BookOpen, LayoutDashboard, Receipt, Loader2, AlertTriangle, RefreshCw } from 'lucide-react'
import { verifyOrderPayment, getOrderById } from '@/services/payment.service'
import { useAuth } from '@/contexts/AuthContext'

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams()
  const { updatePurchasedCourses } = useAuth()

  // PayOS returns orderCode in the query string
  const orderCode = searchParams.get('orderCode') || ''
  const orderId = searchParams.get('orderId') || ''

  const {
    data: verifyResult,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['order-verify', orderCode || orderId],
    queryFn: async () => {
      // If we have an orderCode, verify with PayOS first (updates DB status)
      if (orderCode) {
        try {
          return await verifyOrderPayment(orderCode)
        } catch {
          // If verify fails (e.g. no auth), fall back to getOrderById
        }
      }
      // Fall back to simple order lookup
      if (orderId) {
        const order = await getOrderById(orderId)
        return { order, purchasedCourses: [] }
      }
      return null
    },
    enabled: !!(orderCode || orderId),
    retry: 2,
    // Auto-retry every 3 seconds when order is still pending (max 20 retries = 60s)
    refetchInterval: (query) => {
      const result = query.state.data
      if (result?.order?.status === 'pending') {
        // Stop retrying after 20 attempts
        const retryCount = (query.state.dataUpdateCount ?? 0)
        if (retryCount >= 20) return false
        return 3000
      }
      return false
    },
  })

  const order = verifyResult?.order ?? null
  const orderStatus = order?.status ?? 'pending'

  // Update AuthContext purchasedCourses when verify returns updated data
  useEffect(() => {
    if (verifyResult?.purchasedCourses && verifyResult.purchasedCourses.length > 0) {
      updatePurchasedCourses(verifyResult.purchasedCourses)
    }
  }, [verifyResult?.purchasedCourses, updatePurchasedCourses])

  // Resolve course info (courseId may be populated or string)
  const course =
    order?.courseId && typeof order.courseId !== 'string' ? order.courseId : null

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)

  // Scroll to top
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleRetry = useCallback(() => {
    refetch()
  }, [refetch])

  // ─── Render based on status ──────────────────────────────────────────────────

  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <div className="p-8 sm:p-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <Loader2 className="w-16 h-16 text-[var(--color-primary)] animate-spin" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] mb-2">
            Đang xác minh thanh toán...
          </h1>
          <p className="text-[var(--color-on-surface-variant)]">
            Vui lòng đợi trong giây lát.
          </p>
        </div>
      )
    }

    // Error state
    if (isError || !order) {
      return (
        <div className="p-8 sm:p-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <AlertTriangle className="w-14 h-14 text-amber-500" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] mb-2">
            Không thể xác minh thanh toán
          </h1>
          <p className="text-[var(--color-on-surface-variant)] mb-8">
            Đã xảy ra lỗi khi xác minh đơn hàng. Vui lòng thử lại.
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-colors text-lg"
          >
            <RefreshCw className="w-5 h-5" />
            Thử lại
          </button>
        </div>
      )
    }

    // ─── PENDING ──────────────────────────────────────────────────────────────
    if (orderStatus === 'pending') {
      return (
        <div className="p-8 sm:p-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Loader2 className="w-14 h-14 text-amber-500 animate-spin" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] mb-2">
              Đang xử lý thanh toán...
            </h1>
            <p className="text-[var(--color-on-surface-variant)] mb-4">
              Đơn hàng đang được xử lý. Hệ thống sẽ tự động kiểm tra lại.
            </p>
            <p className="text-sm text-[var(--color-on-surface-variant)]">
              Nếu bạn đã thanh toán thành công, vui lòng đợi hoặc nhấn nút bên dưới.
            </p>
          </motion.div>

          {/* Order summary even when pending */}
          {renderOrderSummary()}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <button
              onClick={handleRetry}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-colors text-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Kiểm tra lại
            </button>
          </motion.div>
        </div>
      )
    }

    // ─── FAILED ───────────────────────────────────────────────────────────────
    if (orderStatus === 'failed') {
      return (
        <div className="p-8 sm:p-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="w-14 h-14 text-red-500" strokeWidth={1.5} />
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] mb-2">
              Thanh toán thất bại
            </h1>
            <p className="text-[var(--color-on-surface-variant)] mb-8">
              Đơn hàng không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </p>
          </motion.div>

          {renderOrderSummary()}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mt-6"
          >
            {course ? (
              <Link
                to={`/courses/${course.slug}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-colors text-lg"
              >
                Thử mua lại
              </Link>
            ) : (
              <Link
                to="/courses"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-colors text-lg"
              >
                Quay lại danh sách khóa học
              </Link>
            )}
            <Link
              to="/dashboard/orders"
              className="flex items-center justify-center gap-2 w-full py-3 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-medium transition-colors text-sm"
            >
              Xem lịch sử đơn hàng →
            </Link>
          </motion.div>
        </div>
      )
    }

    // ─── COMPLETED (SUCCESS) ──────────────────────────────────────────────────
    return (
      <div className="p-8 sm:p-10 text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="flex items-center justify-center mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-4 border-emerald-400/30 animate-ping" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] mb-2">
            Thanh toán thành công! 🎉
          </h1>
          <p className="text-[var(--color-on-surface-variant)] mb-8">
            Cảm ơn bạn đã tin tưởng Sudemy. Khóa học đã được thêm vào tài khoản của bạn.
          </p>
        </motion.div>

        {/* Order summary */}
        {renderOrderSummary()}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="space-y-3"
        >
          {course ? (
            <Link
              to={`/learn/${course.slug}`}
              id="btn-start-learning"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-colors text-lg"
            >
              <BookOpen className="w-5 h-5" />
              Bắt đầu học ngay
            </Link>
          ) : (
            <Link
              to="/dashboard"
              id="btn-go-dashboard"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-bold rounded-xl transition-colors text-lg"
            >
              <LayoutDashboard className="w-5 h-5" />
              Vào trang học tập
            </Link>
          )}

          <Link
            to="/dashboard/orders"
            className="flex items-center justify-center gap-2 w-full py-3 text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] font-medium transition-colors text-sm"
          >
            Xem lịch sử đơn hàng →
          </Link>
        </motion.div>
      </div>
    )
  }

  // ─── Shared order summary section ────────────────────────────────────────────

  const renderOrderSummary = () => {
    if (!order) return null

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-[var(--color-surface-container)] rounded-xl p-5 mb-8 text-left"
      >
        <h2 className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Chi tiết đơn hàng
        </h2>

        {course && (
          <div className="flex gap-3 mb-4">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-16 h-10 object-cover rounded-lg shrink-0"
            />
            <div>
              <p className="font-semibold text-[var(--color-on-surface)] text-sm line-clamp-2">
                {course.title}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2 text-sm border-t border-[var(--color-outline-variant)] pt-3">
          <div className="flex justify-between text-[var(--color-on-surface-variant)]">
            <span>Mã đơn hàng</span>
            <span className="font-mono font-medium text-[var(--color-on-surface)] text-xs">
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </div>
          {order.originalAmount > order.amount && (
            <div className="flex justify-between text-[var(--color-on-surface-variant)]">
              <span>Giá gốc</span>
              <span className="line-through">{formatPrice(order.originalAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base text-[var(--color-on-surface)] border-t border-[var(--color-outline-variant)] pt-2 mt-2">
            <span>Đã thanh toán</span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {formatPrice(order.amount)}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  // ─── Page title based on status ──────────────────────────────────────────────

  const pageTitle =
    orderStatus === 'completed'
      ? 'Thanh toán thành công — Sudemy'
      : orderStatus === 'failed'
        ? 'Thanh toán thất bại — Sudemy'
        : 'Đang xử lý thanh toán — Sudemy'

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content="Trạng thái đơn hàng của bạn trên Sudemy." />
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
            {/* Top gradient strip — color varies by status */}
            <div
              className={`h-2 bg-gradient-to-r ${
                orderStatus === 'completed'
                  ? 'from-emerald-400 to-teal-500'
                  : orderStatus === 'failed'
                    ? 'from-red-400 to-rose-500'
                    : 'from-amber-400 to-orange-500'
              }`}
            />

            {renderContent()}
          </div>

          {orderStatus === 'completed' && (
            <p className="text-center text-xs text-[var(--color-on-surface-variant)] mt-4">
              Email xác nhận đã được gửi tới địa chỉ email của bạn.
            </p>
          )}
        </motion.div>
      </div>
    </>
  )
}
