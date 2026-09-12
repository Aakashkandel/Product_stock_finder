/**
 * Inline icon set.
 *
 * Hand-built so the bundle carries no icon library. Every glyph inherits
 * `currentColor` and sits on a 24px grid with a 1.75 stroke for optical
 * consistency with the Inter type.
 */

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

const Svg = ({ size = 20, children, ...rest }) => (
  <svg {...base} width={size} height={size} {...rest}>
    {children}
  </svg>
)

export const SearchIcon = (p) => (
  <Svg {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.4-3.4" /></Svg>
)

export const PinIcon = (p) => (
  <Svg {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></Svg>
)

export const BagIcon = (p) => (
  <Svg {...p}><path d="M4 8h16l-1.2 11.1a2 2 0 0 1-2 1.9H7.2a2 2 0 0 1-2-1.9Z" /><path d="M9 8V6a3 3 0 1 1 6 0v2" /></Svg>
)

export const ClockIcon = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></Svg>
)

export const RouteIcon = (p) => (
  <Svg {...p}><path d="m21 3-7.5 18-2.6-7.4L3.5 11Z" /></Svg>
)

export const SparkIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9Z" />
    <path d="M18.5 4v3M20 5.5h-3" />
  </Svg>
)

export const SunIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </Svg>
)

export const MoonIcon = (p) => (
  <Svg {...p}><path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.5 8.5 0 1 0 10.2 10.2Z" /></Svg>
)

export const KeyIcon = (p) => (
  <Svg {...p}><circle cx="8" cy="14" r="4" /><path d="m11 11 8-8M17 5l2 2M15 7l2 2" /></Svg>
)

export const CloseIcon = (p) => (
  <Svg {...p}><path d="M6 6l12 12M18 6 6 18" /></Svg>
)

export const ChevronIcon = (p) => (
  <Svg {...p}><path d="m6 9 6 6 6-6" /></Svg>
)

export const ArrowLeftIcon = (p) => (
  <Svg {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Svg>
)

export const CheckIcon = (p) => (
  <Svg {...p}><path d="m4.5 12.5 5 5 10-11" /></Svg>
)

export const CopyIcon = (p) => (
  <Svg {...p}><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" /></Svg>
)

export const HeartIcon = ({ filled, ...p }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'}>
    <path d="M12 20s-7.2-4.4-7.2-9.3A4.1 4.1 0 0 1 12 8.1a4.1 4.1 0 0 1 7.2 2.6C19.2 15.6 12 20 12 20Z" />
  </Svg>
)

export const PhoneIcon = (p) => (
  <Svg {...p}><path d="M6.5 3.5h3l1.5 4-2 1.4a12 12 0 0 0 6.1 6.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" /></Svg>
)

export const AlertIcon = (p) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.8v5M12 16.2h.01" /></Svg>
)

export const SlidersIcon = (p) => (
  <Svg {...p}><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></Svg>
)

export const TagIcon = (p) => (
  <Svg {...p}><path d="M3.5 11.6V4.5a1 1 0 0 1 1-1h7.1a1 1 0 0 1 .7.3l8 8a1 1 0 0 1 0 1.4l-7.1 7.1a1 1 0 0 1-1.4 0l-8-8a1 1 0 0 1-.3-.7Z" /><circle cx="8" cy="8" r="1.4" /></Svg>
)

export const TrashIcon = (p) => (
  <Svg {...p}><path d="M4 6.5h16M9.5 6.5V4.8a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.7M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" /></Svg>
)

export const RefreshIcon = (p) => (
  <Svg {...p}><path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4.5h-4.5" /></Svg>
)
