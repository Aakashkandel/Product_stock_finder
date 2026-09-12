/** Colour-coded availability pill. Meaning is carried by text, not colour alone. */

const STYLES = {
  in_stock: {
    label: 'In Stock',
    dot: 'bg-[var(--color-stock-in)]',
    chip: 'text-emerald-700 dark:text-emerald-300 bg-emerald-500/12 ring-emerald-500/25',
  },
  low_stock: {
    label: 'Low Stock',
    dot: 'bg-[var(--color-stock-low)]',
    chip: 'text-amber-700 dark:text-amber-300 bg-amber-500/12 ring-amber-500/25',
  },
  out_of_stock: {
    label: 'Out of Stock',
    dot: 'bg-[var(--color-stock-out)]',
    chip: 'text-rose-700 dark:text-rose-300 bg-rose-500/12 ring-rose-500/25',
  },
  unknown: {
    label: 'Unconfirmed',
    dot: 'bg-[var(--color-stock-unknown)]',
    chip: 'text-ink-600 dark:text-ink-300 bg-ink-500/12 ring-ink-500/25',
  },
}

export function stockLabel(status) {
  return (STYLES[status] || STYLES.unknown).label
}

export default function StockBadge({ status, pulse = false }) {
  const style = STYLES[status] || STYLES.unknown

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.chip}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {pulse && status === 'in_stock' && (
          <span className={`absolute inset-0 rounded-full ${style.dot} animate-[pulse-ring_2.4s_var(--ease-out-expo)_infinite]`} />
        )}
        <span className={`relative h-1.5 w-1.5 rounded-full ${style.dot}`} />
      </span>
      {style.label}
    </span>
  )
}
