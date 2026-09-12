import { getCountry } from '../lib/locations.js'
import { formatRelativeTime } from '../lib/format.js'
import { ClockIcon, TrashIcon } from './Icons.jsx'

/** Re-runnable history of the last few searches, read from localStorage. */
export default function RecentSearches({ items, onPick, onClear }) {
  return (
    <section className="mt-8 animate-[fade_0.5s_ease-out_both]" aria-label="Recent searches">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-tertiary)]">
          <ClockIcon size={13} /> Recent
        </h2>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-medium text-[var(--text-tertiary)] transition-colors hover:text-rose-500"
        >
          <TrashIcon size={13} /> Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={`${item.product}-${item.area}-${item.at}`}
            onClick={() => onPick(item)}
            className="group flex items-center gap-2 rounded-xl px-3 py-2 text-left ring-1 ring-inset transition-all hover:-translate-y-0.5 hover:ring-brand-500/40"
            style={{ background: 'var(--surface-raised)', borderColor: 'var(--hairline)' }}
          >
            <span aria-hidden="true" className="text-base leading-none">
              {getCountry(item.countryCode).flag}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold">{item.product}</span>
              <span className="text-[11px] text-[var(--text-tertiary)]">
                {item.area} · {formatRelativeTime(item.at)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
