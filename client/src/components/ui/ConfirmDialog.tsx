import React from 'react'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
  isPending?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen, onClose, onConfirm, title, message,
  confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger', isPending = false
}) => {
  const confirmBtnClass = variant === 'danger' 
    ? 'bg-error text-on-error hover:bg-error/90' 
    : 'bg-primary text-on-primary hover:bg-primary/90'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="text-on-surface-variant mb-6">
        {message}
      </div>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 border border-surface-variant rounded-md hover:bg-surface-variant text-on-surface transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isPending}
          className={`px-4 py-2 rounded-md transition-colors disabled:opacity-50 ${confirmBtnClass}`}
        >
          {isPending ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
