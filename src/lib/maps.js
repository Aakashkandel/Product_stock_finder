/** Deep links into Google Maps. */

/**
 * Builds a Google Maps directions URL for a store.
 *
 * Always Google Maps, on every platform — the universal `maps.google.com`
 * links open the native app on Android and iOS when it is installed, and the
 * web map otherwise, so there is no reason to branch on the user agent.
 */
export function directionsUrl(store, area = '', countryName = '') {
  const destination = [store.name, store.address, area, countryName]
    .filter(Boolean)
    .join(', ')

  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
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
