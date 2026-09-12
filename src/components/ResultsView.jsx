import { Fragment, useMemo, useState } from 'react'
import StoreCard from './StoreCard.jsx'
import SkeletonCard from './SkeletonCard.jsx'
import FilterBar from './FilterBar.jsx'
import AdSlot from './AdSlot.jsx'
import SearchPanel from './SearchPanel.jsx'
import { ArrowLeftIcon, SparkIcon, AlertIcon, RefreshIcon, TagIcon } from './Icons.jsx'
import { getCountry } from '../lib/locations.js'
import { formatPrice, storeId } from '../lib/format.js'

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
    <div
      className="rounded-xl px-4 py-3 ring-1 ring-inset"
      style={{ background: 'var(--surface-raised)', borderColor: 'var(--hairline)' }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-tertiary)]">
        {label}
      </p>
      <p className={`tabular mt-1 text-xl font-bold tracking-tight ${accent ? 'text-brand-500' : ''}`}>
        {value}
      </p>
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

  const stores = result?.stores || []
  const countryCode = result?.query.countryCode || searchProps.countryCode
  const country = getCountry(countryCode)

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back + compact re-search */}
      <button
        onClick={onBack}
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-brand-600"
      >
        <ArrowLeftIcon size={16} /> New search
      </button>

      <SearchPanel {...searchProps} compact />

      {/* Query heading */}
      <div className="mt-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">
          {loading ? 'Searching' : `${counts.all} store${counts.all === 1 ? '' : 's'}`} for{' '}
          <span className="text-brand-500">{searchProps.product || result?.query.product}</span>
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
          <span aria-hidden="true">{country.flag}</span>
          {result?.query.area || searchProps.area}, {country.name}
        </p>
      </div>

      {/* Degradation notice — demo data, rate limit, timeout, etc. */}
      {notice && !loading && (
        <div
          className="mt-5 flex items-start gap-3 rounded-xl px-4 py-3 ring-1 ring-inset ring-amber-500/25"
          style={{ background: 'rgba(245,158,11,0.08)' }}
          role="status"
        >
          <AlertIcon size={17} className="mt-0.5 shrink-0 text-amber-500" />
          <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">{notice}</p>
          <button
            onClick={onRetry}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-brand-600"
          >
            <RefreshIcon size={14} /> Retry
          </button>
        </div>
      )}

      {/* Live region so screen readers hear progress and completion. */}
      <p className="sr-only" role="status" aria-live="polite">
        {loading ? LOADING_STEPS[loadingStep] : `${counts.all} results loaded.`}
      </p>

      {loading ? (
        <>
          <div
            className="mt-6 flex items-center gap-3 rounded-xl px-4 py-3.5 ring-1 ring-inset ring-brand-500/20"
            style={{ background: 'rgba(16,185,129,0.07)' }}
          >
            <SparkIcon size={18} className="shrink-0 animate-pulse text-brand-500" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {LOADING_STEPS[loadingStep]}
            </span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} index={i} />)}
          </div>
        </>
      ) : (
        <>
          {/* AI summary + at-a-glance stats */}
          {result?.summary && (
            <div
              className="mt-6 rounded-2xl p-5 ring-1 ring-inset ring-brand-500/15"
              style={{ background: 'rgba(16,185,129,0.06)' }}
            >
              <h2 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-brand-600 dark:text-brand-400">
                <SparkIcon size={14} /> AI summary
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--text-primary)]">
                {result.summary}
              </p>
              {result.tip && (
                <p className="mt-3 flex items-start gap-2 border-t pt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]" style={{ borderColor: 'var(--hairline)' }}>
                  <TagIcon size={14} className="mt-0.5 shrink-0 text-brand-500" />
                  {result.tip}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Available" value={`${counts.in_stock + counts.low_stock}/${counts.all}`} />
            <Stat label="Best price" value={bestPrice === null ? '—' : formatPrice(bestPrice, countryCode)} accent />
            <Stat label="In stock" value={counts.in_stock} />
            <Stat label="Low stock" value={counts.low_stock} />
          </div>

          <div className="mt-6">
            <AdSlot variant="leaderboard" />
          </div>

          <div className="mt-7">
            <FilterBar filter={filter} setFilter={setFilter} sort={sort} setSort={setSort} counts={counts} />
          </div>

          {visible.length === 0 ? (
            <div className="mt-10 rounded-2xl px-6 py-16 text-center ring-1 ring-inset" style={{ borderColor: 'var(--hairline)', background: 'var(--surface-raised)' }}>
              <p className="text-base font-semibold">Nothing matches this filter</p>
              <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                Try another availability filter, or search a nearby district.
              </p>
              <button
                onClick={() => setFilter('all')}
                className="mt-5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-brand-400"
              >
                Show all stores
              </button>
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                  {i === 2 && visible.length > 4 && <AdSlot variant="inline" className="sm:col-span-2 xl:col-span-1" />}
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
