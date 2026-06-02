import { useState, useEffect } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  debounceTime?: number
}

export const SearchBar = ({ value, onChange, placeholder = 'Search...', debounceTime = 200 }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceTime)

    return () => clearTimeout(handler)
  }, [localValue, onChange, value, debounceTime])

  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <MagnifyingGlassIcon className="h-5 w-5 text-[var(--color-on-surface-variant)]" aria-hidden="true" />
      </div>
      <input
        type="text"
        className="block w-full rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-2.5 pl-10 pr-3 text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] focus:outline-2 focus:outline-[var(--color-primary)] focus:border-transparent transition-all sm:text-sm sm:leading-6"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  )
}
