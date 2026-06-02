import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Edit2, Trash2, Ticket } from 'lucide-react'
import toast from 'react-hot-toast'

import { DataTable, type ColumnDef } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import {
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from '@/services/payment.service'
import type { Coupon, CouponFormInput } from '@/services/payment.service'

// ─── Status badge ─────────────────────────────────────────────────────────────

function CouponStatusBadge({ coupon }: { coupon: Coupon }) {
  const now = new Date()
  const expiry = new Date(coupon.expiresAt)
  const exhausted = coupon.usedCount >= coupon.maxUses

  if (!coupon.isActive || exhausted) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-error-container)] text-[var(--color-error)]">
        Tắt
      </span>
    )
  }
  if (expiry < now) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-error-container)] text-[var(--color-error)]">
        Hết hạn
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]">
      Hoạt động
    </span>
  )
}

// ─── Coupon form ──────────────────────────────────────────────────────────────

interface CouponFormProps {
  initial?: Coupon | null
  onSubmit: (data: CouponFormInput) => void
  onCancel: () => void
  isPending: boolean
}

function CouponForm({ initial, onSubmit, onCancel, isPending }: CouponFormProps) {
  const [form, setForm] = useState<CouponFormInput>({
    code: initial?.code ?? '',
    discountType: initial?.discountType ?? 'percent',
    discountValue: initial?.discountValue ?? 10,
    maxUses: initial?.maxUses ?? 100,
    expiresAt: initial?.expiresAt
      ? new Date(initial.expiresAt).toISOString().slice(0, 10)
      : '',
    isActive: initial?.isActive ?? true,
  })

  function set<K extends keyof CouponFormInput>(key: K, value: CouponFormInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  const labelClass = 'block text-label-sm font-medium text-[var(--color-on-surface)] mb-1'
  const inputClass =
    'w-full bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-lg px-3 py-2 text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(form) }}
      className="space-y-4"
    >
      <div>
        <label className={labelClass}>Mã coupon *</label>
        <input
          id="coupon-code"
          type="text"
          required
          minLength={3}
          maxLength={20}
          value={form.code}
          onChange={(e) => set('code', e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          className={inputClass + ' font-mono uppercase'}
          placeholder="SUMMER2025"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Loại giảm giá *</label>
          <select
            id="coupon-discount-type"
            value={form.discountType}
            onChange={(e) => set('discountType', e.target.value as 'percent' | 'fixed')}
            className={inputClass}
          >
            <option value="percent">Phần trăm (%)</option>
            <option value="fixed">Cố định (VNĐ)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>
            Giá trị {form.discountType === 'percent' ? '(%)' : '(VNĐ)'} *
          </label>
          <input
            id="coupon-discount-value"
            type="number"
            required
            min={1}
            max={form.discountType === 'percent' ? 100 : undefined}
            value={form.discountValue}
            onChange={(e) => {
              if (e.target.value === '') {
                set('discountValue', '')
                return
              }
              let val = Number(e.target.value)
              if (val < 0) val = 0
              if (form.discountType === 'percent' && val > 100) val = 100
              set('discountValue', val)
            }}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Giới hạn sử dụng *</label>
          <input
            id="coupon-usage-limit"
            type="number"
            required
            min={1}
            value={form.maxUses}
            onChange={(e) => set('maxUses', e.target.value === '' ? '' : Number(e.target.value))}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Ngày hết hạn *</label>
          <input
            id="coupon-expiry-date"
            type="date"
            required
            value={form.expiresAt}
            onChange={(e) => set('expiresAt', e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
            className={inputClass + ' cursor-pointer'}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="coupon-is-active"
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => set('isActive', e.target.checked)}
          className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
        />
        <label htmlFor="coupon-is-active" className="text-sm text-[var(--color-on-surface)]">
          Kích hoạt coupon
        </label>
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

export default function AdminCouponsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selected, setSelected] = useState<Coupon | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons', page],
    queryFn: () => getAdminCoupons({ page, limit: 10 }),
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
    mutationFn: createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      toast.success('Tạo coupon thành công')
      setIsModalOpen(false)
    },
    onError: handleError,
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CouponFormInput> }) =>
      updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      toast.success('Cập nhật coupon thành công')
      setIsModalOpen(false)
    },
    onError: handleError,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })
      toast.success('Xóa coupon thành công')
      setDeleteTarget(null)
    },
    onError: handleError,
  })

  const handleSubmit = (formData: CouponFormInput) => {
    const payload = {
      ...formData,
      discountValue: Number(formData.discountValue),
      maxUses: Number(formData.maxUses),
      expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
    } as any

    if (selected) {
      updateMutation.mutate({ id: selected._id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const columns: ColumnDef<Coupon>[] = [
    {
      header: 'Mã coupon',
      accessorKey: 'code',
      cell: (c: Coupon) => (
        <span className="font-mono font-semibold text-[var(--color-primary)] tracking-wide">
          {c.code}
        </span>
      ),
    },
    {
      header: 'Loại & Giá trị',
      cell: (c: Coupon) => (
        <span className="text-sm text-[var(--color-on-surface)]">
          {c.discountType === 'percent'
            ? `${c.discountValue}%`
            : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.discountValue)}
        </span>
      ),
    },
    {
      header: 'Lượt dùng',
      cell: (c: Coupon) => (
        <div className="flex items-center gap-1 text-sm">
          <span className="text-[var(--color-on-surface)]">{c.usedCount}</span>
          <span className="text-[var(--color-on-surface-variant)]">/ {c.maxUses}</span>
        </div>
      ),
    },
    {
      header: 'Hết hạn',
      cell: (c: Coupon) => (
        <span className="text-sm text-[var(--color-on-surface-variant)]">
          {new Date(c.expiresAt).toLocaleDateString('vi-VN')}
        </span>
      ),
    },
    {
      header: 'Trạng thái',
      cell: (c: Coupon) => <CouponStatusBadge coupon={c} />,
    },
    {
      header: 'Thao tác',
      accessorKey: '_id',
      cell: (c: Coupon) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setSelected(c); setIsModalOpen(true) }}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
            title="Sửa"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteTarget(c)}
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
            <Ticket size={26} className="text-[var(--color-primary)]" />
            Quản lý Coupon
          </h1>
          <p className="text-body-md text-[var(--color-on-surface-variant)] mt-1">
            Tạo và quản lý các mã giảm giá cho học viên.
          </p>
        </div>
        <button
          onClick={() => { setSelected(null); setIsModalOpen(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Tạo coupon
        </button>
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
        title={selected ? 'Chỉnh sửa Coupon' : 'Tạo Coupon mới'}
        maxWidth="max-w-lg"
      >
        <CouponForm
          initial={selected}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
          isPending={createMutation.isPending || updateMutation.isPending}
        />
      </Modal>

      {/* Confirm delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa Coupon"
        message={`Bạn có chắc muốn xóa coupon "${deleteTarget?.code}"? Hành động này không thể hoàn tác.`}
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
