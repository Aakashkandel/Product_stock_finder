import { Fragment, useMemo, useState } from 'react'
import StoreCard from './StoreCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'
import FilterBar from './FilterBar.jsx'
import AdSlot from './AdSlot.jsx'
import SearchPanel from './SearchPanel.jsx'
import { ArrowLeftIcon, AlertIcon, RefreshIcon, CopyIcon, CheckIcon } from './Icons.jsx'
import { getCountry } from '../lib/locations.js'
import { formatPrice, storeId } from '../lib/format.js'
import { shareUrlFor } from '../lib/url.js'
import { copyText } from '../lib/maps.js'

/** Status lines cycled through while the model is thinking. */
const LOADING_STEPS = [
  'Reading your query…',
  'Mapping retailers in the area…',
  'Estimating shelf availability…',
  'Comparing prices…',
]

const STATUS_RANK = { in_stock: 0, low_stock: 1, unknown: 2, out_of_stock: 3 }

function Stat({ label, value, accent }) {
  return (
    <div className="flex-1 px-4 py-3 first:pl-0">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-3)]">
        {label}
      </p>
      <p
        className="tabular mt-1 font-display text-[22px] leading-none"
        style={accent ? { color: 'var(--accent)' } : undefined}
      >
        {value}
      </p>
    </div>
  )
}

/**
 * Shown in place of results whenever there is no real data to display — no
 * key configured, a rejected request, a timeout, or a reply the parser
 * couldn't read. Nothing here is invented: the message states plainly what
 * went wrong, and the only action offered is to try the real lookup again.
 */
function ErrorState({ message, onRetry }) {
  return (
    <div className="card mt-8 flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span
        className="grid h-11 w-11 place-items-center rounded-full"
        style={{ background: 'var(--sunken)', color: 'var(--stock-low)' }}
      >
        <AlertIcon size={20} />
      </span>
      <div>
        <p className="font-display text-[19px] font-bold tracking-tight">Couldn't get real results</p>
        <p className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-[var(--text-2)]">
          {message}
        </p>
      </div>
      <button onClick={onRetry} className="btn-primary mt-2 inline-flex items-center gap-2 px-6 py-3 text-sm">
        <RefreshIcon size={15} /> Try again
      </button>
    </div>
  )
}

