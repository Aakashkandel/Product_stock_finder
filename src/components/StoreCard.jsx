import { useState } from 'react'
import StockBadge from './StockBadge.jsx'
import { RouteIcon, ClockIcon, PinIcon, CopyIcon, CheckIcon, HeartIcon, PhoneIcon } from './Icons.jsx'
import { formatPrice, formatDistance, getOpenState, storeId } from '../lib/format.js'
import { directionsUrl, copyText } from '../lib/maps.js'

/**
 * One retailer result.
 *
 * Ranks information the way a shopper actually reads it: is it there, what
 * does it cost, how far, is it open, and how do I get there.
 */
export default function StoreCard({ store, countryCode, area, countryName, index, isBest, isSaved, onToggleSave, onToast }) {
  const [copied, setCopied] = useState(false)

  const openState = getOpenState(store.hours)
  const distance = formatDistance(store.distanceKm, countryCode)
  const id = storeId(store)
  const unavailable = store.status === 'out_of_stock'

  const handleCopy = async () => {
    const ok = await copyText(store.address)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } else {
      onToast({ type: 'error', message: 'Could not copy the address.' })
    }
  }

  return (
    <article
      className={`surface group relative flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 ${unavailable ? 'opacity-[0.72]' : ''}`}
      style={{
        animation: `rise 0.5s var(--ease-out-expo) ${Math.min(index, 8) * 0.06}s both`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lift)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-card)')}
    >
      {/* "Best price" is the single most decision-useful flag, so it gets the ribbon. */}
      {isBest && (
        <span className="absolute -top-2.5 left-5 rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-950 shadow-md shadow-brand-500/30">
          Best price
        </span>
      )}

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[17px] font-bold leading-tight tracking-tight">{store.name}</h3>
          {store.branch && (
            <p className="mt-0.5 truncate text-[13px] text-[var(--text-tertiary)]">{store.branch}</p>
          )}
        </div>

        <button
          onClick={() => onToggleSave(id)}
          aria-label={isSaved ? `Remove ${store.name} from saved` : `Save ${store.name}`}
          aria-pressed={isSaved}
          className={`-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 transition-colors ${
            isSaved ? 'text-rose-500' : 'text-[var(--text-tertiary)] hover:text-rose-400'
          }`}
        >
          <HeartIcon size={18} filled={isSaved} />
        </button>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StockBadge status={store.status} pulse />
        {store.quantityHint && (
          <span className="text-xs font-medium text-[var(--text-tertiary)]">{store.quantityHint}</span>
        )}
      </div>

      {/* Price + distance */}
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <span className="tabular text-[26px] font-bold leading-none tracking-tight">
            {formatPrice(store.price, countryCode)}
          </span>
          {store.price !== null && (
            <span className="ml-1.5 text-xs text-[var(--text-tertiary)]">est.</span>
          )}
        </div>
        {distance && (
          <span className="tabular flex items-center gap-1 text-[13px] font-medium text-[var(--text-secondary)]">
            <PinIcon size={14} /> {distance}
          </span>
        )}
      </div>

      {/* Address */}
      <button
        onClick={handleCopy}
        title="Copy address"
        className="mt-4 flex w-full items-start gap-2 rounded-lg text-left text-[13px] leading-relaxed text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <span className="mt-0.5 shrink-0 text-[var(--text-tertiary)]">
          {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
        </span>
        <span className="line-clamp-2">{copied ? 'Address copied' : store.address}</span>
      </button>

      {/* Hours with a live open/closed read */}
      {store.hours && (
        <div className="mt-2.5 flex items-center gap-2 text-[13px] text-[var(--text-secondary)]">
          <ClockIcon size={14} className="shrink-0 text-[var(--text-tertiary)]" />
          <span>{store.hours}</span>
          {openState && (
            <span
              className={`ml-auto shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${
                openState.open
                  ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300'
                  : 'bg-ink-500/12 text-[var(--text-tertiary)]'
              }`}
            >
              {openState.label}
            </span>
          )}
        </div>
      )}

      {store.note && (
        <p className="mt-3 border-t pt-3 text-[12.5px] leading-relaxed text-[var(--text-tertiary)]" style={{ borderColor: 'var(--hairline)' }}>
          {store.note}
        </p>
      )}

      {/* Confidence — these are estimates, so say how sure the model is. */}
      {store.confidence !== null && store.confidence !== undefined && (
        <div className="mt-3.5">
          <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-[var(--text-tertiary)]">
            <span>AI confidence</span>
            <span className="tabular">{store.confidence}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-sunken)' }}>
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-[width] duration-700"
              style={{ width: `${store.confidence}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions pinned to the card foot so every card ends on the same line. */}
      <div className="mt-auto flex gap-2 pt-5">
        <a
          href={directionsUrl(store, area, countryName)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-[13px] font-bold text-ink-950 shadow-md shadow-brand-500/20 transition-all hover:bg-brand-400 active:scale-[0.98]"
        >
          <RouteIcon size={15} /> Get Directions
        </a>
        {store.phone && (
          <a
            href={`tel:${store.phone.replace(/\s+/g, '')}`}
            aria-label={`Call ${store.name}`}
            className="grid h-auto w-11 place-items-center rounded-xl text-[var(--text-secondary)] ring-1 ring-inset transition-colors hover:text-brand-600"
            style={{ background: 'var(--surface-sunken)', borderColor: 'var(--hairline)' }}
          >
            <PhoneIcon size={16} />
          </a>
        )}
      </div>
    </article>
  )
}
