import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, PlayCircle } from 'lucide-react'
import { getMyOrders } from '@/services/payment.service'

export function MyCoursesGrid() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: getMyOrders,
  })

  // Only show courses from completed (paid) orders to prevent pending checkouts from appearing
  const courses = orders
    .filter((order: any) => order.status === 'completed')
    .map((order: any) => order.courseId)
    .filter(Boolean)

  if (isLoading) {
    return <div className="text-center py-8 text-[var(--color-on-surface-variant)]">Đang tải danh sách khóa học...</div>
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 bg-[var(--color-surface)] border border-[var(--color-surface-variant)] rounded-2xl elevation-1">
        <BookOpen className="w-12 h-12 text-[var(--color-on-surface-variant)] mx-auto mb-4 opacity-50" />
        <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-2">Chưa có khóa học nào</h3>
        <p className="text-body-md text-[var(--color-on-surface-variant)] mb-6">
          Bạn chưa tham gia khóa học nào trên Sudemy.
        </p>
        <Link to="/courses" className="btn-primary">
          Khám phá khóa học
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course: any) => (
        <div key={course._id} className="group flex flex-col bg-[var(--color-surface)] border border-[var(--color-surface-variant)] rounded-2xl overflow-hidden elevation-1 hover:border-[var(--color-primary)] transition-all">
          <div className="relative aspect-video overflow-hidden bg-gray-100">
            <img 
              src={course.thumbnail} 
              alt={course.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="p-5 flex flex-col flex-1">
            <h3 className="font-bold text-lg text-[var(--color-on-surface)] line-clamp-2 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
              Giảng viên: {course.instructor || 'Sudemy Team'}
            </p>
            <div className="mt-auto pt-4 border-t border-[var(--color-surface-variant)]">
              <Link 
                to={`/learn/${course.slug}`} 
                className="block text-center w-full py-2.5 bg-[var(--color-primary-light)]/20 text-[var(--color-primary)] font-semibold rounded-xl hover:bg-[var(--color-primary)] hover:text-[var(--color-on-primary)] transition-colors"
              >
                Tiếp tục học
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
