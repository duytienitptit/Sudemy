import { Link } from 'react-router-dom'
import { CheckCircle2, PlayCircle, Lock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Course, Lesson } from '@/types/course.types'

interface LessonSidebarProps {
  course: Course
  completedLessons: string[]
  progressPercent: number
  currentLessonSlug?: string
  isEnrolled: boolean
}

export default function LessonSidebar({
  course,
  completedLessons,
  progressPercent,
  currentLessonSlug,
  isEnrolled,
}: LessonSidebarProps) {
  const lessons = course.lessons || []

  const handleLessonClick = (e: React.MouseEvent, lesson: Lesson) => {
    const isLocked = !isEnrolled && !lesson.isFree
    if (isLocked) {
      e.preventDefault()
      toast.error('Bài học này yêu cầu đăng ký khóa học. Vui lòng mua khóa học để tiếp tục.', {
        duration: 3000,
        icon: '🔒',
      })
    }
  }

  return (
    <div className="w-full md:w-80 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-outline-variant)] h-[calc(100vh-64px)] overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-[var(--color-outline-variant)] sticky top-0 bg-[var(--color-surface)] z-10">
        <h2 className="text-headline-sm text-[var(--color-on-surface)] mb-4 line-clamp-2">
          {course.title}
        </h2>
        
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between text-label-sm text-[var(--color-on-surface-variant)]">
              <span>Tiến độ học</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--color-surface-container-high)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--color-primary)] transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          {lessons.map((lesson: Lesson, index: number) => {
            const isCompleted = completedLessons.includes(lesson._id)
            const isActive = lesson.slug === currentLessonSlug
            const isLocked = !isEnrolled && !lesson.isFree
            
            return (
              <Link
                key={lesson._id}
                to={`/learn/${course.slug}/${lesson.slug}`}
                onClick={(e) => handleLessonClick(e, lesson)}
                className={`flex items-start gap-3 p-4 transition-colors ${
                  isActive ? 'bg-[var(--color-surface-container-low)] border-l-4 border-[var(--color-primary)]' : 'border-l-4 border-transparent'
                } ${isLocked ? 'opacity-70' : 'hover:bg-[var(--color-surface-container)]'}`}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-[var(--color-outline)]" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                  ) : (
                    <PlayCircle className={`w-5 h-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-outline)]'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-label-md line-clamp-2 ${
                    isLocked
                      ? 'text-[var(--color-on-surface-variant)]'
                      : isActive
                      ? 'text-[var(--color-primary)]'
                      : 'text-[var(--color-on-surface)]'
                  }`}>
                    {index + 1}. {lesson.title}
                  </div>
                  {isLocked && (
                    <div className="flex items-center gap-1 mt-0.5 text-label-sm text-[var(--color-on-surface-variant)]">
                      <span>Yêu cầu đăng ký</span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

