/**
 * Thin, crash-proof localStorage wrapper.
 *
 * Every accessor is guarded: Safari private mode and some embedded webviews
 * throw on read/write, and a storage failure must never break the UI.
 */

const PREFIX = 'stockscout:'
const KEYS = {
  theme: PREFIX + 'theme',
  apiKey: PREFIX + 'apikey',
  recents: PREFIX + 'recents',
  saved: PREFIX + 'saved',
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

/* -- Theme ----------------------------------------------------------------- */

export function getTheme() {
  try {
    const saved = localStorage.getItem(KEYS.theme)
    if (saved === 'dark' || saved === 'light') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function setTheme(theme) {
  try {
    localStorage.setItem(KEYS.theme, theme)
  } catch {
    /* non-fatal */
  }
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

/* -- API key --------------------------------------------------------------- */
/* The key is only ever held in this browser; it is sent straight to OpenRouter
   and never to any server of ours (there isn't one). */

export function getApiKey() {
  try {
    return localStorage.getItem(KEYS.apiKey) || ''
  } catch {
    return ''
  }
}

export function setApiKey(key) {
  try {
    if (key) localStorage.setItem(KEYS.apiKey, key)
    else localStorage.removeItem(KEYS.apiKey)
  } catch {
    /* non-fatal */
  }
}

/* -- Recent searches ------------------------------------------------------- */

const MAX_RECENTS = 6

export function getRecents() {
  const list = read(KEYS.recents, [])
  return Array.isArray(list) ? list : []
}

export function addRecent(entry) {
  const key = (e) => `${e.product}|${e.countryCode}|${e.area}`.toLowerCase()
  const next = [
    { ...entry, at: Date.now() },
    ...getRecents().filter((e) => key(e) !== key(entry)),
  ].slice(0, MAX_RECENTS)
  write(KEYS.recents, next)
  return next
}

export function clearRecents() {
  write(KEYS.recents, [])
  return []
}

/* -- Saved stores ---------------------------------------------------------- */

export function getSaved() {
  const list = read(KEYS.saved, [])
  return Array.isArray(list) ? list : []
}

/** Toggles a store id in the saved set and returns the new set. */
export function toggleSaved(id) {
  const current = getSaved()
  const next = current.includes(id)
    ? current.filter((x) => x !== id)
    : [...current, id]
  write(KEYS.saved, next)
  return next
}
