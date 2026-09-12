import { SparkIcon, SunIcon, MoonIcon, KeyIcon, BagIcon } from './Icons.jsx'

/** Sticky frosted top bar: brand, live AI status, theme toggle, settings. */
export default function Header({ theme, onToggleTheme, onOpenSettings, hasKey, onGoHome }) {
  return (
    <header className="sticky top-0 z-40 frost border-b" style={{ borderColor: 'var(--hairline)' }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onGoHome}
          className="group flex items-center gap-2.5 rounded-lg text-left"
          aria-label="StockScout home"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950 shadow-lg shadow-brand-500/25 transition-transform duration-300 group-hover:scale-105">
            <BagIcon size={18} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[15px] font-bold tracking-tight">StockScout</span>
            <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--text-tertiary)] sm:block">
              Local stock, found fast
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2">
          {/* Connection state doubles as the affordance to add a key. */}
          <button
            onClick={onOpenSettings}
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition-colors sm:inline-flex"
            style={{
              color: hasKey ? 'var(--color-brand-600)' : 'var(--text-secondary)',
              background: hasKey ? 'rgba(16,185,129,0.10)' : 'var(--surface-sunken)',
              borderColor: 'transparent',
            }}
            title={hasKey ? 'Qwen AI connected' : 'Running on demo data'}
          >
            <SparkIcon size={14} />
            {hasKey ? 'AI connected' : 'Demo mode'}
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Settings and API key"
            className="grid h-9 w-9 place-items-center rounded-xl text-[var(--text-secondary)] ring-1 ring-inset transition-colors hover:text-[var(--text-primary)]"
            style={{ borderColor: 'transparent', background: 'var(--surface-sunken)' }}
          >
            <KeyIcon size={17} />
          </button>

          <button
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="grid h-9 w-9 place-items-center rounded-xl text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            style={{ background: 'var(--surface-sunken)' }}
          >
            {theme === 'dark' ? <SunIcon size={17} /> : <MoonIcon size={17} />}
          </button>
        </div>
      </div>
    </header>
  )
}
