import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { PlayCircle, FileText, Download, Award, Infinity, Smartphone, Tag, Loader2, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Course } from '@/types/course.types'
import { createOrder, validateCoupon } from '@/services/payment.service'
import { useAuth } from '@/contexts/AuthContext'
import { getMyOrders } from '@/services/payment.service'

interface CourseIncludesProps {
  course: Course
}

export function CourseIncludes({ course }: CourseIncludesProps) {
  const { thumbnail, price, originalPrice, _id: courseId, slug } = course
  const { user } = useAuth()
  const navigate = useNavigate()

  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState<{
    code: string
    finalPrice: number
    discountType: string
    discountValue: number
  } | null>(null)
  const [couponError, setCouponError] = useState('')

  // ── Check if already purchased ──────────────────────────────────────────
  const { data: myOrders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
    enabled: !!user,
    staleTime: 30_000,
  })

  const alreadyPurchased = myOrders.some(
    (o) =>
      o.status === 'completed' &&
      (typeof o.courseId === 'string' ? o.courseId : o.courseId?._id) === courseId,
  )

  // ── Coupon validation mutation ───────────────────────────────────────────
  const couponMutation = useMutation({
    mutationFn: () => validateCoupon(couponCode.trim().toUpperCase(), courseId, price),
    onSuccess: (result) => {
      setCouponApplied({
        code: couponCode.trim().toUpperCase(),
        finalPrice: result.finalPrice,
        discountType: result.discountType,
        discountValue: result.discountValue,
      })
      setCouponError('')
      toast.success('Áp dụng mã giảm giá thành công!')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Mã giảm giá không hợp lệ'
      setCouponError(msg)
      setCouponApplied(null)
    },
  })

  // ── Create order mutation ────────────────────────────────────────────────
  const orderMutation = useMutation({
    mutationFn: () =>
      createOrder({
        courseId,
        couponCode: couponApplied?.code,
      }),
    onSuccess: ({ checkoutUrl }) => {
      // Redirect to PayOS hosted checkout page
      window.location.href = checkoutUrl
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại sau.'
      toast.error(msg)
    },
  })

  // ── Helpers ─────────────────────────────────────────────────────────────
  const formatPrice = (value: number) => {
    if (value === 0) return 'Miễn phí'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const displayPrice = couponApplied ? couponApplied.finalPrice : price
  const discountPercent =
    originalPrice && originalPrice > displayPrice
      ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
      : 0

  const handleCheckout = () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để tiếp tục mua hàng.')
      navigate('/login')
      return
    }
    orderMutation.mutate()
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá')
      return
    }
    couponMutation.mutate()
  }

  const handleRemoveCoupon = () => {
    setCouponApplied(null)
    setCouponCode('')
    setCouponError('')
  }

  const isCheckoutLoading = orderMutation.isPending

  return (
    <div className="rounded-xl overflow-hidden flex flex-col elevation-1">
      {/* Thumbnail */}
      <div className="relative aspect-video hidden lg:block">
        <img
          src={thumbnail || 'https://placehold.co/600x338?text=Course'}
          alt="Course Thumbnail"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-6">
        {/* Price block */}
        <div className="mb-5">
          <div className="flex items-end gap-3 mb-1">
            <span className="text-3xl font-bold text-[var(--color-on-surface)]">
              {formatPrice(displayPrice)}
            </span>
            {originalPrice && originalPrice > displayPrice && (
              <span className="text-lg text-[var(--color-on-surface-variant)] line-through mb-1">
                {formatPrice(originalPrice)}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-sm font-medium text-[var(--color-error)] mb-1.5 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded">
                -{discountPercent}%
              </span>
            )}
          </div>
          {couponApplied && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mt-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Đã áp dụng mã <strong>{couponApplied.code}</strong>
                {couponApplied.discountType === 'percent'
                  ? ` (−${couponApplied.discountValue}%)`
                  : ` (−${formatPrice(couponApplied.discountValue)})`}
              </span>
              <button
                onClick={handleRemoveCoupon}
                className="ml-auto text-xs text-[var(--color-on-surface-variant)] underline hover:text-[var(--color-error)] transition-colors"
              >
                Xóa
              </button>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div className="space-y-3 mb-5">
          {alreadyPurchased ? (
            <button
              onClick={() => navigate(`/learn/${slug}`)}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-lg flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-5 h-5" />
              Vào học ngay
            </button>
          ) : (
            <>
              <button
                id="btn-buy-now"
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className="w-full py-3.5 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-[var(--color-on-primary)] font-bold rounded-lg transition-colors text-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isCheckoutLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Mua ngay'
                )}
              </button>
            </>
          )}
        </div>

        {/* Coupon input */}
        {!alreadyPurchased && (
          <div className="mb-5">
            <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4" />
              Mã giảm giá
            </label>
            <div className="flex gap-2">
              <input
                id="coupon-input"
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase())
                  setCouponError('')
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                placeholder="NHẬP MÃ GIẢM GIÁ"
                className="flex-1 min-w-0 px-3 py-2.5 text-sm rounded-lg border border-[var(--color-outline-variant)] hover:border-[var(--color-outline)] bg-[var(--color-surface-container-lowest)] text-[var(--color-on-surface)] placeholder-[var(--color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent uppercase tracking-widest transition-colors"
              />
              <button
                id="btn-apply-coupon"
                onClick={handleApplyCoupon}
                disabled={couponMutation.isPending}
                className="px-5 py-2.5 text-sm font-semibold bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-60 shrink-0"
              >
                {couponMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Áp dụng'}
              </button>
            </div>
            {couponError && (
              <p className="mt-1.5 text-xs text-[var(--color-error)]">{couponError}</p>
            )}
          </div>
        )}

        <div className="text-center text-sm text-[var(--color-on-surface-variant)] mb-6">
          Bảo đảm hoàn tiền trong 30 ngày
        </div>

        {/* Course includes */}
        <div>
          <h4 className="font-bold text-[var(--color-on-surface)] mb-4 text-lg">Khóa học bao gồm:</h4>
          <ul className="space-y-3 text-sm text-[var(--color-on-surface)]">
            <li className="flex items-center">
              <PlayCircle className="w-4 h-4 mr-3 text-[var(--color-on-surface-variant)]" />
              <span>Video xem trực tuyến</span>
            </li>
            <li className="flex items-center">
              <FileText className="w-4 h-4 mr-3 text-[var(--color-on-surface-variant)]" />
              <span>Tài liệu học tập</span>
            </li>
            <li className="flex items-center">
              <Download className="w-4 h-4 mr-3 text-[var(--color-on-surface-variant)]" />
              <span>Tài nguyên tải về</span>
            </li>
            <li className="flex items-center">
              <Smartphone className="w-4 h-4 mr-3 text-[var(--color-on-surface-variant)]" />
              <span>Học mọi thiết bị</span>
            </li>
            <li className="flex items-center">
              <Infinity className="w-4 h-4 mr-3 text-[var(--color-on-surface-variant)]" />
              <span>Truy cập trọn đời</span>
            </li>
            <li className="flex items-center">
              <Award className="w-4 h-4 mr-3 text-[var(--color-on-surface-variant)]" />
              <span>Chứng chỉ hoàn thành</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
