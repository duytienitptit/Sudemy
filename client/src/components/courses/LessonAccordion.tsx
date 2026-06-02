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
    <div className="border border-[var(--color-outline-variant)] bg-[var(--color-surface)] rounded-sm overflow-hidden">
      {/* Accordion Header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-[var(--color-surface-container-lowest)] hover:bg-[var(--color-surface-container-low)] transition-colors text-left"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
          <h3 className="font-bold text-[var(--color-on-surface)] text-lg">Nội dung bài học</h3>
        </div>
        <div className="flex items-center text-sm text-[var(--color-on-surface-variant)]">
          {isPurchased && completedCount > 0 && (
            <span className="hidden sm:inline-block mr-4 text-[var(--color-success)]">
              {completedCount}/{totalLessons} hoàn thành
            </span>
          )}
          <span className="hidden sm:inline-block mr-4">{totalLessons} bài học</span>
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="divide-y divide-[var(--color-outline-variant)]">
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson._id)
              const isClickable = isPurchased || lesson.isFree

              return (
                <div 
                  key={lesson._id} 
                  onClick={() => handleLessonClick(lesson)}
                  className={`flex items-center justify-between p-4 transition-colors ${
                    isClickable
                      ? 'hover:bg-[var(--color-primary)]/5 cursor-pointer'
                      : 'hover:bg-[var(--color-surface-container-lowest)]'
                  }`}
                >
                  <div className="flex items-center group">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 mr-4 flex-shrink-0 text-[var(--color-success)]" />
                    ) : (
                      <PlayCircle className={`w-4 h-4 mr-4 flex-shrink-0 transition-colors ${
                        isClickable
                          ? 'text-[var(--color-primary)]'
                          : 'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-primary)]'
                      }`} />
                    )}
                    <span className={`text-sm ${
                      isCompleted
                        ? 'text-[var(--color-success)]'
                        : isClickable
                        ? 'text-[var(--color-primary)] underline underline-offset-2'
                        : 'text-[var(--color-on-surface)]'
                    }`}>
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center ml-4">
                    {isCompleted ? (
                      <span className="text-xs text-[var(--color-success)] font-medium mr-4 hidden sm:block">
                        Hoàn thành
                      </span>
                    ) : isPurchased ? (
                      /* Purchased but not completed — no badge, just duration */
                      null
                    ) : lesson.isFree ? (
                      <span className="text-xs text-[var(--color-on-primary)] bg-[var(--color-primary)] px-2 py-0.5 rounded mr-4 hidden sm:block">
                        Xem thử
                      </span>
                    ) : (
                      <Lock className="w-4 h-4 text-[var(--color-on-surface-variant)] mr-4 hidden sm:block" />
                    )}
                    <span className="text-sm text-[var(--color-on-surface-variant)]">10:00</span>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="p-6 text-center text-[var(--color-on-surface-variant)] italic">
              Nội dung bài học đang được cập nhật.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

