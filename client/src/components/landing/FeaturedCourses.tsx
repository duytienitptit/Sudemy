import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getCourses } from '@/services/course.service'
import type { Course } from '@/types/course.types'
import { CourseCard } from '@/components/courses/CourseCard'

export function FeaturedCourses() {
  const { data, isLoading } = useQuery({
    queryKey: ['courses', 'featured'],
    queryFn: () => getCourses({ status: 'published', limit: 4 }),
  })

  const courses = data?.data || []

  return (
    <section className="py-20 bg-[var(--color-surface)] dark:bg-[var(--color-surface)]">
      <div className="container-sudemy">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-display-sm text-[var(--color-on-surface)] mb-2">Khóa Học Nổi Bật</h2>
            <p className="text-body-lg text-[var(--color-on-surface-variant)]">
              Các khóa học thực chiến được đánh giá cao nhất
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 text-[var(--color-primary)] font-semibold hover:text-[var(--color-primary-hover)] transition-colors"
            >
              Xem tất cả <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-[var(--color-surface-container)] rounded-2xl h-[380px]" />
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course: Course, index: number) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--color-surface-container-low)] rounded-2xl border border-dashed border-[var(--color-outline-variant)]">
            <p className="text-body-lg text-[var(--color-on-surface-variant)]">Đang cập nhật khóa học mới...</p>
          </div>
        )}
      </div>
    </section>
  )
}
