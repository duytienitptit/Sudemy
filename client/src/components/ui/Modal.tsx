import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={onClose} />
      <div className={`relative bg-surface rounded-lg shadow-xl w-full ${maxWidth} max-h-[90vh] flex flex-col z-10`}>
        <div className="flex items-center justify-between p-4 border-b border-surface-variant">
          <h3 className="text-lg font-semibold text-on-surface">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-surface-variant rounded-full transition-colors text-on-surface-variant">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
