import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Modal } from '@/components/ui/Modal'
import type { Lesson } from '@/types/course.types'
import { QuizEditor } from './QuizEditor'

export const quizQuestionSchema = z.object({
  question: z.string().min(3, 'Câu hỏi quá ngắn'),
  options: z.array(z.string().min(1, 'Lựa chọn không được trống')).min(2, 'Ít nhất 2 lựa chọn'),
  correctAnswer: z.coerce.number().min(0),
})

export const lessonSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(200, 'Tiêu đề tối đa 200 ký tự'),
  youtubeUrl: z.string().url('URL YouTube không hợp lệ').optional().or(z.literal('')),
  order: z.coerce.number().min(1, 'Thứ tự bài học phải từ 1 trở lên'),
  isFree: z.boolean().default(false),
  quiz: z.array(quizQuestionSchema).optional(),
})

export type LessonFormData = z.infer<typeof lessonSchema>

interface LessonModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LessonFormData) => void
  initialData?: Lesson | null
  isLoading?: boolean
  nextOrder?: number
}

export function LessonModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
  nextOrder = 1,
}: LessonModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema) as any,
    defaultValues: {
      title: '',
      youtubeUrl: '',
      order: nextOrder,
      isFree: false,
      quiz: [],
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          youtubeUrl: initialData.youtubeUrl || '',
          order: initialData.order,
          isFree: initialData.isFree,
          quiz: initialData.quiz || [],
        })
      } else {
        reset({
          title: '',
          youtubeUrl: '',
          order: nextOrder,
          isFree: false,
          quiz: [],
        })
      }
    }
  }, [isOpen, initialData, reset, nextOrder])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
                Tiêu đề bài học <span className="text-[var(--color-error)]">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                placeholder="Nhập tiêu đề bài học..."
                {...register('title')}
              />
              {errors.title && (
                <p className="text-label-sm text-[var(--color-error)] mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
                URL YouTube
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
                {...register('youtubeUrl')}
              />
              {errors.youtubeUrl && (
                <p className="text-label-sm text-[var(--color-error)] mt-1">
                  {errors.youtubeUrl.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
                  Thứ tự <span className="text-[var(--color-error)]">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
                  {...register('order')}
                />
                {errors.order && (
                  <p className="text-label-sm text-[var(--color-error)] mt-1">
                    {errors.order.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
                  Quyền truy cập
                </label>
                <label className="flex items-center gap-3 p-2 bg-[var(--color-surface-variant)]/30 rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-[var(--color-primary)]"
                    {...register('isFree')}
                  />
                  <span className="text-body-md text-[var(--color-on-surface)]">Học thử miễn phí</span>
                </label>
              </div>
            </div>
          </div>

          <div className="border-l-0 md:border-l border-[var(--color-surface-variant)] md:pl-6">
            <h3 className="text-headline-sm text-[var(--color-on-surface)] mb-4">Câu hỏi trắc nghiệm</h3>
            <QuizEditor control={control as any} register={register as any} errors={errors} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-surface-variant)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading || !isDirty}
            className={`px-6 py-2 rounded-xl font-medium transition-colors ${
              isLoading || !isDirty
                ? 'bg-[var(--color-surface-variant)] text-[var(--color-on-surface-variant)] cursor-not-allowed opacity-70'
                : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary)]/90'
            }`}
          >
            {isLoading ? 'Đang lưu...' : 'Lưu bài học'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
