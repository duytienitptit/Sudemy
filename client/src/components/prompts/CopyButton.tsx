import { useState } from 'react'
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'

interface CopyButtonProps {
  promptId: string
  content: string
  className?: string
  iconOnly?: boolean
}

export const CopyButton = ({ promptId, content, className = '', iconOnly = false }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      
      // Fake copy count so we don't need to call the API
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-all ${
        copied 
          ? 'bg-green-600 text-white hover:bg-green-500 focus-visible:outline-green-600'
          : 'bg-primary text-white hover:bg-primary-hover focus-visible:outline-primary'
      } ${className}`}
    >
      {copied ? (
        <CheckIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
      ) : (
        <DocumentDuplicateIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
      )}
      {!iconOnly && (copied ? 'Copied!' : 'Copy Prompt')}
    </button>
  )
}
