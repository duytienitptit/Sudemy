import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, Image as ImageIcon, X, Link2, HardDriveUpload } from 'lucide-react'
import { twMerge } from 'tailwind-merge'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string) => void
  error?: string
  className?: string
}

type Mode = 'upload' | 'url'

export function ImageUploader({
  value,
  onChange,
  error,
  className,
}: ImageUploaderProps) {
  const [mode, setMode] = useState<Mode>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsUploading(true)

      const reader = new FileReader()
      reader.onload = () => {
        setTimeout(() => {
          setIsUploading(false)
          onChange(reader.result as string)
        }, 600)
      }
      reader.readAsDataURL(file)
    },
    [onChange]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  })

  const handleUrlApply = () => {
    const trimmed = urlInput.trim()
    if (!trimmed) {
      setUrlError('Vui lòng nhập URL ảnh')
      return
    }
    // Basic URL check
    try {
      new URL(trimmed)
    } catch {
      setUrlError('URL không hợp lệ. Ví dụ: https://example.com/image.jpg')
      return
    }
    setUrlError('')
    onChange(trimmed)
    setUrlInput('')
  }

  return (
    <div className={className}>
      {value ? (
        /* ── Preview ── */
        <div className="relative group rounded-xl overflow-hidden border border-[var(--color-surface-variant)] bg-[var(--color-surface-variant)]/20 aspect-video flex items-center justify-center">
          <img
            src={value}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onChange('')
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
              Xóa ảnh
            </button>
          </div>
        </div>
      ) : (
        /* ── Input area ── */
        <div className="space-y-3">
          {/* Mode switcher */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={twMerge(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                mode === 'upload'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-variant)]/40 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]/70'
              )}
            >
              <HardDriveUpload size={15} />
              Tải ảnh lên
            </button>
            <button
              type="button"
              onClick={() => { setMode('url'); setUrlError('') }}
              className={twMerge(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                mode === 'url'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-variant)]/40 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]/70'
              )}
            >
              <Link2 size={15} />
              Dán URL ảnh
            </button>
          </div>

          {mode === 'upload' ? (
            /* ── Drag & Drop zone ── */
            <div
              {...getRootProps()}
              className={twMerge(
                'border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors aspect-video',
                isDragActive
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]/10'
                  : error
                  ? 'border-[var(--color-error)] bg-[var(--color-error)]/5'
                  : 'border-[var(--color-surface-variant)] hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-variant)]/20'
              )}
            >
              <input {...getInputProps()} />

              {isUploading ? (
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
                  <p className="text-body-md text-[var(--color-on-surface-variant)]">
                    Đang xử lý ảnh...
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[var(--color-surface-variant)]/30 flex items-center justify-center mb-4 text-[var(--color-on-surface-variant)]">
                    {isDragActive ? <UploadCloud size={24} /> : <ImageIcon size={24} />}
                  </div>
                  <p className="text-body-md text-[var(--color-on-surface)] mb-1 font-medium">
                    {isDragActive ? 'Thả ảnh vào đây' : 'Kéo thả ảnh, hoặc click để chọn'}
                  </p>
                  <p className="text-label-sm text-[var(--color-on-surface-variant)]">
                    PNG, JPG, WEBP · Tối đa 5MB
                  </p>
                </>
              )}
            </div>
          ) : (
            /* ── URL input ── */
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value)
                    if (urlError) setUrlError('')
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleUrlApply())}
                  placeholder="https://example.com/image.jpg"
                  className={twMerge(
                    'flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-surface)] border text-[var(--color-on-surface)] focus:outline-none transition-colors text-sm',
                    urlError
                      ? 'border-[var(--color-error)] focus:border-[var(--color-error)]'
                      : 'border-[var(--color-surface-variant)] focus:border-[var(--color-primary)]'
                  )}
                />
                <button
                  type="button"
                  onClick={handleUrlApply}
                  className="px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-xl text-sm font-medium hover:bg-[var(--color-primary-hover)] transition-colors whitespace-nowrap"
                >
                  Áp dụng
                </button>
              </div>
              {urlError && (
                <p className="text-label-sm text-[var(--color-error)]">{urlError}</p>
              )}
              <p className="text-label-sm text-[var(--color-on-surface-variant)]">
                Nhập URL trực tiếp của ảnh (kết thúc bằng .jpg, .png, .webp, v.v.)
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-label-sm text-[var(--color-error)] mt-2">{error}</p>
      )}
    </div>
  )
}
