import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, ArrowLeft, Video, LockOpen, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { LessonModal, type LessonFormData } from '@/components/admin/lessons/LessonModal'
import { getCourseLessons, createLesson, updateLesson, deleteLesson } from '@/services/lesson.service'
import { getCourseById } from '@/services/course.service'
import type { Lesson } from '@/types/course.types'

export default function AdminLessonsPage() {
  const { id: courseId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [lessonToDelete, setLessonToDelete] = useState<Lesson | null>(null)

  // Fetch course details (for title)
  const { data: course } = useQuery({
    queryKey: ['admin', 'course', courseId],
    queryFn: () => getCourseById(courseId as string),
    enabled: !!courseId,
  })

  // Fetch lessons
  const { data: lessons = [], isLoading } = useQuery({
    queryKey: ['admin', 'course', courseId, 'lessons'],
    queryFn: () => getCourseLessons(courseId as string),
    enabled: !!courseId,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Lesson>) => createLesson(courseId as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', courseId, 'lessons'] })
      toast.success('Thêm bài học thành công')
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lesson> }) => updateLesson(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', courseId, 'lessons'] })
      toast.success('Cập nhật bài học thành công')
      setIsModalOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLesson,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'course', courseId, 'lessons'] })
      toast.success('Xóa bài học thành công')
      setIsConfirmDeleteOpen(false)
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra')
      setIsConfirmDeleteOpen(false)
    },
  })

  // Handlers
  const handleOpenModal = (lesson?: Lesson) => {
    setSelectedLesson(lesson || null)
    setIsModalOpen(true)
  }

  const handleSubmit = (formData: LessonFormData) => {
    // Transform options object back to array if needed, though react-hook-form handles it
    if (selectedLesson) {
      updateMutation.mutate({ id: selectedLesson._id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDeleteClick = (lesson: Lesson) => {
    setLessonToDelete(lesson)
    setIsConfirmDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (lessonToDelete) {
      deleteMutation.mutate(lessonToDelete._id)
    }
  }

  // Calculate next order
  const nextOrder = lessons.length > 0 ? Math.max(...lessons.map(l => l.order)) + 1 : 1

  // Columns
  const columns: ColumnDef<Lesson>[] = [
    {
      header: 'Thứ tự',
      accessorKey: 'order',
      cell: (lesson) => (
        <span className="font-medium text-[var(--color-on-surface-variant)]">{lesson.order}</span>
      ),
    },
    {
      header: 'Tiêu đề bài học',
      accessorKey: 'title',
      cell: (lesson: Lesson) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[var(--color-surface-variant)]/30 flex items-center justify-center text-[var(--color-primary)] shrink-0">
            <Video size={20} />
          </div>
          <span className="font-medium text-[var(--color-on-surface)] line-clamp-1">{lesson.title}</span>
        </div>
      ),
    },
    {
      header: 'Quyền truy cập',
      accessorKey: 'isFree',
      cell: (lesson: Lesson) => (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          lesson.isFree ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)]'
        }`}>
          {lesson.isFree ? <LockOpen size={12} /> : <Lock size={12} />}
          {lesson.isFree ? 'Miễn phí' : 'Cần mua'}
        </span>
      ),
    },
    {
      header: 'Trắc nghiệm',
      accessorKey: 'quiz',
      cell: (lesson: Lesson) => (
        <span className="text-[var(--color-on-surface-variant)]">
          {lesson.quiz?.length ? `${lesson.quiz.length} câu` : 'Không có'}
        </span>
      ),
    },
    {
      header: 'Thao tác',
      accessorKey: '_id',
      cell: (lesson: Lesson) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleOpenModal(lesson)
            }}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Sửa bài học"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteClick(lesson)
            }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa bài học"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/courses')}
          className="p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] rounded-full transition-colors"
          title="Quay lại danh sách khóa học"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)] flex items-center gap-2">
            Quản lý Bài học
          </h1>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">
            Khóa học: <span className="font-medium">{course?.title || 'Đang tải...'}</span>
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          <span>Thêm bài học</span>
        </button>
      </div>

      <div className="bg-[var(--color-surface)] border border-[var(--color-surface-variant)] rounded-2xl overflow-hidden elevation-1">
        <DataTable
          columns={columns}
          data={lessons}
          isLoading={isLoading}
          onRowClick={handleOpenModal}
        />
      </div>

      <LessonModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedLesson}
        isLoading={createMutation.isPending || updateMutation.isPending}
        nextOrder={nextOrder}
      />

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="Xóa bài học"
        message={`Bạn có chắc chắn muốn xóa bài học "${lessonToDelete?.title}" không? Học viên sẽ mất tiến độ bài học này.`}
        confirmText="Xóa"
        cancelText="Hủy"
        onConfirm={confirmDelete}
        onClose={() => setIsConfirmDeleteOpen(false)}
        variant="danger"
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
