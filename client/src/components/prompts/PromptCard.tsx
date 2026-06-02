import { Video, Image } from 'lucide-react'
import type { IPrompt } from '@/services/prompt.service'
import { CopyButton } from './CopyButton'

interface PromptCardProps {
  prompt: IPrompt
}

const getFakeCopyCount = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 890 + 110;
}

export const PromptCard = ({ prompt }: PromptCardProps) => {
  const isVideo = prompt.type === 'video'

  return (
    <div className="flex flex-col overflow-hidden rounded-xl elevation-1 hover:elevation-2 transition-shadow">
      {/* Sample image for image prompts */}
      {prompt.type === 'image' && prompt.sampleImage && (
        <div className="aspect-video overflow-hidden bg-[var(--color-surface-container)]">
          <img
            src={prompt.sampleImage}
            alt={prompt.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Type badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isVideo
              ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
              : 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]'
          }`}>
            {isVideo ? <Video size={11} /> : <Image size={11} />}
            {isVideo ? 'Tạo Video' : 'Tạo Ảnh'}
          </span>
        </div>

        <h3 className="text-base font-bold text-[var(--color-on-surface)] mb-2 line-clamp-2">
          {prompt.title}
        </h3>

        <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-3 mb-4 flex-1">
          {prompt.content}
        </p>

        <div className="pt-3 border-t border-[var(--color-outline-variant)] flex items-center justify-between">
          <div className="text-xs text-[var(--color-on-surface-variant)]">
            {getFakeCopyCount(prompt._id)} lượt sao chép
          </div>
          <CopyButton promptId={prompt._id} content={prompt.content} iconOnly />
        </div>
      </div>
    </div>
  )
}
