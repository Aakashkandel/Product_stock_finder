/** Availability pill. Colour is reinforced by the label, never alone. */

const STYLES = {
  in_stock: { label: 'In stock', color: 'var(--stock-in)' },
  low_stock: { label: 'Low stock', color: 'var(--stock-low)' },
  out_of_stock: { label: 'Out of stock', color: 'var(--stock-out)' },
  unknown: { label: 'Unconfirmed', color: 'var(--text-3)' },
}

export function stockColor(status) {
  return (STYLES[status] || STYLES.unknown).color
}

export function stockLabel(status) {
  return (STYLES[status] || STYLES.unknown).label
}

export default function StockBadge({ status }) {
  const style = STYLES[status] || STYLES.unknown

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold tracking-tight"
      style={{
        color: style.color,
        background: `color-mix(in srgb, ${style.color} 14%, transparent)`,
      }}
    >
      <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: style.color }} />
      {style.label}
    </span>
  )
}
