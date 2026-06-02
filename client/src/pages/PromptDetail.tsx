import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Helmet } from 'react-helmet-async'
import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import { getPromptBySlug } from '@/services/prompt.service'
import { CopyButton } from '@/components/prompts/CopyButton'

export const PromptDetail = () => {
  const { slug } = useParams<{ slug: string }>()

  const { data: prompt, isLoading, isError } = useQuery({
    queryKey: ['prompt', slug],
    queryFn: () => getPromptBySlug(slug as string),
    enabled: !!slug
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="h-10 w-32 bg-[var(--color-surface-container-highest)] rounded animate-pulse mb-8" />
          <div className="elevation-1 rounded-2xl p-8">
            <div className="h-10 w-3/4 bg-[var(--color-surface-container-highest)] rounded animate-pulse mb-4" />
            <div className="h-6 w-full bg-[var(--color-surface-container-highest)] rounded animate-pulse mb-8" />
            <div className="h-40 w-full bg-[var(--color-surface-container-highest)] rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !prompt) {
    return (
      <div className="min-h-screen bg-[var(--color-surface)] py-24 px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base font-semibold leading-8 text-[var(--color-primary)]">404</p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-on-surface)] sm:text-5xl">Prompt not found</h1>
          <p className="mt-4 text-base leading-7 text-[var(--color-on-surface-variant)]">Sorry, we couldn't find the prompt you're looking for.</p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              to="/prompts"
              className="rounded-md bg-[var(--color-primary)] px-3.5 py-2.5 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm hover:opacity-90"
            >
              Back to library
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface)] py-12">
      <Helmet>
        <title>{prompt.title} - Sudemy Prompts</title>
        <meta name="description" content={prompt.description} />
        <meta property="og:title" content={`${prompt.title} - Sudemy Prompts`} />
        <meta property="og:description" content={prompt.description} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link 
            to="/prompts" 
            className="inline-flex items-center text-sm font-medium text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors"
          >
            <ArrowLeftIcon className="mr-1 h-4 w-4" />
            Back to library
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="elevation-1 rounded-2xl overflow-hidden bg-[var(--color-surface)]">
          {/* Header Section */}
          <div className="p-8 border-b border-[var(--color-outline-variant)]">
            <div className="flex flex-wrap gap-2 mb-6">
              {prompt.tags.map((tag) => (
                <span
                  key={tag._id}
                  className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset"
                  style={{ 
                    backgroundColor: tag.color ? `${tag.color}15` : 'rgba(59, 130, 246, 0.1)', 
                    color: tag.color || '#3b82f6', 
                    borderColor: tag.color ? `${tag.color}30` : 'rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl font-bold text-[var(--color-on-surface)] mb-4">
              {prompt.title}
            </h1>
            
            <p className="text-lg text-[var(--color-on-surface-variant)]">
              {prompt.description}
            </p>
            
            <div className="relative group mt-8">
              <div className="absolute right-4 top-4 z-10">
                <CopyButton promptId={prompt._id} content={prompt.content} />
              </div>
              <pre className="bg-[var(--color-surface)] p-6 rounded-xl text-[var(--color-on-surface)] whitespace-pre-wrap font-mono text-sm leading-relaxed border border-[var(--color-outline-variant)]">
                {prompt.content}
              </pre>
            </div>
            
            <div className="mt-8 pt-8 border-t border-[var(--color-outline-variant)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-[var(--color-on-surface-variant)] flex items-center">
                <span className="font-medium text-[var(--color-on-surface)] mr-1">{prompt.copyCount}</span> 
                people have copied this prompt
              </div>
              
              {/* Optional CTA to a course */}
              <div className="bg-[var(--color-primary-container)] rounded-lg p-4 flex flex-col sm:flex-row items-center gap-4 border border-[var(--color-primary-container)]/50">
                <div className="text-sm text-[var(--color-on-primary-container)] font-medium">
                  Master AI prompt engineering in our comprehensive course.
                </div>
                <Link 
                  to="/courses"
                  className="whitespace-nowrap text-sm font-semibold text-[var(--color-primary)] hover:opacity-80"
                >
                  View Courses &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
