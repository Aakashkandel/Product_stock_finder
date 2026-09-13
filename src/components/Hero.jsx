import SearchPanel from './SearchPanel.jsx'
import RecentSearches from './RecentSearches.jsx'
import { PRODUCT_SUGGESTIONS, getCountry, COUNTRIES } from '../lib/locations.js'

/**
 * Landing view.
 *
 * One oversized statement, a search bar that looks like the point of the page,
 * and proof underneath. The volt accent appears exactly three times so it
 * keeps its force.
 */

const STEPS = [
  {
    n: '01',
    title: 'Name it and place it',
    body: 'The product, and the part of town you are in. Your country is read from your time zone.',
  },
  {
    n: '02',
    title: 'The model reads the street',
    body: 'It works out which chains and independents around there carry the item, and how likely it is to be on the shelf today.',
  },
  {
    n: '03',
    title: 'Go to the right shop',
    body: 'Prices, hours, distance and a route — so the trip you make is the one worth making.',
  },
]

export default function Hero({ searchProps, recents, onPickRecent, onClearRecents }) {
  const country = getCountry(searchProps.countryCode)

  return (
    <div className="above-grain relative overflow-hidden">
      {/* Depth behind the fold: a soft volt bloom and a fading ruled grid. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[680px]">
        <div
          className="absolute left-1/2 top-[-260px] h-[560px] w-[900px] -translate-x-1/2 rounded-full blur-[130px]"
          style={{ background: 'var(--bloom)' }}
        />
        <div
          className="absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
          style={{
            opacity: 'var(--grid-opacity)',
            backgroundImage:
              'linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-6 sm:pt-20">
        {/* Status line, not a badge. */}
        <div className="flex items-center gap-2.5 animate-[fade_0.5s_ease-out_both]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: 'var(--accent)' }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />
          </span>
          <span className="eyebrow">Live local stock lookup</span>
        </div>

        {/* Statement */}
        <h1 className="mt-7 max-w-[15ch] font-display text-[3.1rem] font-extrabold leading-[0.94] tracking-[-0.035em] animate-[rise_0.6s_var(--ease-out-expo)_0.05s_both] sm:max-w-[16ch] sm:text-[5rem] lg:text-[6.5rem]">
          Know who has it.{' '}
          <span className="mark">
            <span>Skip</span>
          </span>{' '}
          the drive.
        </h1>

        <p className="mt-7 max-w-lg text-[17px] leading-[1.6] text-[var(--text-2)] animate-[rise_0.6s_var(--ease-out-expo)_0.12s_both] sm:text-[19px]">
          Name the thing you are after and the part of town you are in.
          StockScout works out which shops nearby actually have it, what it
          should cost, and whether the door is open right now.
        </p>

        {/* Search — z-index keeps its dropdown above everything after it. */}
        <div className="relative z-30 mt-10 animate-[rise_0.6s_var(--ease-out-expo)_0.18s_both]">
          <SearchPanel {...searchProps} />
        </div>

        {/* Suggestions */}
        <div className="relative z-10 mt-5 flex flex-wrap items-center gap-2 animate-[rise_0.6s_var(--ease-out-expo)_0.24s_both]">
          <span className="mr-1 text-[13px] font-medium text-[var(--text-3)]">Try</span>
          {PRODUCT_SUGGESTIONS.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => searchProps.setProduct(item)}
              className="btn-ghost rounded-full px-3.5 py-1.5 text-[13px] font-medium"
            >
              {item}
            </button>
          ))}
        </div>

        {recents.length > 0 && (
          <RecentSearches items={recents} onPick={onPickRecent} onClear={onClearRecents} />
        )}

        {/* Coverage figure — concrete, not a marketing claim. */}
        <div className="mt-20 grid gap-10 border-t pt-10 sm:grid-cols-[auto_1fr] sm:gap-16" style={{ borderColor: 'var(--hairline)' }}>
          <div>
            <p className="font-display text-[3.5rem] font-extrabold leading-none tracking-[-0.04em]">
              {COUNTRIES.length}
            </p>
            <p className="mt-2 text-[13px] leading-snug text-[var(--text-3)]">
              countries, each with its
              <br />
              own districts and currency
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="tabular text-[12px] font-bold tracking-widest" style={{ color: 'var(--accent-text)' }}>
                  {step.n}
                </span>
                <h3 className="mt-2.5 font-display text-[17px] font-bold tracking-tight">{step.title}</h3>
                <p className="mt-1.5 text-[14px] leading-[1.6] text-[var(--text-2)]">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-12 max-w-2xl text-[13px] leading-relaxed text-[var(--text-3)]">
          Availability is estimated from how shops in {country.name} usually
          stock and sell, not read from a till. Treat it as a well-informed
          shortlist and ring ahead before a special trip.
        </p>
      </div>
    </div>
  )
}
