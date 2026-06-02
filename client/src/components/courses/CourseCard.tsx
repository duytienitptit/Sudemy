import { Link } from 'react-router-dom'
import { Star, StarHalf, PlayCircle, ChartBar, CheckCircle2 } from 'lucide-react'
import type { Course } from '@/types/course.types'
import { useAuth } from '@/contexts/AuthContext'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const { slug, thumbnail, title, instructor, ratings, price, originalPrice, description, totalLessons, previewLessons } = course
  const { user } = useAuth()

  const isPurchased = !!user && (
    user.role === 'admin' ||
    user.role === 'editor' ||
    (course._id ? user.purchasedCourses?.includes(course._id) ?? false : false)
  )

  // Format currency
  const formatPrice = (value: number) => {
    if (value === 0) return 'Miễn phí'
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  // Render stars based on average rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)
      } else {
        stars.push(<Star key={i} className="w-3.5 h-3.5 text-gray-300" />)
      }
    }
    return stars
  }

  return (
    <div className="group relative">
      {/* ── Main Card ── */}
      <Link to={isPurchased ? `/learn/${slug}` : `/courses/${slug}`} className="block h-full transition-transform hover:-translate-y-1">
        <div className="flex flex-col h-full rounded-xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-outline-variant)] elevation-1 hover:elevation-2 transition-shadow">
          <div className="relative aspect-video overflow-hidden">
            <img 
              src={thumbnail || 'https://placehold.co/600x338?text=Course'} 
              alt={title} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {isPurchased && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500 text-white text-xs font-semibold rounded-full shadow-md">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã sở hữu
              </div>
            )}
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-[var(--color-on-surface)] font-bold line-clamp-2 min-h-[3rem] leading-tight">
              {title}
            </h3>
            <p className="text-[var(--color-on-surface-variant)] text-sm mt-1 mb-2">
              {instructor}
            </p>
            <div className="flex items-center space-x-1 mb-2">
              <span className="font-bold text-yellow-500 text-sm">{ratings?.average?.toFixed(1) || '0.0'}</span>
              <div className="flex items-center">
                {renderStars(ratings?.average || 0)}
              </div>
              <span className="text-xs text-[var(--color-on-surface-variant)]">({ratings?.count || 0})</span>
            </div>
            <div className="mt-auto flex items-baseline space-x-2">
              {isPurchased ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm flex items-center gap-1">
                  <PlayCircle className="w-4 h-4" />
                  Tiếp tục học
                </span>
              ) : (
                <>
                  <span className="text-[var(--color-on-surface)] font-bold text-lg">
                    {formatPrice(price)}
                  </span>
                  {originalPrice && originalPrice > price && (
                    <span className="text-[var(--color-on-surface-variant)] text-sm line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* ── Hover Tooltip (Udemy Style) ── */}
      {/* 
        The -right-2 + translate-x-full positioning overlaps the card edge 
        by a few px so the mouse never leaves the group hover zone.
      */}
      <div className="hidden lg:group-hover:block absolute top-0 -right-2 translate-x-full w-80 z-50 pt-4 pb-4 pointer-events-none group-hover:pointer-events-auto">
        {/* Invisible bridge to maintain hover between card and popup */}
        <div className="absolute top-0 -left-4 w-6 h-full" />
        <div className="relative bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-xl elevation-3 p-5 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity delay-100">
          {/* Tooltip pointer */}
          <div className="absolute top-8 -left-2 w-4 h-4 bg-[var(--color-surface)] border-l border-b border-[var(--color-outline-variant)] transform rotate-45"></div>
          
          <h3 className="font-bold text-[var(--color-on-surface)] text-lg leading-tight mb-2">
            {title}
          </h3>
          
          <div className="flex flex-wrap gap-3 text-xs text-[var(--color-on-surface-variant)] mb-4">
            {totalLessons > 0 && (
               <span className="flex items-center"><PlayCircle className="w-3.5 h-3.5 mr-1"/> {totalLessons} bài học</span>
            )}
            <span className="flex items-center"><ChartBar className="w-3.5 h-3.5 mr-1"/>Mọi trình độ</span>
          </div>
          
          <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-3 mb-4">
            {description.replace(/<[^>]*>?/gm, '')}
          </p>

          <ul className="text-sm text-[var(--color-on-surface)] space-y-2 mb-6">
            <li className="flex items-start">
              <span className="mr-2 mt-0.5 text-[var(--color-primary)]">✓</span>
              <span>Có {previewLessons} bài học xem thử</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5 text-[var(--color-primary)]">✓</span>
              <span>Truy cập trọn đời</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 mt-0.5 text-[var(--color-primary)]">✓</span>
              <span>Chứng chỉ hoàn thành</span>
            </li>
          </ul>

          {isPurchased ? (
            <Link 
              to={`/learn/${slug}`}
              className="block w-full py-2.5 bg-emerald-500 text-white text-center font-bold rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Vào học ngay
            </Link>
          ) : (
            <Link 
              to={`/courses/${slug}`}
              className="block w-full py-2.5 bg-[var(--color-primary)] text-[var(--color-on-primary)] text-center font-bold rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Xem khóa học
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

