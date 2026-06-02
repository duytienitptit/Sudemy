import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { Video, Image, Search } from 'lucide-react'
import { getPrompts } from '@/services/prompt.service'
import { Pagination } from '@/components/ui/Pagination'
import { PromptGrid } from '@/components/prompts/PromptGrid'

type PromptType = 'all' | 'video' | 'image'

export const PromptsList = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [activeType, setActiveType] = useState<PromptType>('all')

  const { data: promptsData, isLoading } = useQuery({
    queryKey: ['prompts', page, search, activeType],
    queryFn: () => getPrompts({
      page,
      limit: 12,
      search: search || undefined,
      type: activeType === 'all' ? undefined : activeType,
    }),
    placeholderData: (prev) => prev,
  })

  const handleTypeChange = (type: PromptType) => {
    setActiveType(type)
    setPage(1)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const tabs: { key: PromptType; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Tất cả', icon: null },
    { key: 'video', label: 'Prompt Tạo Video', icon: <Video size={16} /> },
    { key: 'image', label: 'Prompt Tạo Ảnh', icon: <Image size={16} /> },
  ]

  return (
    <div className="bg-[var(--color-background)] min-h-screen py-8">
      <Helmet>
        <title>Thư viện Prompt AI - Sudemy</title>
        <meta name="description" content="Kho prompt AI thực chiến cho tạo ảnh và video chuyên nghiệp." />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-on-surface)] sm:text-4xl">
            Thư viện Prompt AI
          </h1>
          <p className="mt-3 text-lg text-[var(--color-on-surface-variant)] max-w-2xl">
            Bộ sưu tập prompt thực chiến cho tạo ảnh và video chuyên nghiệp — sao chép và dùng ngay.
          </p>
        </div>

        {/* Search + Filter Row */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Type Tabs */}
          <div className="flex gap-2 p-1 bg-[var(--color-surface-container)] rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTypeChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeType === tab.key
                    ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-sm'
                    : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container-high)]'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Tìm kiếm prompt..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)] text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Grid */}
        <PromptGrid
          prompts={promptsData?.prompts || []}
          isLoading={isLoading}
        />

        {/* Pagination */}
        {promptsData?.pagination && promptsData.pagination.totalPages > 1 && (
          <Pagination
            pagination={promptsData.pagination}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}
