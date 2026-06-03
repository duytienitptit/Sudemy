import { useState } from 'react'
import { PlayCircle, CheckCircle2, ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Lesson } from '@/types/course.types'

interface LessonAccordionProps {
  lessons: Lesson[]
  totalLessons: number
  courseSlug?: string
  isPurchased?: boolean
  completedLessons?: string[]
}

export function LessonAccordion({ lessons, totalLessons, courseSlug, isPurchased = false, completedLessons = [] }: LessonAccordionProps) {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()

  const handleLessonClick = (lesson: Lesson) => {
    // Purchased users can access all lessons; non-purchased only free ones
    if ((isPurchased || lesson.isFree) && courseSlug && lesson.slug) {
      navigate(`/learn/${courseSlug}/${lesson.slug}`)
    }
  }

  const completedCount = completedLessons.length

  return (
    <div className="border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] rounded-xl overflow-hidden">
      {/* Accordion Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] transition-colors text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h3 className="font-bold text-[var(--color-on-surface)] text-lg">Nội dung bài học</h3>
        </div>
        <div className="flex items-center text-sm text-[var(--color-on-surface-variant)]">
          {isPurchased && completedCount > 0 && (
            <span className="hidden sm:inline-block mr-4 text-[var(--color-success)] font-medium">
              {completedCount}/{totalLessons} hoàn thành
            </span>
          )}
          <span className="hidden sm:inline-block mr-4 text-[var(--color-on-surface-variant)]">{totalLessons} bài học</span>
          <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-surface-container-high)] transition-transform duration-200">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="divide-y divide-[var(--color-outline-variant)]/60">
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson, index) => {
              const isCompleted = completedLessons.includes(lesson._id)
              const isClickable = isPurchased || lesson.isFree

              return (
                <div 
                  key={lesson._id} 
                  onClick={() => handleLessonClick(lesson)}
                  className={`flex items-center justify-between px-5 py-3.5 transition-all duration-200 ${
                    isClickable
                      ? 'hover:bg-[var(--color-primary)]/5 hover:pl-6 cursor-pointer'
                      : 'hover:bg-[var(--color-surface-container-low)]'
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center group min-w-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4.5 h-4.5 mr-4 flex-shrink-0 text-[var(--color-success)]" />
                    ) : (
                      <PlayCircle className={`w-4.5 h-4.5 mr-4 flex-shrink-0 transition-all duration-200 ${
                        isClickable
                          ? 'text-[var(--color-primary)] group-hover:scale-110'
                          : 'text-[var(--color-on-surface-variant)]/60'
                      }`} />
                    )}
                    <span className={`text-sm truncate ${
                      isCompleted
                        ? 'text-[var(--color-success)] font-medium'
                        : isClickable
                        ? 'text-[var(--color-on-surface)] hover:text-[var(--color-primary)] transition-colors'
                        : 'text-[var(--color-on-surface)]'
                    }`}>
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center ml-4 flex-shrink-0">
                    {isCompleted ? (
                      <span className="text-xs text-[var(--color-success)] font-medium mr-4 hidden sm:block">
                        Hoàn thành
                      </span>
                    ) : isPurchased ? (
                      /* Purchased but not completed — no badge, just duration */
                      null
                    ) : lesson.isFree ? (
                      <span className="text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full mr-4 hidden sm:block">
                        Xem thử
                      </span>
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)]/50 mr-4 hidden sm:block" />
                    )}
                    <span className="text-sm text-[var(--color-on-surface-variant)] tabular-nums">10:00</span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-8 text-center text-[var(--color-on-surface-variant)] italic">
              Nội dung bài học đang được cập nhật.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
