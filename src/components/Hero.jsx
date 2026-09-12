import SearchPanel from './SearchPanel.jsx'
import RecentSearches from './RecentSearches.jsx'
import { PRODUCT_SUGGESTIONS, getCountry } from '../lib/locations.js'
import { SparkIcon, PinIcon, RouteIcon, TagIcon } from './Icons.jsx'

/** Three-up value proposition shown under the fold. */
const FEATURES = [
  {
    icon: SparkIcon,
    title: 'AI-read availability',
    body: 'Qwen 2.5 72B interprets your query and reasons over local retail patterns to estimate what is on the shelf.',
  },
  {
    icon: PinIcon,
    title: 'Genuinely local',
    body: 'Results are scoped to the district you pick — not a national catalogue with a postcode stapled on.',
  },
  {
    icon: RouteIcon,
    title: 'One tap to the door',
    body: 'Every store opens directly in Apple or Google Maps, with opening hours checked against the clock.',
  },
]

export default function Hero({ searchProps, recents, onPickRecent, onClearRecents }) {
  const country = getCountry(searchProps.countryCode)

  return (
    <div className="relative overflow-hidden">
      {/* Ambient gradient field — purely decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[110px] animate-[drift_22s_ease-in-out_infinite_alternate]"
          style={{ background: 'var(--glow-a)' }}
        />
        <div
          className="absolute -right-32 top-24 h-[380px] w-[380px] rounded-full blur-[100px]"
          style={{ background: 'var(--glow-b)' }}
        />
        {/* Faint grid to give the space some architecture. */}
        <div
          className="absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_at_top,black,transparent_72%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20 lg:pt-24">
        {/* Eyebrow */}
        <div className="flex justify-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset ring-brand-500/25 animate-[rise_0.5s_var(--ease-out-expo)_both]"
            style={{ background: 'rgba(16,185,129,0.10)', color: 'var(--color-brand-600)' }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inset-0 rounded-full bg-brand-500 animate-[pulse-ring_2.4s_var(--ease-out-expo)_infinite]" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand-500" />
            </span>
            Powered by Qwen 2.5 72B
          </span>
        </div>

        {/* Headline */}
        <h1
          className="mt-6 text-balance text-center text-[2.6rem] font-bold leading-[1.05] tracking-[-0.03em] animate-[rise_0.6s_var(--ease-out-expo)_0.05s_both] sm:text-6xl lg:text-[4.25rem]"
        >
          Stop driving store to store.
          <br />
          <span className="font-display font-normal italic text-brand-500">Know</span>{' '}
          <span className="text-[var(--text-primary)]">before you go.</span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-balance text-center text-[17px] leading-relaxed text-[var(--text-secondary)] animate-[rise_0.6s_var(--ease-out-expo)_0.12s_both]">
          Tell StockScout what you need and where you are. It reads local retail
          the way a well-connected friend would — and tells you which shops
          actually have it.
        </p>

        {/* Search */}
        <div className="mt-9 animate-[rise_0.6s_var(--ease-out-expo)_0.18s_both]">
          <SearchPanel {...searchProps} />
        </div>

        {/* Quick product chips */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 animate-[rise_0.6s_var(--ease-out-expo)_0.24s_both]">
          <span className="mr-1 text-xs font-medium text-[var(--text-tertiary)]">Popular:</span>
          {PRODUCT_SUGGESTIONS.slice(0, 6).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => searchProps.setProduct(item)}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] ring-1 ring-inset transition-all hover:-translate-y-0.5 hover:text-brand-600 hover:ring-brand-500/40"
              style={{ background: 'var(--surface-raised)', borderColor: 'var(--hairline)' }}
            >
              {item}
            </button>
          ))}
        </div>

        {recents.length > 0 && (
          <RecentSearches items={recents} onPick={onPickRecent} onClear={onClearRecents} />
        )}

        {/* Feature trio */}
        <div className="mt-20 grid gap-4 sm:mt-24 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <div
              key={title}
              className="surface rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-1"
              style={{ animation: `rise 0.6s var(--ease-out-expo) ${0.3 + i * 0.07}s both` }}
            >
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/12 text-brand-600 dark:text-brand-400">
                <Icon size={19} />
              </span>
              <h3 className="mt-3.5 text-[15px] font-bold tracking-tight">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{body}</p>
            </div>
          ))}
        </div>

        {/* Honesty note — estimates, not a live inventory feed. */}
        <p className="mx-auto mt-10 flex max-w-xl items-start gap-2 text-center text-xs leading-relaxed text-[var(--text-tertiary)]">
          <TagIcon size={14} className="mt-0.5 shrink-0" />
          <span className="text-left">
            StockScout gives AI-estimated availability based on typical stocking
            patterns in {country.name} — not a live till feed. Always call ahead
            before making a special trip.
          </span>
        </p>
      </div>
    </div>
  )
}
