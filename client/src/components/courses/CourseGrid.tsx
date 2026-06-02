import type { Course } from '@/types/course.types'
import { CourseCard } from './CourseCard'

interface CourseGridProps {
  courses: Course[]
  isLoading?: boolean
}

export function CourseGrid({ courses, isLoading }: CourseGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse flex flex-col h-[320px] rounded-xl bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]">
            <div className="w-full aspect-video bg-[var(--color-surface-container-highest)] rounded-t-xl"></div>
            <div className="p-4 flex flex-col flex-1 gap-3">
              <div className="h-4 bg-[var(--color-surface-container-highest)] rounded w-3/4"></div>
              <div className="h-4 bg-[var(--color-surface-container-highest)] rounded w-1/2"></div>
              <div className="mt-auto h-6 bg-[var(--color-surface-container-highest)] rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-[var(--color-surface-container)] rounded-xl border border-dashed border-[var(--color-outline)]">
        <div className="w-16 h-16 rounded-full bg-[var(--color-surface-container-highest)] flex items-center justify-center mb-4">
          <span className="text-2xl text-[var(--color-on-surface-variant)]">📚</span>
        </div>
        <h3 className="text-xl font-bold text-[var(--color-on-surface)] mb-2">No courses found</h3>
        <p className="text-[var(--color-on-surface-variant)] max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  )
}
