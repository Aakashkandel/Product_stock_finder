import { useEffect, useRef, useState } from 'react'
import { CloseIcon, KeyIcon, SparkIcon, CheckIcon } from './Icons.jsx'
import { MODEL } from '../lib/ai.js'

/**
 * API key settings.
 *
 * The key never leaves the browser: it is stored in localStorage and attached
 * directly to the OpenRouter request. That trade-off is stated plainly in the
 * UI so the user can make an informed choice.
 */
export default function SettingsModal({ open, initialKey, onSave, onClose }) {
  const [value, setValue] = useState(initialKey)
  const [saved, setSaved] = useState(false)
  const inputRef = useRef(null)
  const dialogRef = useRef(null)

  useEffect(() => {
    if (open) {
      setValue(initialKey)
      setSaved(false)
      // Defer so the element exists and the open animation has begun.
      const t = setTimeout(() => inputRef.current?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [open, initialKey])

  // Escape to close, and lock background scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  if (!open) return null

  const handleSave = () => {
    onSave(value.trim())
    setSaved(true)
    setTimeout(onClose, 600)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="absolute inset-0 bg-ink-950/55 backdrop-blur-sm animate-[fade_0.25s_ease-out_both]"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        className="relative w-full max-w-lg rounded-t-3xl p-6 shadow-2xl animate-[rise_0.4s_var(--ease-out-expo)_both] sm:rounded-3xl sm:p-7"
        style={{ background: 'var(--surface-raised)', boxShadow: 'var(--shadow-lift)' }}
      >
        <button
          onClick={onClose}
          aria-label="Close settings"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <CloseIcon size={18} />
        </button>

        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950">
          <KeyIcon size={20} />
        </span>

        <h2 id="settings-title" className="mt-4 text-xl font-bold tracking-tight">
          Connect the AI model
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
          StockScout runs entirely in your browser. Paste a free OpenRouter key to
          run real lookups with{' '}
          <code className="rounded bg-[var(--surface-sunken)] px-1.5 py-0.5 font-mono text-[11px]">
            {MODEL}
          </code>
          . Without one, the app shows realistic demo results.
        </p>

        <label htmlFor="api-key" className="mt-5 block text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          OpenRouter API key
        </label>
        <input
          id="api-key"
          ref={inputRef}
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="sk-or-v1-..."
          spellCheck="false"
          autoComplete="off"
          className="mt-2 w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none transition-shadow placeholder:font-sans placeholder:text-[var(--text-tertiary)] focus:ring-2 focus:ring-brand-500/40"
          style={{ background: 'var(--surface-sunken)', borderColor: 'var(--hairline)' }}
        />

        <p className="mt-2.5 flex items-start gap-1.5 text-xs leading-relaxed text-[var(--text-tertiary)]">
          <span aria-hidden="true">🔒</span>
          Stored only in this browser's localStorage and sent directly to OpenRouter —
          never to us. On a shared computer, clear it when you're done.
        </p>

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-between">
          <a
            href="https://openrouter.ai/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:text-brand-600"
          >
            <SparkIcon size={15} /> Get a free key
          </a>

          <div className="flex gap-2.5">
            {initialKey && (
              <button
                onClick={() => {
                  onSave('')
                  onClose()
                }}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] ring-1 ring-inset transition-colors hover:text-rose-500"
                style={{ borderColor: 'var(--hairline)' }}
              >
                Remove
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-ink-950 shadow-lg shadow-brand-500/25 transition-all hover:bg-brand-400 active:scale-[0.98]"
            >
              {saved ? <><CheckIcon size={16} /> Saved</> : 'Save key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
