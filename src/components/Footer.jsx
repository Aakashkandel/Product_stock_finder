import { BagIcon } from './Icons.jsx'
import { MODEL } from '../lib/ai.js'

export default function Footer() {
  return (
    <footer className="mt-20 border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950">
                <BagIcon size={15} />
              </span>
              <span className="text-sm font-bold tracking-tight">StockScout</span>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-secondary)]">
              A static, privacy-respecting stock finder. No account, no server,
              no tracking — your searches stay in your browser.
            </p>
          </div>

          <div className="text-[13px] leading-relaxed text-[var(--text-tertiary)] sm:text-right">
            <p>
              Availability is AI-estimated by{' '}
              <span className="font-mono text-[11px]">{MODEL}</span>
            </p>
            <p className="mt-1">and is not a live inventory feed. Call ahead to confirm.</p>
            <p className="mt-4 text-[var(--text-tertiary)]">
              © {new Date().getFullYear()} StockScout
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
