import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ResultsView from './components/ResultsView.jsx'
import Footer from './components/Footer.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import Toast from './components/Toast.jsx'
import { findStock, hasApiKey } from './lib/ai.js'
import { detectCountry, getCountry } from './lib/locations.js'
import * as store from './lib/storage.js'

const LOADING_STEP_MS = 1100
const TOTAL_LOADING_STEPS = 4

export default function App() {
  /* -- Search inputs ------------------------------------------------------- */
  const [product, setProduct] = useState('')
  const [countryCode, setCountryCode] = useState(detectCountry)
  const [area, setArea] = useState(() => getCountry(detectCountry()).areas[0])
  const [detected] = useState(true)

  /* -- Results ------------------------------------------------------------- */
  const [view, setView] = useState('home') // 'home' | 'results'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [notice, setNotice] = useState('')

  /* -- Shell --------------------------------------------------------------- */
  const [theme, setThemeState] = useState(store.getTheme)
  const [apiKey, setApiKeyState] = useState(store.getApiKey)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [recents, setRecents] = useState(store.getRecents)
  const [saved, setSaved] = useState(store.getSaved)
  const [toast, setToast] = useState(null)

  // Lets a new search cancel an in-flight one.
  const abortRef = useRef(null)

  useEffect(() => {
    store.setTheme(theme)
  }, [theme])

  // Advance the loading narration while the model works.
  useEffect(() => {
    if (!loading) return
    setLoadingStep(0)
    const timer = setInterval(
      () => setLoadingStep((s) => Math.min(s + 1, TOTAL_LOADING_STEPS - 1)),
      LOADING_STEP_MS
    )
    return () => clearInterval(timer)
  }, [loading])

  /** When the country changes, move the area to that country's first district. */
  const handleCountryChange = useCallback((code) => {
    setCountryCode(code)
    setArea(getCountry(code).areas[0])
  }, [])

  const runSearch = useCallback(
    async (query) => {
      const trimmed = {
        product: query.product.trim(),
        countryCode: query.countryCode,
        area: query.area.trim() || getCountry(query.countryCode).areas[0],
      }
      if (!trimmed.product) return

      // Supersede any request still in flight.
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      setView('results')
      setLoading(true)
      setNotice('')
      setResult(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      const response = await findStock(trimmed, { signal: controller.signal })

      // A superseded request must not overwrite the newer one's results.
      if (controller.signal.aborted) return

      setResult(response.data)
      setNotice(response.notice)
      setLoading(false)
      setRecents(store.addRecent(trimmed))
    },
    []
  )

  const handleSearch = useCallback(() => {
    runSearch({ product, countryCode, area })
  }, [product, countryCode, area, runSearch])

  const handlePickRecent = useCallback(
    (entry) => {
      setProduct(entry.product)
      setCountryCode(entry.countryCode)
      setArea(entry.area)
      runSearch(entry)
    },
    [runSearch]
  )

  const handleSaveKey = useCallback((key) => {
    store.setApiKey(key)
    setApiKeyState(key)
    setToast({
      type: 'success',
      message: key ? 'AI connected — your next search runs live.' : 'API key removed. Back to demo mode.',
    })
  }, [])

  const handleToggleSave = useCallback((id) => {
    setSaved(store.toggleSaved(id))
  }, [])

  const handleGoHome = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
    setView('home')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const searchProps = {
    product,
    setProduct,
    countryCode,
    setCountryCode: handleCountryChange,
    area,
    setArea,
    onSearch: handleSearch,
    loading,
    detected,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        theme={theme}
        onToggleTheme={() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))}
        onOpenSettings={() => setSettingsOpen(true)}
        hasKey={hasApiKey()}
        onGoHome={handleGoHome}
      />

      <main className="flex-1">
        {view === 'home' ? (
          <Hero
            searchProps={searchProps}
            recents={recents}
            onPickRecent={handlePickRecent}
            onClearRecents={() => setRecents(store.clearRecents())}
          />
        ) : (
          <ResultsView
            result={result}
            loading={loading}
            loadingStep={loadingStep}
            notice={notice}
            onBack={handleGoHome}
            onRetry={handleSearch}
            searchProps={searchProps}
            saved={saved}
            onToggleSave={handleToggleSave}
            onToast={setToast}
          />
        )}
      </main>

      <Footer />

      <SettingsModal
        open={settingsOpen}
        initialKey={apiKey}
        onSave={handleSaveKey}
        onClose={() => setSettingsOpen(false)}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
