/**
 * Admin gate for the /setup-api route.
 *
 * IMPORTANT, AND DELIBERATELY STATED IN THE UI:
 * This is a static site. There is no server, so this gate is an *access
 * control on the form*, not a security boundary. A determined visitor can read
 * the compiled bundle. What it does buy you:
 *
 *   - the key form is not reachable by casual visitors or by guessing the URL
 *   - the password itself is never shipped; only a SHA-256 digest is
 *   - the saved key lives in the operator's own browser, so a visitor who got
 *     in could only ever set a key for themselves
 *
 * Treat the credentials as a lock on a door, not a vault.
 */

const USERNAME = import.meta.env.VITE_ADMIN_USERNAME || ''
const PASSWORD_HASH = (import.meta.env.VITE_ADMIN_PASSWORD_HASH || '').toLowerCase()

const SESSION_KEY = 'stockscout:admin-session'

/** True when the deployment has admin credentials compiled in. */
export function isConfigured() {
  return Boolean(USERNAME && PASSWORD_HASH)
}

export function configuredUsername() {
  return USERNAME
}

/** SHA-256 → lowercase hex, via the Web Crypto API. */
export async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Length-independent comparison, so timing reveals nothing useful. */
function constantTimeEquals(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/**
 * Verifies credentials. Resolves to true only when the deployment is
 * configured and both the username and the password digest match.
 */
export async function verifyCredentials(username, password) {
  if (!isConfigured()) return false
  if (username !== USERNAME) return false

  try {
    const hash = await sha256Hex(password)
    return constantTimeEquals(hash, PASSWORD_HASH)
  } catch {
    // crypto.subtle is unavailable outside secure contexts (plain http).
    return false
  }
}

/* -- Session ---------------------------------------------------------------
   Held in sessionStorage, so it survives a refresh but dies with the tab. */

export function isSignedIn() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === PASSWORD_HASH && isConfigured()
  } catch {
    return false
  }
}

export function startSession() {
  try {
    sessionStorage.setItem(SESSION_KEY, PASSWORD_HASH)
  } catch {
    /* private mode — the user simply signs in again */
  }
}

export function endSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* non-fatal */
  }
}
