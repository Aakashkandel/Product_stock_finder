import { useRef } from 'react'
import AreaCombobox from './AreaCombobox.jsx'
import { SearchIcon, ChevronIcon, SparkIcon } from './Icons.jsx'
import { COUNTRIES } from '../lib/locations.js'

/**
 * The primary search control: product + country + area.
 *
 * Renders as one unified "search bar" card on desktop and a stacked form on
 * mobile. Submitting is blocked (with a focus nudge) until both the product
 * and the area are filled, rather than firing a request that can't succeed.
 */
export default function SearchPanel({
  product,
  setProduct,
  countryCode,
  setCountryCode,
  area,
  setArea,
  onSearch,
  loading,
  detected,
  compact = false,
}) {
  const productRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!product.trim()) {
      productRef.current?.focus()
      return
    }
    onSearch()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`surface rounded-2xl ${compact ? 'p-3' : 'p-3 sm:rounded-[26px] sm:p-4'}`}
      style={{ boxShadow: 'var(--shadow-lift)' }}
    >
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_auto] lg:gap-2">
        {/* Product */}
        <div className="relative">
          <label htmlFor="product" className="sr-only">Product to find</label>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            <SearchIcon size={18} />
          </span>
          <input
            id="product"
            ref={productRef}
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            placeholder="What are you looking for?"
            autoComplete="off"
            className="w-full rounded-xl border py-3.5 pl-11 pr-4 text-[15px] outline-none transition-shadow placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-brand-500/40"
            style={{ background: 'var(--surface-sunken)', borderColor: 'var(--hairline)' }}
          />
        </div>

        {/* Country */}
        <div className="relative">
          <label htmlFor="country" className="sr-only">Country</label>
          <select
            id="country"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full appearance-none rounded-xl border py-3.5 pl-4 pr-9 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-brand-500/40"
            style={{ background: 'var(--surface-sunken)', borderColor: 'var(--hairline)' }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag}  {c.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            <ChevronIcon size={16} />
          </span>
        </div>

        {/* Area */}
        <div>
          <label htmlFor="area" className="sr-only">Shopping area or district</label>
          <AreaCombobox
            value={area}
            onChange={setArea}
            areas={COUNTRIES.find((c) => c.code === countryCode)?.areas || []}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-500 px-6 py-3.5 text-[15px] font-bold text-ink-950 shadow-lg shadow-brand-500/25 transition-all duration-200 hover:bg-brand-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 lg:px-7"
        >
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/25 border-t-ink-950" />
              Searching
            </>
          ) : (
            <>
              <SparkIcon size={17} />
              Find Stock
            </>
          )}
        </button>
      </div>

      {detected && !compact && (
        <p className="mt-3 px-1 text-xs text-[var(--text-tertiary)]">
          Location auto-detected from your time zone — change it any time.
        </p>
      )}
    </form>
  )
}