export default function ResultsView({
  result,
  loading,
  loadingStep,
  notice,
  onBack,
  onRetry,
  searchProps,
  saved,
  onToggleSave,
  onToast,
}) {
  const [filter, setFilter] = useState('all')
  const [sort, setSort] = useState('relevance')
  const [shared, setShared] = useState(false)

  const stores = result?.stores || []
  const countryCode = result?.query.countryCode || searchProps.countryCode
  const country = getCountry(countryCode)
  const failed = !loading && !result

  const counts = useMemo(
    () => ({
      all: stores.length,
      in_stock: stores.filter((s) => s.status === 'in_stock').length,
      low_stock: stores.filter((s) => s.status === 'low_stock').length,
      out_of_stock: stores.filter((s) => s.status === 'out_of_stock').length,
    }),
    [stores]
  )

  /** Cheapest store that is actually purchasable — drives the "Best price" ribbon. */
  const bestId = useMemo(() => {
    const buyable = stores.filter((s) => s.status !== 'out_of_stock' && typeof s.price === 'number')
    if (!buyable.length) return null
    return storeId(buyable.reduce((a, b) => (a.price <= b.price ? a : b)))
  }, [stores])

  const visible = useMemo(() => {
    const list = filter === 'all' ? [...stores] : stores.filter((s) => s.status === filter)

    // `undefined` prices must sink to the bottom rather than sort as zero.
    const byPrice = (dir) => (a, b) => {
      if (typeof a.price !== 'number') return 1
      if (typeof b.price !== 'number') return -1
      return dir * (a.price - b.price)
    }

    switch (sort) {
      case 'price-asc':
        return list.sort(byPrice(1))
      case 'price-desc':
        return list.sort(byPrice(-1))
      case 'distance':
        return list.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity))
      case 'availability':
        return list.sort((a, b) => (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9))
      default:
        return list
    }
  }, [stores, filter, sort])

  const bestPrice = useMemo(() => {
    const buyable = stores.filter((s) => s.status !== 'out_of_stock' && typeof s.price === 'number')
    return buyable.length ? Math.min(...buyable.map((s) => s.price)) : null
  }, [stores])

  return (
    <div className="above-grain mx-auto max-w-6xl px-5 py-8 sm:px-6">
      {/* Back + share + compact re-search */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
        >
          <ArrowLeftIcon size={16} /> New search
        </button>

        {result && (
          <button
            onClick={async () => {
              const url = shareUrlFor(result.query)
              // Use the native share sheet where it exists, else copy the link.
              if (navigator.share) {
                try {
                  await navigator.share({ title: `Stock for ${result.query.product}`, url })
                  return
                } catch {
                  /* user dismissed the sheet, or it is unavailable — fall through */
                }
              }
              const ok = await copyText(url)
              if (ok) {
                setShared(true)
                setTimeout(() => setShared(false), 2000)
              } else {
                onToast({ type: 'error', message: 'Could not copy the link.' })
              }
            }}
            className="inline-flex items-center gap-1.5 text-[13px] text-[var(--text-2)] underline underline-offset-4 transition-colors hover:text-[var(--text)]"
          >
            {shared ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            {shared ? 'Link copied' : 'Share'}
          </button>
        )}
      </div>

      <SearchPanel {...searchProps} compact />

      {/* Query heading */}
      <div className="mt-8">
        <h1 className="font-display text-[26px] leading-tight tracking-tight sm:text-[32px]">
          {loading ? 'Searching for ' : failed ? "Couldn't search for " : `${counts.all} shop${counts.all === 1 ? '' : 's'} for `}
          <span style={{ color: 'var(--accent)' }}>
            {searchProps.product || result?.query.product}
          </span>
        </h1>
        <p className="mt-2 text-[14px] text-[var(--text-2)]">
          {result?.query.area || searchProps.area} · {country.name}
        </p>
      </div>

      {/* Live region so screen readers hear progress and completion. */}
      <p className="sr-only" role="status" aria-live="polite">
        {loading ? LOADING_STEPS[loadingStep] : failed ? 'Search failed.' : `${counts.all} results loaded.`}
      </p>

      {loading ? (
        <>
          <div className="mt-6 flex items-center gap-2.5 text-sm text-[var(--text-2)]">
            <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-50" />
            {LOADING_STEPS[loadingStep]}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} index={i} />)}
          </div>
        </>
      ) : failed ? (
        <ErrorState message={notice} onRetry={onRetry} />
      ) : (
        <>
          {/* AI summary + at-a-glance stats */}
          {result?.summary && (
            <div className="card relative mt-7 overflow-hidden p-5 pl-6">
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ background: 'var(--accent)' }} />
              <p className="text-[15.5px] leading-[1.6] text-[var(--text)]">
                {result.summary}
              </p>
              {result.tip && (
                <p className="mt-3 border-t pt-3 text-[13.5px] leading-relaxed text-[var(--text-2)]" style={{ borderColor: 'var(--hairline)' }}>
                  {result.tip}
                </p>
              )}
            </div>
          )}

          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Available" value={`${counts.in_stock + counts.low_stock}/${counts.all}`} />
            <Stat label="Cheapest" value={bestPrice === null ? '—' : formatPrice(bestPrice, countryCode)} accent />
            <Stat label="In stock" value={counts.in_stock} />
            <Stat label="Low stock" value={counts.low_stock} />
          </div>

          <div className="mt-6">
            <AdSlot variant="leaderboard" />
          </div>

          <div className="mt-8">
            <FilterBar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} counts={counts} />
          </div>

          {visible.length === 0 ? (
            <div className="mt-12 py-16 text-center">
              <p className="font-display text-[22px] font-bold tracking-tight">Nothing matches this filter</p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-2)]">
                Try another availability filter, or search a nearby district.
              </p>
              <button
                onClick={() => setFilter('all')}
                className="btn-primary mt-6 px-6 py-3 text-sm"
              >
                Show all shops
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((store, i) => (
                <Fragment key={`${storeId(store)}-${i}`}>
                  <StoreCard
                    store={store}
                    index={i}
                    countryCode={countryCode}
                    countryName={country.name}
                    area={result?.query.area || searchProps.area}
                    isBest={storeId(store) === bestId && filter === 'all' && sort === 'relevance'}
                    isSaved={saved.includes(storeId(store))}
                    onToggleSave={onToggleSave}
                    onToast={onToast}
                  />
                  {/* Native ad woven into the feed, never above the first result. */}
                  {i === 2 && visible.length > 4 && <AdSlot variant="inline" className="sm:col-span-2 lg:col-span-1" />}
                </Fragment>
              ))}
            </div>
          )}

          <div className="mt-10">
            <AdSlot variant="leaderboard" />
          </div>
        </>
      )}
    </div>
  )
}
