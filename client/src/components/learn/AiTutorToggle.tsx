import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface AiTutorToggleProps {
  onClick: () => void
  isOpen: boolean
}

export default function AiTutorToggle({ onClick, isOpen }: AiTutorToggleProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 1 }}
      className="ai-tutor-fab"
      title={isOpen ? 'Đóng AI Tutor' : 'Mở AI Tutor'}
      aria-label={isOpen ? 'Đóng AI Tutor' : 'Mở AI Tutor'}
    >
      <Sparkles className="w-6 h-6 text-white" />

      {/* Pulse ring on first load */}
      {!isOpen && (
        <span className="ai-tutor-fab-pulse" aria-hidden="true" />
      )}

      {/* Label badge */}
      {!isOpen && (
        <span className="ai-tutor-fab-badge">AI</span>
      )}
    </motion.button>
  )
}
