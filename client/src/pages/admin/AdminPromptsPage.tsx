import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Search, Video, Image } from 'lucide-react'
import { getPrompts, createPrompt, updatePrompt, deletePrompt, type IPrompt } from '@/services/prompt.service'
import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'

const promptSchema = z.object({
  title: z.string().min(1, 'Tiêu đề là bắt buộc'),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  type: z.enum(['image', 'video']),
  sampleImage: z.string().optional(),
})

type PromptFormData = z.infer<typeof promptSchema>

export default function AdminPromptsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [promptToEdit, setPromptToEdit] = useState<IPrompt | null>(null)
  const [promptToDelete, setPromptToDelete] = useState<IPrompt | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['admin-prompts', { page, search: debouncedSearch }],
    queryFn: () => getPrompts({ page, limit: 10, search: debouncedSearch || undefined }),
    placeholderData: keepPreviousData,
  })

  const createMutation = useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prompts'] })
      toast.success('Tạo prompt thành công')
      handleCloseModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Tạo prompt thất bại'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<IPrompt> }) => updatePrompt(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prompts'] })
      toast.success('Cập nhật prompt thành công')
      handleCloseModal()
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Cập nhật thất bại'),
  })

  const deleteMutation = useMutation({
    mutationFn: deletePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-prompts'] })
      toast.success('Đã xoá prompt')
      setPromptToDelete(null)
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Xoá thất bại'),
  })

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PromptFormData>({
    resolver: zodResolver(promptSchema),
    defaultValues: { type: 'video', sampleImage: '' },
  })

  const watchedType = watch('type')

  const handleOpenModal = (prompt?: IPrompt) => {
    if (prompt) {
      setPromptToEdit(prompt)
      setValue('title', prompt.title)
      setValue('content', prompt.content)
      setValue('type', prompt.type)
      setValue('sampleImage', prompt.sampleImage || '')
    } else {
      setPromptToEdit(null)
      reset({ title: '', content: '', type: 'video', sampleImage: '' })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setPromptToEdit(null)
    reset()
  }

  const onSubmit = (formData: PromptFormData) => {
    const payload = {
      ...formData,
      sampleImage: formData.type === 'image' ? formData.sampleImage : undefined,
    }
    if (promptToEdit) {
      updateMutation.mutate({ id: promptToEdit._id, payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const columns: ColumnDef<IPrompt>[] = [
    {
      header: 'Tiêu đề',
      accessorKey: 'title',
      cell: (p) => <span className="font-medium text-[var(--color-on-surface)] line-clamp-1">{p.title}</span>,
    },
    {
      header: 'Loại',
      accessorKey: 'type',
      cell: (p) => (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          p.type === 'video'
            ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)]'
            : 'bg-[var(--color-tertiary-light)] text-[var(--color-tertiary-container)]'
        }`}>
          {p.type === 'video' ? <Video size={12} /> : <Image size={12} />}
          {p.type === 'video' ? 'Video' : 'Ảnh'}
        </span>
      ),
    },
    {
      header: 'Lượt sao chép',
      accessorKey: 'copyCount',
      cell: (p) => <span className="text-[var(--color-on-surface-variant)]">{p.copyCount}</span>,
    },
    {
      header: 'Thao tác',
      cell: (p) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleOpenModal(p)}
            className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors"
            title="Chỉnh sửa"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setPromptToDelete(p)}
            className="p-2 text-[var(--color-error)] hover:bg-[var(--color-error)]/10 rounded-lg transition-colors"
            title="Xoá"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-md font-bold text-[var(--color-on-surface)]">Quản lý Prompts</h1>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">Prompt tạo ảnh và tạo video</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm prompt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-[var(--color-on-surface)] text-sm"
            />
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg hover:bg-[var(--color-primary-dark)] transition-colors whitespace-nowrap text-sm font-medium"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Thêm Prompt</span>
          </button>
        </div>
      </div>

      <div className={`elevation-1 rounded-2xl overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
        <DataTable
          data={data?.prompts || []}
          columns={columns}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: data?.pagination?.totalPages || 1,
            onPageChange: setPage,
          }}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={promptToEdit ? 'Chỉnh sửa Prompt' : 'Thêm Prompt mới'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type selector */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Loại Prompt</label>
            <div className="grid grid-cols-2 gap-3">
              {(['video', 'image'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue('type', t)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    watchedType === t
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                      : 'border-[var(--color-outline-variant)] hover:border-[var(--color-primary)]/50'
                  }`}
                >
                  {t === 'video' ? <Video size={18} className="text-[var(--color-primary)]" /> : <Image size={18} className="text-[var(--color-tertiary-container)]" />}
                  <span className="font-medium text-[var(--color-on-surface)] text-sm">
                    {t === 'video' ? 'Prompt Tạo Video' : 'Prompt Tạo Ảnh'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">Tiêu đề</label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border border-[var(--color-outline-variant)] rounded-md bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
              placeholder="VD: Tư thế Quyến rũ chạm váy"
            />
            {errors.title && <p className="text-[var(--color-error)] text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">
              Nội dung Prompt
              <span className="ml-1 text-xs text-[var(--color-on-surface-variant)] font-normal">
                {watchedType === 'video' ? '(mô tả chuyển động theo thời gian)' : '(mô tả chi tiết ảnh cần tạo)'}
              </span>
            </label>
            <textarea
              {...register('content')}
              rows={6}
              className="w-full px-3 py-2 border border-[var(--color-outline-variant)] rounded-md bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-y font-mono text-sm"
              placeholder={watchedType === 'video'
                ? '0-2s: Đứng thẳng mặt trước...\n2-4s: Xoay người chậm sang phải...'
                : 'Tạo ảnh... trên nền trắng, ánh sáng studio...'}
            />
            {errors.content && <p className="text-[var(--color-error)] text-xs mt-1">{errors.content.message}</p>}
          </div>

          {/* Sample Image (image type only) */}
          {watchedType === 'image' && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-1">
                URL Ảnh Mẫu
                <span className="ml-1 text-xs text-[var(--color-on-surface-variant)] font-normal">(tuỳ chọn)</span>
              </label>
              <input
                {...register('sampleImage')}
                type="url"
                className="w-full px-3 py-2 border border-[var(--color-outline-variant)] rounded-md bg-[var(--color-surface)] text-[var(--color-on-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                placeholder="https://example.com/sample-image.jpg"
              />
              {errors.sampleImage && <p className="text-[var(--color-error)] text-xs mt-1">{errors.sampleImage.message}</p>}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-[var(--color-outline-variant)] rounded-md hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] transition-colors"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending ? 'Đang lưu...' : 'Lưu Prompt'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!promptToDelete}
        onClose={() => setPromptToDelete(null)}
        onConfirm={() => promptToDelete && deleteMutation.mutate(promptToDelete._id)}
        title="Xoá Prompt"
        message={`Bạn có chắc muốn xoá prompt "${promptToDelete?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xoá"
        variant="danger"
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
