import { ChevronIcon } from './Icons.jsx'

/** Availability filter and sort. */
export const SORTS = [
  { value: 'relevance', label: 'Best match' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'distance', label: 'Nearest first' },
  { value: 'availability', label: 'Most available' },
]

export default function FilterBar({ filter, setFilter, sort, setSort, counts }) {
  const chips = [
    { value: 'all', label: 'All', count: counts.all },
    { value: 'in_stock', label: 'In stock', count: counts.in_stock },
    { value: 'low_stock', label: 'Low stock', count: counts.low_stock },
    { value: 'out_of_stock', label: 'Out of stock', count: counts.out_of_stock },
  ].filter((c) => c.value === 'all' || c.count > 0)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="scroll-slim -mx-1 flex gap-2 overflow-x-auto px-1 py-1" role="group" aria-label="Filter by availability">
        {chips.map((chip) => {
          const active = filter === chip.value
          return (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              aria-pressed={active}
              className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-all ${active ? '' : 'btn-ghost'}`}
              style={active ? { background: 'var(--accent)', color: 'var(--accent-ink)' } : undefined}
            >
              {chip.label}
              <span className="tabular ml-1.5 opacity-60">{chip.count}</span>
            </button>
          )
        })}
      </div>

      <div className="field relative shrink-0">
        <label htmlFor="sort" className="sr-only">Sort results</label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full appearance-none bg-transparent py-2.5 pl-3.5 pr-9 text-[13px] font-medium outline-none sm:w-auto"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
          <ChevronIcon size={14} />
        </span>
      </div>
    </div>
  )
}
