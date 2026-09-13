/**
 * A two-route router, hand-rolled rather than pulled from a library.
 *
 * The app has exactly one alternate page (the admin key setup), so a routing
 * dependency would cost more bytes than it saves. Routes are resolved against
 * the deploy's base path, so this works from a subdirectory (GitHub Pages)
 * as well as from a domain root.
 */

// Vite rewrites import.meta.env.BASE_URL to the configured `base` at build time.
const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '')

export const ROUTES = {
  home: '/',
  setup: '/setup-api',
}

/** Turns an app route into a real href for this deployment. */
export function href(route) {
  return `${BASE}${route}` || '/'
}

/** Reads the current route from the address bar. */
export function currentRoute() {
  let path = window.location.pathname
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length)
  path = path.replace(/\/+$/, '') || '/'

  // Tolerate index.html being served directly from a file host.
  if (path.endsWith('/index.html')) path = path.slice(0, -'/index.html'.length) || '/'

  return path === ROUTES.setup ? 'setup' : 'home'
}

/** Client-side navigation; the caller re-renders off the popstate event. */
export function navigate(route, { replace = false } = {}) {
  const url = href(route)
  if (replace) window.history.replaceState(null, '', url)
  else window.history.pushState(null, '', url)
  window.dispatchEvent(new PopStateEvent('popstate'))
}
