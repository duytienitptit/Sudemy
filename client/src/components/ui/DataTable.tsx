import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T | string
  cell?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  pagination?: {
    page: number
    totalPages: number
    onPageChange: (page: number) => void
  }
  onRowClick?: (item: T) => void
}

export function DataTable<T>({ data, columns, isLoading, pagination, onRowClick }: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-md border border-surface-variant">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-on-surface-variant uppercase bg-surface-variant/30 border-b border-surface-variant">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-4 py-3 font-medium">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-on-surface-variant">
                  Đang tải...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-on-surface-variant">
                  Không có dữ liệu.
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr 
                  key={rowIndex} 
                  onClick={() => onRowClick?.(item)}
                  className={`border-b border-surface-variant last:border-0 transition-colors ${onRowClick ? 'cursor-pointer hover:bg-surface-variant/20' : 'hover:bg-surface-variant/10'}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-on-surface">
                      {col.cell ? col.cell(item) : col.accessorKey ? String((item as any)[col.accessorKey]) : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-on-surface-variant">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1 rounded-md border border-surface-variant hover:bg-surface-variant disabled:opacity-50 text-on-surface transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1 rounded-md border border-surface-variant hover:bg-surface-variant disabled:opacity-50 text-on-surface transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
