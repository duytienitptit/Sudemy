import { Star, StarHalf, Users, Globe, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Course } from '@/types/course.types'

interface CourseDetailHeaderProps {
  course: Course
}

export function CourseDetailHeader({ course }: CourseDetailHeaderProps) {
  const { title, description, instructor, ratings, updatedAt } = course

  // Render stars based on average rating
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="w-4 h-4 star-filled" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarHalf key={i} className="w-4 h-4 star-filled" />)
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-[var(--color-outline)] opacity-50" />)
      }
    }
    return stars
  }

  // Format date
  const formattedDate = new Date(updatedAt).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
  })

  // Simple text extraction from HTML for subtitle if needed, or we just render the raw string if it's text
  // The backend might send HTML. We will just use it as a subtitle snippet if it's too long.
  const shortDescription = description.replace(/<[^>]*>?/gm, '').substring(0, 200) + (description.length > 200 ? '...' : '')

  return (
    <div className="course-detail-header text-[var(--color-inverse-on-surface)] py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 relative z-10">
        {/* Left content (Header info) */}
        <div className="flex-1 lg:pr-80 xl:pr-96">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm mb-6" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link to="/" className="text-white/60 hover:text-white transition-colors">Trang chủ</Link>
              </li>
              <li><ChevronRight className="w-4 h-4 text-white/40" /></li>
              <li>
                <Link to="/courses" className="text-white/60 hover:text-white transition-colors">Khóa học</Link>
              </li>
              <li><ChevronRight className="w-4 h-4 text-white/40" /></li>
              <li className="text-white/40 truncate max-w-[200px] sm:max-w-none" aria-current="page">{title}</li>
            </ol>
          </nav>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 leading-tight tracking-tight">
            {title}
          </h1>
          
          <p className="text-lg text-white/75 mb-7 leading-relaxed max-w-2xl">
            {shortDescription}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mb-6">
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-[var(--color-tertiary-dim)] text-lg">{ratings?.average?.toFixed(1) || '0.0'}</span>
              <div className="flex items-center gap-0.5">
                {renderStars(ratings?.average || 0)}
              </div>
              <span className="text-white/60 ml-1 text-sm underline decoration-white/30 underline-offset-2">
                ({ratings?.count || 0} đánh giá)
              </span>
            </div>
            
            <div className="flex items-center text-white/60 text-sm">
              <Users className="w-4 h-4 mr-1.5" />
              <span>1.234 học viên</span>
            </div>
          </div>

          <div className="text-white/60 text-sm mb-5">
            Giảng viên <a href="#" className="text-[var(--color-inverse-primary)] underline decoration-[var(--color-inverse-primary)]/40 underline-offset-2 hover:text-white font-medium transition-colors">{instructor}</a>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-white/55">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Cập nhật lần cuối {formattedDate}
            </span>
            <span className="flex items-center">
              <Globe className="w-4 h-4 mr-1.5" />
              Tiếng Việt
            </span>
          </div>
        </div>

        {/* Right side is intentionally left empty in this component to leave space for the absolute/sticky CourseIncludes card */}
      </div>
    </div>
  )
}
