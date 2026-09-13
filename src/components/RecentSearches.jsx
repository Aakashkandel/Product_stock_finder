import { getCountry } from '../lib/locations.js'
import { formatRelativeTime } from '../lib/format.js'
import { TrashIcon } from './Icons.jsx'

/** Re-runnable history of the last few searches, read from localStorage. */
export default function RecentSearches({ items, onPick, onClear }) {
  return (
    <section className="mt-10 animate-[fade_0.4s_ease-out_both]" aria-label="Recent searches">
      <div className="mb-2.5 flex items-center justify-between px-1">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-3)]">
          Recent
        </h2>
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs font-medium text-[var(--text-3)] transition-colors hover:text-rose-500"
        >
          <TrashIcon size={13} /> Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={`${item.product}-${item.area}-${item.at}`}
            onClick={() => onPick(item)}
            className="btn-ghost group flex items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-all hover:-translate-y-0.5"
          >
            <span aria-hidden="true" className="text-base leading-none">
              {getCountry(item.countryCode).flag}
            </span>
            <span className="flex flex-col leading-tight">
              <span className="text-[13px] font-semibold text-[var(--text)]">{item.product}</span>
              <span className="text-[11px] text-[var(--text-3)]">
                {item.area} · {formatRelativeTime(item.at)}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
