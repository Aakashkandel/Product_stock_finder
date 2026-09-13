import { useCallback, useEffect, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import ResultsView from './components/ResultsView.jsx'
import Footer from './components/Footer.jsx'
import SetupApi from './components/SetupApi.jsx'
import Toast from './components/Toast.jsx'
import { findStock } from './lib/ai.js'
import { detectCountry, getCountry } from './lib/locations.js'
import * as store from './lib/storage.js'
import { readQueryFromUrl, writeQueryToUrl, clearQueryFromUrl } from './lib/url.js'
import { currentRoute } from './lib/router.js'

const LOADING_STEP_MS = 1100
const TOTAL_LOADING_STEPS = 4

export default function App() {
  /* -- Search inputs ------------------------------------------------------- */
  const [product, setProduct] = useState('')
  const [countryCode, setCountryCode] = useState(detectCountry)
  const [area, setArea] = useState(() => getCountry(detectCountry()).areas[0])
  // The auto-detection hint is only truthful until the user overrides it.
  const [detected, setDetected] = useState(true)

  /* -- Results ------------------------------------------------------------- */
  const [view, setView] = useState('home') // 'home' | 'results'
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [notice, setNotice] = useState('')

  /* -- Shell --------------------------------------------------------------- */
  const [theme, setThemeState] = useState(store.getTheme)
  const [route, setRoute] = useState(currentRoute)
  const [recents, setRecents] = useState(store.getRecents)
  const [saved, setSaved] = useState(store.getSaved)
  const [toast, setToast] = useState(null)

  // Lets a new search cancel an in-flight one.
  const abortRef = useRef(null)

  useEffect(() => {
    store.setTheme(theme)
  }, [theme])

  // Run a deep-linked search on first load, and keep the back/forward buttons
  // moving between the landing view and a search.
  useEffect(() => {
    const initial = currentRoute() === 'home' ? readQueryFromUrl() : null
    if (initial) runSearch(initial, { fromHistory: true })

    const onPopState = () => {
      const nextRoute = currentRoute()
      setRoute(nextRoute)
      if (nextRoute !== 'home') return

      const query = readQueryFromUrl()
      if (query) runSearch(query, { fromHistory: true })
      else handleGoHome({ fromHistory: true })
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setDetected(false)
  }, [])

  const runSearch = useCallback(
    async (query, { fromHistory = false } = {}) => {
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

      // Reflect the search in the address bar so it can be shared or bookmarked.
      // Navigations that came *from* history must not push another entry.
      if (!fromHistory) writeQueryToUrl(trimmed)

      setProduct(trimmed.product)
      setCountryCode(trimmed.countryCode)
      setArea(trimmed.area)

      setView('results')
      setLoading(true)
      setNotice('')
      setResult(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      const response = await findStock(trimmed, { signal: controller.signal })

      // A superseded request must not overwrite the newer one's results.
      if (controller.signal.aborted) return

      setResult(response.data)
      setNotice(response.error || '')
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

  const handleToggleSave = useCallback((id) => {
    setSaved(store.toggleSaved(id))
  }, [])

  const handleGoHome = useCallback(({ fromHistory = false } = {}) => {
    abortRef.current?.abort()
    if (!fromHistory) clearQueryFromUrl()
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

  if (route === 'setup') return <SetupApi />

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        theme={theme}
        onToggleTheme={() => setThemeState((t) => (t === 'dark' ? 'light' : 'dark'))}
        onGoHome={() => handleGoHome()}
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
            onBack={() => handleGoHome()}
            onRetry={handleSearch}
            searchProps={searchProps}
            saved={saved}
            onToggleSave={handleToggleSave}
            onToast={setToast}
          />
        )}
      </main>

      <Footer />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
