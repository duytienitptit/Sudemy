import { useTheme } from '@/contexts/ThemeContext'
import { SunIcon, MoonIcon } from './Icons'

export function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      id="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
      className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-colors
        hover:bg-[var(--color-surface-container)] text-[var(--color-on-surface-variant)]
        hover:text-[var(--color-on-surface)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
    >
      <span
        className="transition-all duration-300"
        style={{ opacity: isDark ? 1 : 0, position: 'absolute', transform: isDark ? 'scale(1) rotate(0deg)' : 'scale(0.5) rotate(90deg)' }}
      >
        <MoonIcon size={18} />
      </span>
      <span
        className="transition-all duration-300"
        style={{ opacity: isDark ? 0 : 1, position: 'absolute', transform: isDark ? 'scale(0.5) rotate(-90deg)' : 'scale(1) rotate(0deg)' }}
      >
        <SunIcon size={18} />
      </span>
    </button>
  )
}
