/**
 * Monetisation placeholders.
 *
 * Marked with `.ad-slot` and `data-ad-slot` so an AdSense / affiliate snippet
 * can be dropped straight in later. Until then they render as tasteful,
 * clearly-labelled reserved space rather than intrusive filler — and the
 * reserved height prevents layout shift when a real ad loads.
 */

const VARIANTS = {
  leaderboard: { className: 'min-h-[92px] sm:min-h-[110px]', label: 'Banner ad · 728×90' },
  inline: { className: 'min-h-[96px]', label: 'Native in-feed ad' },
  sidebar: { className: 'min-h-[250px]', label: 'Sidebar ad · 300×250' },
}

export default function AdSlot({ variant = 'leaderboard', className = '' }) {
  const config = VARIANTS[variant] || VARIANTS.leaderboard

  return (
    <aside
      className={`ad-slot flex ${className}`}
      data-ad-slot={variant}
      aria-label="Advertisement"
    >
      <div
        className={`flex ${config.className} w-full flex-1 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed px-4 py-5 text-center`}
        style={{ borderColor: 'var(--hairline-strong)', background: 'var(--sunken)' }}
      >
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-3)]">
          Advertisement
        </span>
        <span className="text-[11px] text-[var(--text-3)]">{config.label}</span>
      </div>
    </aside>
  )
}
