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
    // `z-40` while open lifts the field (and its list) above the content that
    // follows it; without it the popular-product chips paint over the dropdown.
    <div ref={wrapRef} className={`field relative ${open ? 'z-40' : 'z-0'}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
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
        className="w-full bg-transparent py-3.5 pl-11 pr-9 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-[var(--text-3)]"
      />

      <button
        type="button"
        tabIndex={-1}
        aria-label={open ? 'Hide area suggestions' : 'Show area suggestions'}
        onClick={() => setOpen((o) => !o)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--text-3)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      >
        <ChevronIcon size={16} />
      </button>

      {open && (
        <ul
          id={`${id}-listbox`}
          ref={listRef}
          role="listbox"
          aria-label="Popular areas"
          className="scroll-slim absolute z-50 mt-2 max-h-64 w-full overflow-y-auto rounded-2xl border p-1.5 animate-[fade_0.14s_ease-out_both]"
          style={{
            background: 'var(--raised)',
            borderColor: 'var(--hairline)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2.5 text-sm text-[var(--text-3)]">
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
                className="cursor-pointer rounded-xl px-3 py-2.5 text-sm font-medium transition-colors"
                style={
                  i === active
                    ? { background: 'var(--accent)', color: 'var(--accent-ink)' }
                    : { color: 'var(--text-2)' }
                }
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
