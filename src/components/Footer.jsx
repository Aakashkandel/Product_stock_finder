/** Closing band and the standing disclaimer. */
export default function Footer() {
  return (
    <footer className="above-grain mt-24 border-t" style={{ borderColor: 'var(--hairline)' }}>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: 'var(--accent)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 8.5h14l-1 11a1.8 1.8 0 0 1-1.8 1.6H7.8A1.8 1.8 0 0 1 6 19.5Z" stroke="var(--accent-ink)" strokeWidth="1.9" strokeLinejoin="round" />
                  <path d="M9 8.5V6a3 3 0 0 1 6 0v2.5" stroke="var(--accent-ink)" strokeWidth="1.9" strokeLinecap="round" />
                </svg>
              </span>
              <span className="font-display text-[17px] font-extrabold tracking-[-0.03em]">StockScout</span>
            </div>
            <p className="mt-3.5 text-[13px] leading-relaxed text-[var(--text-2)]">
              No account, no server, no tracking. Your searches stay in your
              browser.
            </p>
          </div>

          <div className="max-w-sm text-[13px] leading-relaxed text-[var(--text-3)] sm:text-right">
            <p>
              Stock levels are estimates, not a live inventory feed, and
              StockScout is not affiliated with any retailer shown.
            </p>
            <p className="mt-4">© {new Date().getFullYear()} StockScout</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
