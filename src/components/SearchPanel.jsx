import { useRef } from 'react'
import AreaCombobox from './AreaCombobox.jsx'
import { SearchIcon, ChevronIcon } from './Icons.jsx'
import { COUNTRIES } from '../lib/locations.js'

/**
 * Product + country + area.
 *
 * One raised slab holding three fields and the action, so it reads as a single
 * instrument rather than a row of loose inputs.
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
    <form onSubmit={handleSubmit} className={`card ${compact ? 'p-2.5' : 'p-2.5 sm:p-3'}`}>
      <div className="grid gap-2 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.9fr)_minmax(0,1.25fr)_auto]">
        {/* Product */}
        <div className="field relative">
          <label htmlFor="product" className="sr-only">Product to find</label>
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
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
            className="w-full bg-transparent py-3.5 pl-11 pr-3 text-[15px] font-medium outline-none placeholder:font-normal placeholder:text-[var(--text-3)]"
          />
        </div>

        {/* Country */}
        <div className="field relative">
          <label htmlFor="country" className="sr-only">Country</label>
          <select
            id="country"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full appearance-none bg-transparent py-3.5 pl-4 pr-9 text-[15px] font-medium outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary relative inline-flex items-center justify-center gap-2 overflow-hidden px-7 py-3.5 text-[15px]"
        >
          {loading ? (
            <>
              {/* A light sweep across the button while the model works. */}
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-[sweep_2.6s_ease-in-out_infinite]"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)' }}
              />
              <span className="relative h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />
              <span className="relative">Searching</span>
            </>
          ) : (
            'Find stock'
          )}
        </button>
      </div>

      {detected && !compact && (
        <p className="px-1.5 pb-0.5 pt-2.5 text-[12px] text-[var(--text-3)]">
          Country set from your time zone — change it any time.
        </p>
      )}
    </form>
  )
}
