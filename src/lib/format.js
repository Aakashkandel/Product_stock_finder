/** Presentation helpers: money, distance, time and store-hours logic. */

import { getCountry } from './locations.js'

/** Formats a number as currency for the given country, with a safe fallback. */
export function formatPrice(value, countryCode) {
  const country = getCountry(countryCode)
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  const amount = Number(value)

  // Big-ticket prices read better rounded to whole units; small ones keep
  // cents. min and max must agree, or Intl silently emits an odd digit count.
  const digits = amount >= 1000 ? 0 : amount % 1 === 0 ? 0 : 2

  try {
    return new Intl.NumberFormat(country.locale, {
      style: 'currency',
      currency: country.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
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

  const parse = (m) => {
    const h = parseInt(m[1], 10)
    const min = m[2] ? parseInt(m[2], 10) : 0
    if (h > 23 || min > 59) return null
    return { h, min, suffix: m[3] }
  }

  const from = parse(matches[0])
  const to = parse(matches[1])
  if (!from || !to) return null

  const apply = (t) => {
    let h = t.h
    if (t.suffix === 'pm' && h !== 12) h += 12
    else if (t.suffix === 'am' && h === 12) h = 0
    return h * 60 + t.min
  }

  const open = apply(from)
  let close = apply(to)

  // "10 - 8" means 10am to 8pm. Only assume an evening close when the string is
  // written in 12-hour style — an opening hour past noon (e.g. "22:00 - 02:00")
  // means it is already 24-hour, where 02:00 genuinely is 2am.
  const isTwelveHourStyle = !to.suffix && from.h < 12 && from.h !== 0
  if (isTwelveHourStyle && to.h < 12) close = (to.h + 12) * 60 + to.min

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
