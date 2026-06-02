import { useRef, useEffect, useState } from 'react'

interface VideoPlayerProps {
  url: string
  onEnded?: () => void
}

/**
 * Extracts YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=XXXX
 * - https://youtu.be/XXXX
 * - https://www.youtube.com/embed/XXXX
 * - https://youtube.com/shorts/XXXX
 */
function getYouTubeId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*&v=([a-zA-Z0-9_-]{11})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export default function VideoPlayer({ url, onEnded }: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const id = getYouTubeId(url)
    if (id) {
      setVideoId(id)
      setError(false)
    } else {
      setError(true)
    }
  }, [url])

  // Listen for YouTube postMessage events to detect video end
  useEffect(() => {
    if (!onEnded) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        // YouTube IFrame API: event=onStateChange, info=0 means ended
        if (data?.event === 'onStateChange' && data?.info === 0) {
          onEnded()
        }
      } catch {
        // Ignore parse errors from other origins
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onEnded])

  if (error || !videoId) {
    return (
      <div className="relative pt-[56.25%] w-full bg-black rounded-lg overflow-hidden border border-[var(--color-outline-variant)]">
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">Không thể tải video</p>
        </div>
      </div>
    )
  }

  // Build embed URL with enablejsapi for postMessage events
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`

  return (
    <div className="relative pt-[56.25%] w-full bg-black rounded-lg overflow-hidden border border-[var(--color-outline-variant)]">
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="absolute top-0 left-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="Video bài học"
        loading="lazy"
      />
    </div>
  )
}
