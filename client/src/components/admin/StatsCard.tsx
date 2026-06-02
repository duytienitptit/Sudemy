import type { ReactNode } from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="elevation-1 rounded-xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-label-lg text-[var(--color-on-surface-variant)]">{title}</h3>
        <div className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-lg">
          {icon}
        </div>
      </div>
      <div>
        <p className="text-headline-sm font-semibold text-[var(--color-on-surface)]">{value}</p>
        {trend && (
          <p className={`text-body-sm mt-2 flex items-center gap-1 ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% so với tháng trước</span>
          </p>
        )}
      </div>
    </div>
  )
}
