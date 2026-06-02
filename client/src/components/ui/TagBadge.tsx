import React from 'react'
import type { ITag } from '@/services/tag.service'
import { X } from 'lucide-react'

interface TagBadgeProps {
  tag: ITag
  onClick?: (tag: ITag) => void
  onRemove?: (tag: ITag) => void
  className?: string
}

export const TagBadge: React.FC<TagBadgeProps> = ({ tag, onClick, onRemove, className = '' }) => {
  const isTool = tag.type === 'tool'
  const defaultColors = isTool 
    ? 'bg-[var(--color-secondary-light)] text-[var(--color-secondary)] border-[var(--color-secondary-light)]' 
    : 'bg-[var(--color-tertiary-light)] text-[var(--color-tertiary)] border-[var(--color-tertiary-light)]'

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${defaultColors} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
      onClick={() => onClick?.(tag)}
    >
      {tag.name}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(tag)
          }}
          className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full hover:bg-black/20 focus:bg-black/20 focus:outline-none"
        >
          <span className="sr-only">Remove {tag.name}</span>
          <X size={12} />
        </button>
      )}
    </span>
  )
}
