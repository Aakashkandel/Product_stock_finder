import { SunIcon, MoonIcon } from './Icons.jsx'

/**
 * Top bar: wordmark, theme.
 *
 * The API key lives behind /setup-api, so there is deliberately no settings
 * affordance here for visitors to find, and no indicator of whether live
 * lookups are configured — that distinction is not the visitor's concern.
 */
export default function Header({ theme, onToggleTheme, onGoHome }) {
  return (
    <header className="above-grain sticky top-0 z-40 frost border-b" style={{ borderColor: 'var(--hairline)' }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <button onClick={onGoHome} className="group flex items-center gap-2.5 text-left">
          {/* Wordmark mark: a volt square with the bag cut out of it. */}
          <span
            className="grid h-8 w-8 place-items-center rounded-[10px] transition-transform duration-300 group-hover:-rotate-6"
            style={{ background: 'var(--accent)' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 8.5h14l-1 11a1.8 1.8 0 0 1-1.8 1.6H7.8A1.8 1.8 0 0 1 6 19.5Z" stroke="var(--accent-ink)" strokeWidth="1.9" strokeLinejoin="round" />
              <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" stroke="var(--accent-ink)" strokeWidth="1.9" strokeLinecap="round" />
            </svg>
          </span>
          <span className="font-display text-[19px] font-extrabold leading-none tracking-[-0.03em]">
            StockScout
          </span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="btn-ghost grid h-9 w-9 place-items-center rounded-full"
          >
            {theme === 'dark' ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
        </div>
      </div>
    </header>
  )
}
