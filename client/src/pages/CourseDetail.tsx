import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { getCourseBySlug } from '@/services/course.service'
import { getCourseProgress } from '@/services/progress.service'
import { CourseDetailHeader } from '@/components/courses/CourseDetailHeader'
import { CourseIncludes } from '@/components/courses/CourseIncludes'
import { WhatYouWillLearn } from '@/components/courses/WhatYouWillLearn'
import { LessonAccordion } from '@/components/courses/LessonAccordion'
import { useAuth } from '@/contexts/AuthContext'

export const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', slug],
    queryFn: () => getCourseBySlug(slug as string),
    enabled: !!slug,
    retry: 1,
  })

  // Determine if user has purchased this course
  const isPurchased = !!user && (
    user.role === 'admin' ||
    user.role === 'editor' ||
    (course?._id ? user.purchasedCourses?.includes(course._id) ?? false : false)
  )

  // Fetch progress for purchased courses
  const { data: progress } = useQuery({
    queryKey: ['progress', course?._id],
    queryFn: () => getCourseProgress(course!._id),
    enabled: !!course?._id && isPurchased,
    retry: false,
  })

  const completedLessons = progress?.completedLessons || []

  if (isError) {
    // If not found, we could redirect to 404 or show an empty state
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-4">Không tìm thấy khóa học</h2>
        <p className="text-[var(--color-on-surface-variant)] mb-6">Khóa học bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <button 
          onClick={() => navigate('/courses')}
          className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-medium rounded-lg"
        >
          Quay lại danh sách khóa học
        </button>
      </div>
    )
  }

  if (isLoading || !course) {
    return (
      <div className="min-h-screen bg-[var(--color-background)]">
        <div className="h-80 bg-[var(--color-inverse-surface)] animate-pulse"></div>
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div className="h-64 bg-[var(--color-surface-container)] rounded-xl animate-pulse"></div>
            <div className="h-64 bg-[var(--color-surface-container)] rounded-xl animate-pulse"></div>
          </div>
          <div className="w-full lg:w-[340px] xl:w-[400px] h-96 bg-[var(--color-surface-container)] rounded-xl animate-pulse"></div>
        </div>
      </div>
    )
  }

  // Determine short text for SEO meta
  const shortDescription = course.description.replace(/<[^>]*>?/gm, '').substring(0, 160)

  return (
    <div className="bg-[var(--color-background)] min-h-screen relative">
      <Helmet>
        <title>{course.title} - Sudemy</title>
        <meta name="description" content={shortDescription} />
        {/* Open Graph Tags */}
        <meta property="og:title" content={course.title} />
        <meta property="og:description" content={shortDescription} />
        <meta property="og:image" content={course.thumbnail} />
      </Helmet>

      {/* Header section (Dark bg) */}
      <CourseDetailHeader course={course} />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col-reverse lg:flex-row gap-10">
          
          {/* Left Column: Course Details */}
          <div className="flex-1 lg:pr-8">
            {/* Mobile/Tablet Course Includes (visible only when sticky sidebar hides) */}
            <div className="block lg:hidden mb-10">
              <CourseIncludes course={course} />
            </div>

            <div className="mb-12">
              <WhatYouWillLearn />
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6">Nội dung khóa học</h2>
              <LessonAccordion 
                lessons={course.lessons || []} 
                totalLessons={course.totalLessons}
                courseSlug={course.slug}
                isPurchased={isPurchased}
                completedLessons={completedLessons}
              />
            </div>

            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6">Mô tả khóa học</h2>
              <div 
                className="prose prose-slate dark:prose-invert max-w-none text-[var(--color-on-surface)]"
                dangerouslySetInnerHTML={{ __html: course.description }}
              />
            </div>
            
            {/* Reviews Section */}
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-on-surface)] mb-6">Đánh giá của học viên</h2>
              {course.ratings && course.ratings.count > 0 ? (
                <div className="bg-[var(--color-surface-container)] rounded-xl p-8 border border-[var(--color-outline-variant)]">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    {/* Average Score */}
                    <div className="text-center shrink-0">
                      <p className="text-5xl font-bold text-[var(--color-on-surface)]">
                        {course.ratings.average?.toFixed(1) || '0.0'}
                      </p>
                      <div className="flex items-center justify-center gap-0.5 mt-2 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < Math.round(course.ratings?.average || 0) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-[var(--color-on-surface-variant)]">
                        {course.ratings.count} đánh giá
                      </p>
                    </div>

                    {/* Rating Bars */}
                    <div className="flex-1 w-full space-y-2">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const percent = star === 5 ? 78 : star === 4 ? 15 : star === 3 ? 5 : star === 2 ? 1 : 1
                        return (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-sm text-[var(--color-on-surface-variant)] w-12 shrink-0">{star} sao</span>
                            <div className="flex-1 h-2.5 bg-[var(--color-outline-variant)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400 rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                            <span className="text-sm text-[var(--color-on-surface-variant)] w-10 text-right">{percent}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-[var(--color-surface-container)] rounded-xl p-8 border border-[var(--color-outline-variant)] flex items-center justify-center min-h-[120px]">
                  <p className="text-[var(--color-on-surface-variant)] text-center">
                    Chưa có đánh giá nào cho khóa học này.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Purchase Sidebar (Desktop Only) */}
          <div className="hidden lg:block w-[340px] xl:w-[400px] flex-shrink-0">
            {/* Negative margin to pull it up over the dark header */}
            <div className="sticky top-24 -mt-72 z-10">
              <CourseIncludes course={course} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

