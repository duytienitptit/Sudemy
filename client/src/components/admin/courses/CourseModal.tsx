import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Modal } from '@/components/ui/Modal'
import { RichTextEditor } from '@/components/ui/RichTextEditor'
import { ImageUploader } from '@/components/ui/ImageUploader'
import type { Course } from '@/types/course.types'

const courseSchema = z.object({
  title: z.string().min(3, 'Tiêu đề phải có ít nhất 3 ký tự').max(200, 'Tiêu đề tối đa 200 ký tự'),
  description: z
    .string()
    .min(10, 'Mô tả phải có ít nhất 10 ký tự')
    .refine(
      (val) => {
        // Strip HTML tags to count plain text length
        const text = val.replace(/<[^>]*>/g, '').trim()
        return text.length >= 10
      },
      { message: 'Mô tả phải có ít nhất 10 ký tự nội dung' }
    ),
  thumbnail: z.string().min(1, 'Vui lòng cung cấp ảnh thu nhỏ'),
  price: z.coerce.number().min(0, 'Giá không được âm'),
  originalPrice: z.coerce.number().min(0, 'Giá gốc không được âm').optional(),
  instructor: z.string().min(1, 'Tên giảng viên không được để trống'),
  previewLessons: z.coerce.number().min(0, 'Số bài học xem trước không được âm').default(2),
  status: z.enum(['draft', 'published']).default('draft'),
})

export type CourseFormData = z.infer<typeof courseSchema>

interface CourseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CourseFormData) => void
  initialData?: Course | null
  isLoading?: boolean
}

export function CourseModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: CourseModalProps) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      thumbnail: '',
      price: 0,
      originalPrice: undefined,
      instructor: '',
      previewLessons: 2,
      status: 'draft',
    },
  })

  const priceValue = watch('price')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          title: initialData.title,
          description: initialData.description,
          thumbnail: initialData.thumbnail,
          price: initialData.price,
          originalPrice: initialData.originalPrice,
          instructor: initialData.instructor,
          previewLessons: initialData.previewLessons,
          status: (initialData.status === 'archived' ? 'draft' : initialData.status) as 'draft' | 'published',
        })
      } else {
        reset({
          title: '',
          description: '',
          thumbnail: '',
          price: 0,
          originalPrice: undefined,
          instructor: '',
          previewLessons: 2,
          status: 'draft',
        })
      }
    }
  }, [isOpen, initialData, reset])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
    >
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-5">

        {/* Title */}
        <div>
          <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
            Tiêu đề khóa học <span className="text-[var(--color-error)]">*</span>
          </label>
          <input
            type="text"
            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
            placeholder="VD: Khóa học ChatGPT từ A đến Z..."
            {...register('title')}
          />
          {errors.title && (
            <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
            Mô tả khóa học <span className="text-[var(--color-error)]">*</span>
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                value={field.value}
                onChange={field.onChange}
                error={errors.description?.message}
                placeholder="Nhập mô tả chi tiết về khóa học, nội dung, học viên sẽ học được gì..."
              />
            )}
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
            Ảnh thu nhỏ <span className="text-[var(--color-error)]">*</span>
          </label>
          <Controller
            name="thumbnail"
            control={control}
            render={({ field }) => (
              <ImageUploader
                value={field.value}
                onChange={field.onChange}
                error={errors.thumbnail?.message}
              />
            )}
          />
        </div>

        {/* Price row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
              Giá bán (VNĐ) <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              placeholder="0 = Miễn phí"
              {...register('price')}
            />
            {priceValue === 0 && (
              <p className="text-label-sm text-[var(--color-success)] mt-1">✓ Khóa học miễn phí</p>
            )}
            {errors.price && (
              <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.price.message}</p>
            )}
          </div>
          <div>
            <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
              Giá gốc (VNĐ)
              <span className="ml-1 text-[var(--color-on-surface-variant)] font-normal">(tuỳ chọn)</span>
            </label>
            <input
              type="number"
              min={0}
              step={1000}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              placeholder="Bỏ trống nếu không có giảm giá"
              {...register('originalPrice')}
            />
            {errors.originalPrice && (
              <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.originalPrice.message}</p>
            )}
          </div>
        </div>

        {/* Instructor + Preview Lessons */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
              Giảng viên <span className="text-[var(--color-error)]">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              placeholder="Tên giảng viên"
              {...register('instructor')}
            />
            {errors.instructor && (
              <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.instructor.message}</p>
            )}
          </div>
          <div>
            <label className="block text-label-md text-[var(--color-on-surface)] mb-1">
              Số bài học xem trước
            </label>
            <input
              type="number"
              min={0}
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-surface-variant)] text-[var(--color-on-surface)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
              placeholder="Mặc định: 2"
              {...register('previewLessons')}
            />
            {errors.previewLessons && (
              <p className="text-label-sm text-[var(--color-error)] mt-1">{errors.previewLessons.message}</p>
            )}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-label-md text-[var(--color-on-surface)] mb-2">
            Trạng thái xuất bản
          </label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="draft"
                {...register('status')}
                className="accent-[var(--color-primary)] w-4 h-4"
              />
              <span className="text-body-sm text-[var(--color-on-surface)]">
                Nháp
                <span className="block text-label-sm text-[var(--color-on-surface-variant)]">Chưa hiển thị công khai</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                value="published"
                {...register('status')}
                className="accent-[var(--color-primary)] w-4 h-4"
              />
              <span className="text-body-sm text-[var(--color-on-surface)]">
                Xuất bản ngay
                <span className="block text-label-sm text-[var(--color-on-surface-variant)]">Hiển thị trên trang khóa học</span>
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-surface-variant)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)] transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-medium bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              initialData ? 'Cập nhật khóa học' : 'Tạo khóa học'
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
