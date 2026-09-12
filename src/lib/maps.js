/** Deep links into the user's native maps app. */

function isAppleDevice() {
  if (typeof navigator === 'undefined') return false
  return /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)
}

/**
 * Builds a directions URL for a store, preferring Apple Maps on Apple
 * hardware and Google Maps everywhere else.
 */
export function directionsUrl(store, area = '', countryName = '') {
  const destination = [store.name, store.address, area, countryName]
    .filter(Boolean)
    .join(', ')
  const q = encodeURIComponent(destination)

  return isAppleDevice()
    ? `https://maps.apple.com/?daddr=${q}`
    : `https://www.google.com/maps/dir/?api=1&destination=${q}`
}

/** A plain search (not directions) link — used for the address itself. */
export function mapSearchUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

/** Copies text to the clipboard, falling back for non-secure contexts. */
export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const el = document.createElement('textarea')
      el.value = text
      el.setAttribute('readonly', '')
      el.style.position = 'fixed'
      el.style.opacity = '0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}
