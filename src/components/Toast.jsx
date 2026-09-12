import { useEffect } from 'react'
import { CheckIcon, AlertIcon, CloseIcon } from './Icons.jsx'

/** Transient bottom-centre notification. Auto-dismisses; announced politely. */
export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDismiss, toast.duration || 4000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 animate-[rise_0.35s_var(--ease-out-expo)_both]"
    >
      <div
        className="flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 shadow-2xl ring-1 ring-inset"
        style={{
          background: 'var(--surface-raised)',
          borderColor: 'var(--hairline)',
          boxShadow: 'var(--shadow-lift)',
        }}
      >
        <span className={isError ? 'mt-0.5 text-rose-500' : 'mt-0.5 text-brand-500'}>
          {isError ? <AlertIcon size={18} /> : <CheckIcon size={18} />}
        </span>
        <p className="text-sm leading-snug text-[var(--text-primary)]">{toast.message}</p>
        <button
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="-mr-1 mt-0.5 text-[var(--text-tertiary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <CloseIcon size={16} />
        </button>
      </div>
    </div>
  )
}
