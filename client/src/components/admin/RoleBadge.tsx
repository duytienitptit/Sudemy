interface RoleBadgeProps {
  role: 'user' | 'editor' | 'admin' | string
}

export function RoleBadge({ role }: RoleBadgeProps) {
  let colors = 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'
  let label = role

  switch (role) {
    case 'admin':
      colors = 'bg-[var(--color-error-container)] text-[var(--color-error)]'
      label = 'Admin'
      break
    case 'editor':
      colors = 'bg-[var(--color-secondary-container)] text-[var(--color-on-surface)]'
      label = 'Editor'
      break
    case 'user':
      colors = 'bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]'
      label = 'User'
      break
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {label}
    </span>
  )
}
