import { useEffect, useRef, useState } from 'react'
import { ArrowLeftIcon, CheckIcon, AlertIcon } from './Icons.jsx'
import { navigate, ROUTES } from '../lib/router.js'
import * as auth from '../lib/auth.js'
import { getApiKey, setApiKey } from '../lib/storage.js'

/**
 * Admin-only API key setup, served at /setup-api.
 *
 * Three states: not configured (no credentials compiled in), locked (sign-in
 * form), and unlocked (the key form). The honesty note about what this gate
 * can and cannot do is part of the page, not buried in a README.
 */
export default function SetupApi() {
  const [signedIn, setSignedIn] = useState(auth.isSignedIn)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const [key, setKey] = useState(getApiKey)
  const [savedAt, setSavedAt] = useState(0)

  const firstField = useRef(null)

  useEffect(() => {
    document.title = 'API Setup · StockScout'
    firstField.current?.focus()
  }, [signedIn])

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setChecking(true)

    const ok = await auth.verifyCredentials(username.trim(), password)

    if (ok) {
      auth.startSession()
      setSignedIn(true)
      setPassword('')
    } else {
      // One message for both fields: never reveal which half was wrong.
      setError('Those credentials were not accepted.')
    }
    setChecking(false)
  }

  const handleSaveKey = (e) => {
    e.preventDefault()
    setApiKey(key.trim())
    setSavedAt(Date.now())
  }

  const handleSignOut = () => {
    auth.endSession()
    setSignedIn(false)
    setUsername('')
    setPassword('')
  }

  return (
    <div className="above-grain mx-auto min-h-screen max-w-lg px-5 py-14 sm:py-20">
      <button
        onClick={() => navigate(ROUTES.home)}
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
      >
        <ArrowLeftIcon size={15} /> Back to StockScout
      </button>

      <p className="eyebrow">Administration</p>
      <h1 className="mt-4 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-[-0.035em]">
        API configuration
      </h1>

      {/* -- State 1: no credentials compiled into this build ---------------- */}
      {!auth.isConfigured() ? (
        <div className="card mt-8 p-6">
          <p className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--text-2)]">
            <AlertIcon size={17} className="mt-0.5 shrink-0" style={{ color: 'var(--stock-low)' }} />
            <span>
              This page is locked because no administrator credentials were set
              when the site was built. Nobody can reach the key form — including
              you — until they are.
            </span>
          </p>

          <p className="mt-5 text-sm font-semibold">To enable it</p>
          <ol className="mt-2 space-y-2.5 text-sm leading-relaxed text-[var(--text-2)]">
            <li>
              <span className="font-medium text-[var(--text)]">1.</span> Generate a
              password digest:
              <pre className="mt-2 overflow-x-auto rounded-lg p-3 font-mono text-xs" style={{ background: 'var(--sunken)' }}>
npm run hash-password &apos;your-password&apos;</pre>
            </li>
            <li>
              <span className="font-medium text-[var(--text)]">2.</span> Put the two
              printed values in <code className="font-mono text-xs">.env</code> (locally) or in
              your host&apos;s environment variables.
            </li>
            <li>
              <span className="font-medium text-[var(--text)]">3.</span> Rebuild and
              redeploy.
            </li>
          </ol>
        </div>
      ) : !signedIn ? (
        /* -- State 2: locked ---------------------------------------------- */
        <>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--text-2)]">
            Sign in to set the API key used for live stock lookups.
          </p>

          <form onSubmit={handleSignIn} className="card mt-8 p-6">
            <label htmlFor="admin-user" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
              Username
            </label>
            <input
              id="admin-user"
              ref={firstField}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="field mt-2 w-full bg-[var(--sunken)] px-4 py-3 text-[15px] font-medium outline-none"
            />

            <label htmlFor="admin-pass" className="mt-4 block text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
              Password
            </label>
            <input
              id="admin-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="field mt-2 w-full bg-[var(--sunken)] px-4 py-3 text-[15px] font-medium outline-none"
            />

            {error && (
              <p role="alert" className="mt-3 text-sm" style={{ color: 'var(--stock-out)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={checking || !username || !password}
              className="btn-primary mt-6 w-full px-5 py-3 text-sm"
            >
              {checking ? 'Checking…' : 'Sign in'}
            </button>
          </form>
        </>
      ) : (
        /* -- State 3: unlocked -------------------------------------------- */
        <>
          <div className="mt-3 flex items-center justify-between gap-4">
            <p className="text-[15px] text-[var(--text-2)]">
              Signed in as{' '}
              <span className="font-medium text-[var(--text)]">
                {auth.configuredUsername()}
              </span>
            </p>
            <button
              onClick={handleSignOut}
              className="text-sm text-[var(--text-2)] underline underline-offset-4 transition-colors hover:text-[var(--text)]"
            >
              Sign out
            </button>
          </div>

          <form onSubmit={handleSaveKey} className="card mt-8 p-6">
            <label htmlFor="api-key" className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-3)]">
              OpenRouter API key
            </label>
            <input
              id="api-key"
              ref={firstField}
              type="password"
              value={key}
              onChange={(e) => {
                setKey(e.target.value)
                setSavedAt(0)
              }}
              placeholder="sk-or-v1-…"
              spellCheck="false"
              autoComplete="off"
              className="field mt-2 w-full bg-[var(--sunken)] px-4 py-3 font-mono text-sm outline-none placeholder:font-sans placeholder:text-[var(--text-3)]"
            />

            <p className="mt-2.5 text-xs leading-relaxed text-[var(--text-3)]">
              Stored in this browser only, and sent directly to OpenRouter when a
              search runs. Clearing site data removes it.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <button type="submit" className="btn-primary px-6 py-3 text-sm">
                Save key
              </button>
              {key && (
                <button
                  type="button"
                  onClick={() => {
                    setApiKey('')
                    setKey('')
                    setSavedAt(0)
                  }}
                  className="px-3 py-2.5 text-sm text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
                >
                  Remove
                </button>
              )}
              {savedAt > 0 && (
                <span className="ml-auto inline-flex items-center gap-1.5 text-sm" style={{ color: 'var(--stock-in)' }}>
                  <CheckIcon size={15} /> Saved
                </span>
              )}
            </div>
          </form>

          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-[var(--text-2)] underline underline-offset-4 transition-colors hover:text-[var(--text)]"
          >
            Get a key from OpenRouter
          </a>
        </>
      )}

      {/* Honest about what this gate is worth. */}
      <p className="mt-10 border-t pt-5 text-xs leading-relaxed text-[var(--text-3)]" style={{ borderColor: 'var(--hairline)' }}>
        <span className="font-semibold">On this lock:</span> StockScout is a static
        site with no server, so this sign-in keeps the form away from visitors —
        it is not a vault. The password is never shipped (only its SHA-256
        digest is), and a key saved here is stored in this browser alone, so it
        is never exposed to anyone else who opens the site.
      </p>
    </div>
  )
}
