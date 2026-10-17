import { useEffect, useMemo, useRef, useState } from 'react'

type Option = {
  value: string
  label: string
}

type Props = {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  allowCustom?: boolean
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = 'Search...',
  emptyMessage = 'No matches',
  disabled = false,
  allowCustom = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return options
    }

    return options.filter(option => option.label.toLowerCase().includes(query))
  }, [options, search])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  // Sync search with current value when opening
  useEffect(() => {
    if (open) {
      const current = options.find(o => o.value === value)
      setSearch(current?.label ?? '')
    }
  }, [open, value, options])

  function handleSelect(option: Option) {
    onChange(option.value)
    setSearch(option.label)
    setOpen(false)
  }

  function handleInputChange(newValue: string) {
    setSearch(newValue)
    setOpen(true)

    if (allowCustom) {
      onChange(newValue)
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      setOpen(false)
    } else if (event.key === 'Enter' && filtered.length > 0) {
      event.preventDefault()
      handleSelect(filtered[0])
    }
  }

  const displayLabel = options.find(o => o.value === value)?.label ?? value

  return (
    <div ref={containerRef} className='relative'>
      <input
        type='text'
        className='field-input pr-8'
        value={open ? search : displayLabel}
        onChange={e => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />

      <button
        type='button'
        onClick={() => setOpen(prev => !prev)}
        disabled={disabled}
        className='absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-boost-400'
        aria-label='Toggle dropdown'
      >
        <svg
          width='16'
          height='16'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
        >
          <polyline points='6 9 12 15 18 9' />
        </svg>
      </button>

      {open ? (
        <ul
          ref={listRef}
          className='absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-carbon-700 bg-carbon-900 shadow-xl'
        >
          {filtered.length === 0 ? (
            <li className='px-4 py-3 text-sm italic text-slate-500'>
              {emptyMessage}
            </li>
          ) : (
            filtered.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option)}
                className={`cursor-pointer px-4 py-2.5 text-sm transition ${
                  option.value === value
                    ? 'bg-boost-500/10 text-boost-300'
                    : 'text-slate-200 hover:bg-carbon-800'
                }`}
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  )
}
