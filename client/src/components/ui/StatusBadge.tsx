import React from 'react'

export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusBadgeProps {
  status: string
  variant?: StatusVariant
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'default', className = '' }) => {
  const variants = {
    success: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/20',
    warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)] border-[var(--color-warning)]/20',
    error: 'bg-[var(--color-error)]/10 text-[var(--color-error)] border-[var(--color-error)]/20',
    info: 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)] border-[var(--color-secondary-light)]',
    default: 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] border-[var(--color-outline-variant)]',
  }

  const colors = variants[variant]

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors} ${className}`}>
      {status}
    </span>
  )
}
