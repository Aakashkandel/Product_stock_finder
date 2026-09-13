/**
 * Search state <-> URL query string.
 *
 * Makes every result page shareable and bookmarkable, and lets the browser
 * back button move between the landing view and a search — behaviour users
 * expect from anything that looks like a search engine.
 */

import { COUNTRIES, DEFAULT_COUNTRY } from './locations.js'

/** Reads a search query out of the current URL, or null if there isn't one. */
export function readQueryFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search)
    const product = (params.get('q') || '').trim()
    if (!product) return null

    const rawCountry = (params.get('country') || '').toUpperCase()
    const countryCode = COUNTRIES.some((c) => c.code === rawCountry) ? rawCountry : DEFAULT_COUNTRY

    return {
      product,
      countryCode,
      area: (params.get('area') || '').trim(),
    }
  } catch {
    return null
  }
}

/** Pushes or replaces the search in the address bar without a reload. */
export function writeQueryToUrl(query, { replace = false } = {}) {
  try {
    const params = new URLSearchParams({
      q: query.product,
      country: query.countryCode,
      area: query.area,
    })
    const url = `${window.location.pathname}?${params.toString()}`
    if (replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
  } catch {
    /* history unavailable (e.g. file://) — the app still works */
  }
}

/** Returns to the bare landing URL. */
export function clearQueryFromUrl() {
  try {
    window.history.pushState(null, '', window.location.pathname)
  } catch {
    /* non-fatal */
  }
}

/** Absolute link to the current search, for the share button. */
export function shareUrlFor(query) {
  const params = new URLSearchParams({
    q: query.product,
    country: query.countryCode,
    area: query.area,
  })
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`
}
