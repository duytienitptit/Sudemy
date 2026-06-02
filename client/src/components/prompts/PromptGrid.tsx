import type { IPrompt } from '@/services/prompt.service'
import { PromptCard } from './PromptCard'

interface PromptGridProps {
  prompts: IPrompt[]
  isLoading: boolean
}

export const PromptGrid = ({ prompts, isLoading }: PromptGridProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl elevation-1 p-5 animate-pulse">
            <div className="h-4 w-20 bg-[var(--color-surface-container-highest)] rounded-full mb-3" />
            <div className="h-5 w-3/4 bg-[var(--color-surface-container-highest)] rounded mb-3" />
            <div className="h-4 w-full bg-[var(--color-surface-container-highest)] rounded mb-2" />
            <div className="h-4 w-5/6 bg-[var(--color-surface-container-highest)] rounded mb-4" />
            <div className="mt-auto pt-3 border-t border-[var(--color-outline-variant)] flex justify-between">
              <div className="h-4 w-16 bg-[var(--color-surface-container-highest)] rounded" />
              <div className="h-8 w-8 bg-[var(--color-surface-container-highest)] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-16 elevation-1 rounded-xl">
        <p className="text-[var(--color-on-surface-variant)]">Không tìm thấy prompt nào phù hợp.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {prompts.map((prompt) => (
        <PromptCard key={prompt._id} prompt={prompt} />
      ))}
    </div>
  )
}
