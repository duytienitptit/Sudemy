import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  getAdminFlashSales,
  createFlashSale,
  updateFlashSale,
  deleteFlashSale,
} from '@/services/payment.service'
import type { AdminFlashSale, FlashSaleFormInput } from '@/services/payment.service'
import { getCourses } from '@/services/course.service'

// ─── Status helpers ───────────────────────────────────────────────────────────

type SaleStatus = 'active' | 'upcoming' | 'expired'

function getSaleStatus(sale: AdminFlashSale): SaleStatus {
  const now = new Date()
  const start = new Date(sale.startTime)
  const end = new Date(sale.endTime)
  if (now < start) return 'upcoming'
  if (now > end) return 'expired'
  return 'active'
}

function FlashSaleStatusBadge({ sale }: { sale: AdminFlashSale }) {
  const status = getSaleStatus(sale)
  if (status === 'active')
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]">
        Đang diễn ra
      </span>
    )
  if (status === 'upcoming')
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-tertiary-light)] text-[var(--color-tertiary-container)]">
        Sắp diễn ra
      </span>
    )
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-error-container)] text-[var(--color-error)]">
      Đã kết thúc
    </span>
  )
}

function fmtDt(iso: string) {
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function toDatetimeLocal(iso: string) {
  // Convert ISO to "YYYY-MM-DDThh:mm" for datetime-local input
  return iso ? new Date(iso).toISOString().slice(0, 16) : ''
}

// ─── Flash Sale form ──────────────────────────────────────────────────────────

interface FlashSaleFormProps {
  initial?: AdminFlashSale | null
  onSubmit: (data: FlashSaleFormInput) => void
  onCancel: () => void
  isPending: boolean
}

function FlashSaleForm({ initial, onSubmit, onCancel, isPending }: FlashSaleFormProps) {
  const [form, setForm] = useState<FlashSaleFormInput>({
    title: initial?.title ?? '',
    discountPercent: initial?.discountPercent ?? 20,
    startTime: initial ? toDatetimeLocal(initial.startTime) : '',
    endTime: initial ? toDatetimeLocal(initial.endTime) : '',
    courseIds: initial?.courseIds ?? [],
  })

  // Fetch available courses to select from
  const { data: coursesData } = useQuery({
    queryKey: ['courses', 'all'],
    queryFn: () => getCourses({ page: 1, limit: 100 }),
  })

  function set<K extends keyof FlashSaleFormInput>(key: K, value: FlashSaleFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const labelClass = 'block text-label-sm font-medium text-[var(--color-on-surface)] mb-1'
  const inputClass =
    'w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'

  function toggleCourse(id: string) {
    set('courseIds', form.courseIds.includes(id)
      ? form.courseIds.filter((c) => c !== id)
      : [...form.courseIds, id]
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          ...form,
          discountPercent: Number(form.discountPercent),
          // Convert back to ISO before sending
          startTime: new Date(form.startTime).toISOString(),
          endTime: new Date(form.endTime).toISOString(),
        } as any)
      }}
      className="space-y-4"
    >
      <div>
        <label className={labelClass}>Tiêu đề flash sale *</label>
        <input
          id="flash-title"
          type="text"
          required
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          className={inputClass}
          placeholder="Flash Sale Cuối Tuần"
        />
      </div>

      <div>
        <label className={labelClass}>Giảm giá (%) *</label>
        <input
          id="flash-discount-percent"
          type="number"
          required
          min={1}
          max={100}
          value={form.discountPercent}
          onChange={(e) => {
            if (e.target.value === '') {
              set('discountPercent', '')
              return
            }
            let val = Number(e.target.value)
            if (val < 0) val = 0
            if (val > 100) val = 100
            set('discountPercent', val)
          }}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Bắt đầu *</label>
          <input
            id="flash-start-time"
            type="datetime-local"
            required
            value={form.startTime}
            onChange={(e) => set('startTime', e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            className={inputClass + ' cursor-pointer'}
          />
        </div>
        <div>
          <label className={labelClass}>Kết thúc *</label>
          <input
            id="flash-end-time"
            type="datetime-local"
            required
            value={form.endTime}
            onChange={(e) => set('endTime', e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            className={inputClass + ' cursor-pointer'}
          />
        </div>
      </div>

      {/* Course selector */}
      <div>
        <label className={labelClass}>Khóa học áp dụng</label>
        <div className="max-h-40 overflow-y-auto border border-[var(--color-outline-variant)] rounded-lg p-2 space-y-1">
          {coursesData?.data?.length ? (
            coursesData.data.map((course) => (
              <label key={course._id} className="flex items-center gap-2 cursor-pointer hover:bg-[var(--color-surface-variant)] rounded-md px-2 py-1">
                <input
                  type="checkbox"
                  checked={form.courseIds.includes(course._id)}
                  onChange={() => toggleCourse(course._id)}
                  className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span className="text-sm text-[var(--color-on-surface)] line-clamp-1">{course.title}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-[var(--color-on-surface-variant)] p-2">Đang tải khóa học...</p>
          )}
        </div>
        {form.courseIds.length > 0 && (
          <p className="text-xs text-[var(--color-primary)] mt-1">
            Đã chọn {form.courseIds.length} khóa học
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--color-outline-variant)] text-sm font-medium text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] transition-colors"
        >
          Hủy
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] disabled:opacity-50 transition-colors"
        >
          {isPending ? 'Đang lưu...' : initial ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminFlashSalesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selected, setSelected] = useState<AdminFlashSale | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminFlashSale | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'flash-sales', page],
    queryFn: () => getAdminFlashSales({ page, limit: 10 }),
  })

  const handleError = (err: any) => {
    const errorData = err.response?.data?.error
    if (errorData?.details?.length) {
      toast.error(errorData.details[0].message)
    } else {
      toast.error(errorData?.message || 'Có lỗi xảy ra')
    }
  }

  const createMutation = useMutation({
    mutationFn: createFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flash-sales'] })
      toast.success('Tạo flash sale thành công')
      setIsModalOpen(false)
    },
    onError: handleError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FlashSaleFormInput> }) =>
      updateFlashSale(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flash-sales'] })
      toast.success('Cập nhật flash sale thành công')
      setIsModalOpen(false)
    },
    onError: handleError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFlashSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flash-sales'] })
      toast.success('Xóa flash sale thành công')
      setDeleteTarget(null)
    },
    onError: handleError,
  })

  const handleSubmit = (formData: FlashSaleFormInput) => {
    if (selected) {
      updateMutation.mutate({ id: selected._id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const columns: ColumnDef<AdminFlashSale>[] = [
    {
      header: 'Tiêu đề',
      accessorKey: 'title',
      cell: (s: AdminFlashSale) => (
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-amber-500 shrink-0" />
          <span className="font-medium text-[var(--color-on-surface)]">{s.title}</span>
        </div>
      ),
    },
    {
      header: 'Giảm',
      accessorKey: 'discountPercent',
      cell: (s: AdminFlashSale) => (
        <span className="font-bold text-[var(--color-primary)]">{s.discountPercent}%</span>
      ),
    },
    {
      header: 'Bắt đầu',
      cell: (s: AdminFlashSale) => (
        <span className="text-sm text-[var(--color-on-surface-variant)]">{fmtDt(s.startTime)}</span>
      ),
    },
    {
      header: 'Kết thúc',
      cell: (s: AdminFlashSale) => (
        <span className="text-sm text-[var(--color-on-surface-variant)]">{fmtDt(s.endTime)}</span>
      ),
    },
    {
      header: 'Khóa học',
      cell: (s: AdminFlashSale) => (
        <span className="text-sm text-[var(--color-on-surface-variant)]">
          {s.courseIds?.length || 0} khóa
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      cell: (s: AdminFlashSale) => <FlashSaleStatusBadge sale={s} />,
    },
    {
      header: 'Thao tác',
      accessorKey: '_id',
      cell: (s: AdminFlashSale) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setSelected(s); setIsModalOpen(true) }}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Sửa"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(s)}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            title="Xóa"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-headline-md text-[var(--color-on-surface)] flex items-center gap-2">
            <Zap size={26} className="text-amber-500" />
            Quản lý Flash Sale
          </h1>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">
            Tạo và quản lý các chương trình khuyến mãi giới hạn thời gian.
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setIsModalOpen(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo Flash Sale
        </button>
      </div>

      {/* Status legend */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-on-surface-variant)]">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          Đang diễn ra
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />
          Sắp diễn ra
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
          Đã kết thúc
        </span>
      </div>

      {/* Table */}
      <div className="elevation-1 rounded-2xl overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          pagination={{
            page,
            totalPages: data?.pagination?.pages || 1,
            onPageChange: setPage,
          }}
        />
      </div>

      {/* Create / Edit modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selected ? 'Chỉnh sửa Flash Sale' : 'Tạo Flash Sale mới'}
        maxWidth="max-w-lg"
      >
        <FlashSaleForm
          initial={selected}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa Flash Sale"
        message={`Bạn có chắc muốn xóa flash sale "${deleteTarget?.title}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onClose={() => setDeleteTarget(null)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
