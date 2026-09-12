import { useEffect, useMemo, useRef, useState } from 'react'
import { PinIcon, ChevronIcon } from './Icons.jsx'

/**
 * Editable combobox for the shopping area.
 *
 * Filters the country's popular districts as you type but still accepts any
 * free-text area, so users outside the curated list are never blocked.
 * Implements the ARIA combobox pattern with full keyboard support.
 */
export default function AreaCombobox({ value, onChange, areas, id = 'area' }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef(null)
  const listRef = useRef(null)

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase()
    if (!q) return areas
    const matches = areas.filter((a) => a.toLowerCase().includes(q))
    return matches.length ? matches : []
  }, [value, areas])

  // Close when focus or a click leaves the component.
  useEffect(() => {
    const onDocDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [])

  // Keep the highlighted option scrolled into view.
  useEffect(() => {
    if (!open || !listRef.current) return
    listRef.current.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active, open])

  const commit = (area) => {
    onChange(area)
    setOpen(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) {
        setOpen(true)
        setActive(0)
        return
      }
      if (!filtered.length) return
      const delta = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + delta + filtered.length) % filtered.length)
    } else if (e.key === 'Enter') {
      if (open && filtered[active]) {
        e.preventDefault()
        commit(filtered[active])
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
        <PinIcon size={18} />
      </span>

      <input
        id={id}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-autocomplete="list"
        aria-activedescendant={open && filtered[active] ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        value={value}
        placeholder="Area or district"
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-xl border bg-transparent py-3.5 pl-11 pr-9 text-[15px] outline-none transition-shadow placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-brand-500/40"
        style={{ background: 'var(--surface-sunken)', borderColor: 'var(--hairline)' }}
      />

      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? 'Hide area suggestions' : 'Show area suggestions'}
        onClick={() => setOpen((o) => !o)}
        className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-tertiary)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      >
        <ChevronIcon size={16} />
      </button>

      {open && (
        <ul
          id={`${id}-listbox`}
          ref={listRef}
          role="listbox"
          aria-label="Popular areas"
          className="scroll-slim absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-xl border p-1.5 shadow-xl animate-[fade_0.15s_ease-out_both]"
          style={{
            background: 'var(--surface-raised)',
            borderColor: 'var(--hairline)',
            boxShadow: 'var(--shadow-lift)',
          }}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-[var(--text-tertiary)]">
              No match — press Find Stock to search "{value}" anyway.
            </li>
          ) : (
            filtered.map((area, i) => (
              <li
                key={area}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={area === value}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(area)}
                className={`cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  i === active ? 'bg-brand-500/12 text-brand-700 dark:text-brand-300' : 'text-[var(--text-secondary)]'
                }`}
              >
                {area}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
