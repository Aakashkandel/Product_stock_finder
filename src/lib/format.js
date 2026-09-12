/** Presentation helpers: money, distance, time and store-hours logic. */

import { getCountry } from './locations.js'

/** Formats a number as currency for the given country, with a safe fallback. */
export function formatPrice(value, countryCode) {
  const country = getCountry(countryCode)
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const amount = Number(value)
  try {
    return new Intl.NumberFormat(country.locale, {
      style: 'currency',
      currency: country.currency,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${country.symbol}${amount.toLocaleString()}`
  }
}

export function formatDistance(value, countryCode) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return null
  const unit = getCountry(countryCode).unit
  const n = Number(value)
  return `${n < 10 ? n.toFixed(1) : Math.round(n)} ${unit}`
}

export function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

/**
 * Decides whether a store is open right now from a free-text hours string.
 *
 * The AI returns hours in loose human form ("9:00 AM - 9:00 PM", "10-20",
 * "Open 24 hours"), so this parses defensively and returns `null` — meaning
 * "don't claim either way" — whenever the string can't be read confidently.
 */
export function getOpenState(hours) {
  if (!hours || typeof hours !== 'string') return null

  const text = hours.toLowerCase()
  if (text.includes('24 hour') || text.includes('24/7')) return { open: true, label: 'Open 24 hours' }
  if (text.includes('closed')) return { open: false, label: 'Closed today' }

  // Pull the first two clock times out of the string.
  const matches = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/g)]
  if (matches.length < 2) return null

  const toMinutes = (m, assumePm) => {
    let h = parseInt(m[1], 10)
    const min = m[2] ? parseInt(m[2], 10) : 0
    const suffix = m[3]
    if (h > 23 || min > 59) return null
    if (suffix === 'pm' && h !== 12) h += 12
    else if (suffix === 'am' && h === 12) h = 0
    else if (!suffix && assumePm && h < 12) h += 12
    return h * 60 + min
  }

  const open = toMinutes(matches[0], false)
  // A closing time without am/pm below 12 almost always means the evening.
  const close = toMinutes(matches[1], true)
  if (open === null || close === null) return null

  const now = new Date()
  const mins = now.getHours() * 60 + now.getMinutes()

  // Handle overnight ranges such as 22:00 – 02:00.
  const isOpen = close > open ? mins >= open && mins < close : mins >= open || mins < close
  if (!isOpen) return { open: false, label: 'Closed now' }

  const untilClose = (close - mins + 1440) % 1440
  if (untilClose <= 60) return { open: true, label: `Closing in ${untilClose}m` }
  return { open: true, label: 'Open now' }
}

/** Stable, readable id for a store so favourites survive a re-search. */
export function storeId(store) {
  return `${store.name}|${store.address}`.toLowerCase().replace(/\s+/g, '-').slice(0, 120)
}
