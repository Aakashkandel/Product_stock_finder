import { useState } from 'react'
import StockBadge, { stockColor } from './StockBadge.jsx'
import { RouteIcon, CopyIcon, CheckIcon, HeartIcon, PhoneIcon, PinIcon, ClockIcon } from './Icons.jsx'
import { formatPrice, formatDistance, getOpenState, storeId } from '../lib/format.js'
import { directionsUrl, copyText } from '../lib/maps.js'

/**
 * One retailer.
 *
 * A stock-coloured spine down the left edge makes availability scannable
 * across a whole grid before you read a single word.
 */
export default function StoreCard({ store, countryCode, area, countryName, index, isBest, isSaved, onToggleSave, onToast }) {
  const [copied, setCopied] = useState(false)

  const openState = getOpenState(store.hours)
  const distance = formatDistance(store.distanceKm, countryCode)
  const id = storeId(store)
  const unavailable = store.status === 'out_of_stock'
  const spine = stockColor(store.status)

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
      className={`card group relative flex flex-col overflow-hidden p-5 pl-6 transition-all duration-300 hover:-translate-y-1 ${unavailable ? 'opacity-80' : ''}`}
      style={{ animation: `rise 0.5s var(--ease-out-expo) ${Math.min(index, 8) * 0.05}s both` }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-lg)')}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = 'var(--shadow-md)')}
    >
      {/* Availability spine */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ background: spine }} />

      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-[18px] font-bold leading-tight tracking-[-0.02em]">
            {store.name}
          </h3>
          {store.branch && (
            <p className="mt-0.5 truncate text-[13px] text-[var(--text-3)]">{store.branch}</p>
          )}
        </div>

        <button
          onClick={() => onToggleSave(id)}
          aria-label={isSaved ? `Remove ${store.name} from saved` : `Save ${store.name}`}
          aria-pressed={isSaved}
          className="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 transition-colors"
          style={{ color: isSaved ? 'var(--stock-out)' : 'var(--text-3)' }}
        >
          <HeartIcon size={17} filled={isSaved} />
        </button>
      </header>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <StockBadge status={store.status} />
        {store.quantityHint && (
          <span className="text-[12px] font-medium text-[var(--text-3)]">{store.quantityHint}</span>
        )}
      </div>

      {/* Price — the figure the eye should land on. */}
      <div className="mt-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <span className="tabular block font-display text-[30px] font-extrabold leading-none tracking-[-0.035em]">
            {formatPrice(store.price, countryCode)}
          </span>
          {isBest && (
            <span
              className="mt-2 inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em]"
              style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}
            >
              Cheapest here
            </span>
          )}
        </div>

        {distance && (
          <span className="tabular flex shrink-0 items-center gap-1 text-[13px] font-semibold text-[var(--text-2)]">
            <PinIcon size={14} /> {distance}
          </span>
        )}
      </div>

      {/* Practical detail */}
      <div className="mt-5 space-y-2 border-t pt-4 text-[13px]" style={{ borderColor: 'var(--hairline)' }}>
        <button
          onClick={handleCopy}
          title="Copy address"
          className="flex w-full items-start gap-2 text-left leading-snug text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
        >
          <span className="mt-0.5 shrink-0 text-[var(--text-3)]">
            {copied ? <CheckIcon size={13} /> : <CopyIcon size={13} />}
          </span>
          <span className="line-clamp-2">{copied ? 'Address copied' : store.address}</span>
        </button>

        {store.hours && (
          <div className="flex items-center gap-2 text-[var(--text-2)]">
            <ClockIcon size={13} className="shrink-0 text-[var(--text-3)]" />
            <span>{store.hours}</span>
            {openState && (
              <span
                className="ml-auto shrink-0 text-[12px] font-bold"
                style={{ color: openState.open ? 'var(--stock-in)' : 'var(--text-3)' }}
              >
                {openState.label}
              </span>
            )}
          </div>
        )}
      </div>

      {store.note && (
        <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--text-3)]">{store.note}</p>
      )}

      {/* Certainty as five ticks — faster to read than a percentage bar. */}
      {store.confidence !== null && store.confidence !== undefined && (
        <div className="mt-4 flex items-center gap-2">
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="h-1.5 w-5 rounded-full transition-colors"
                style={{ background: store.confidence > i * 20 ? 'var(--accent)' : 'var(--hairline)' }}
              />
            ))}
          </span>
          <span className="tabular text-[11px] font-semibold text-[var(--text-3)]">
            {store.confidence}% certain
          </span>
        </div>
      )}

      <div className="mt-auto flex gap-2 pt-5">
        <a
          href={directionsUrl(store, area, countryName)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-[13px]"
        >
          <RouteIcon size={14} /> Directions
        </a>
        {store.phone && (
          <a
            href={`tel:${store.phone.replace(/\s+/g, '')}`}
            aria-label={`Call ${store.name}`}
            className="btn-ghost grid w-11 place-items-center"
          >
            <PhoneIcon size={15} />
          </a>
        )}
      </div>
    </article>
  )
}
