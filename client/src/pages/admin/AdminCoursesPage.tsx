import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, ListVideo, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CourseModal, type CourseFormData } from '@/components/admin/courses/CourseModal'
import { getCourses, createCourse, updateCourse, deleteCourse, updateCourseStatus } from '@/services/course.service'
import type { Course } from '@/types/course.types'


export default function AdminCoursesPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  
  // State
  const [page, setPage] = useState(1)
  const search = ''
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

  // Fetch data
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courses', page, search],
    queryFn: () => getCourses({ page, limit: 10, search }),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CourseFormData) => createCourse(data as any),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      toast.success('Thêm khóa học thành công! Đang chuyển đến trang bài học...')
      setIsModalOpen(false)
      // Auto-redirect to lessons page after creation
      if (newCourse?._id) {
        navigate(`/admin/courses/${newCourse._id}/lessons`)
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo khóa học')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Course> }) => updateCourse(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      toast.success('Cập nhật khóa học thành công')
      setIsModalOpen(false)
      setSelectedCourse(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật khóa học')
    },
  })


  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'draft' | 'published' | 'archived' }) => updateCourseStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      toast.success('Cập nhật trạng thái thành công')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'courses'] })
      toast.success('Xóa khóa học thành công')
      setIsConfirmDeleteOpen(false)
      setCourseToDelete(null)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
      setIsConfirmDeleteOpen(false)
    },
  })

  // Handlers
  const handleOpenModal = (course?: Course) => {
    setSelectedCourse(course || null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCourse(null)
  }

  const handleSubmit = (formData: CourseFormData) => {
    if (selectedCourse) {
      updateMutation.mutate({ id: selectedCourse._id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const toggleStatus = (course: Course) => {
    const nextStatus = course.status === 'published' ? 'draft' : 'published'
    statusMutation.mutate({ id: course._id, status: nextStatus })
  }

  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course)
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (courseToDelete) {
      deleteMutation.mutate(courseToDelete._id)
    }
  }

  // Columns
  const columns: ColumnDef<Course>[] = [
    {
      header: 'Tên khóa học',
      accessorKey: 'title',
      cell: (course: Course) => (
        <div className="flex items-center gap-3">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-12 h-12 rounded-lg object-cover bg-gray-100 shrink-0"
          />
          <div>
            {/* Clickable title → lessons page */}
            <Link
              to={`/admin/courses/${course._id}/lessons`}
              className="font-medium text-[var(--color-on-surface)] hover:text-[var(--color-primary)] line-clamp-1 transition-colors"
              title="Xem bài học"
            >
              {course.title}
            </Link>
            <p className="text-sm text-[var(--color-on-surface-variant)]">{course.instructor}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Giá',
      accessorKey: 'price',
      cell: (course: Course) => (
        <span className="font-medium text-[var(--color-primary)]">
          {course.price === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.price)}
        </span>
      ),
    },
    {
      header: 'Bài học',
      accessorKey: 'totalLessons',
      cell: (course: Course) => `${course.totalLessons} bài`,
    },
    {
      header: 'Trạng thái',
      accessorKey: 'status',
      cell: (course: Course) => (
        <button
          onClick={() => toggleStatus(course)}
          className="hover:opacity-80 transition-opacity"
          title="Click để chuyển trạng thái"
          disabled={statusMutation.isPending}
        >
          <StatusBadge status={course.status} />
        </button>
      ),
    },
    {
      header: 'Thao tác',
      accessorKey: '_id',
      cell: (course: Course) => (
        <div className="flex items-center gap-1">
          <Link
            to={`/admin/courses/${course._id}/lessons`}
            className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
            title="Quản lý bài học"
          >
            <ListVideo size={18} />
          </Link>
          <button
            onClick={() => handleOpenModal(course)}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Sửa khóa học"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={() => handleDeleteClick(course)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa khóa học"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)]">Quản lý Khóa học</h1>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">
            Thêm, sửa, xóa và xuất bản các khóa học. Click tên để quản lý bài học.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm khóa học</span>
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-variant)] rounded-2xl overflow-hidden elevation-1">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: data?.totalPages || 1,
            onPageChange: setPage
          }}
        />
      </div>

      <CourseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        initialData={selectedCourse}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Xóa khóa học"
        message={`Bạn có chắc chắn muốn xóa khóa học "${courseToDelete?.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => { setIsConfirmDeleteOpen(false); setCourseToDelete(null) }}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
