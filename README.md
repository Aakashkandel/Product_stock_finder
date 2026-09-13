# StockScout — AI-Powered Local Product Stock Finder

Find out which shops near you actually have the thing you want, before you
drive there. StockScout is a **fully static** React site: no backend, no
database, no accounts. A user types a product, picks their country and
district, and an AI model estimates local availability, prices and opening
hours, then links straight into Maps.

![Stack](https://img.shields.io/badge/React-19-149eca) ![Vite](https://img.shields.io/badge/Vite-6-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
```

There is no fake or sample data mode. Until a real API key is configured,
searches show a plain "not configured yet" message with a link to
[API key setup](#api-key-setup) — never invented stores.

```bash
npm run build    # static output in dist/
npm run preview  # serve the production build
```

---

## How it works

```
User query ─► buildUserPrompt() ─► OpenRouter (nvidia/nemotron-3-super-120b-a12b:free)
                                          │
                                          ▼
                          extractJson() ─► normalize() ─► StoreCard[]
                                          │
                                   (any failure)
                                          ▼
                              honest error state, no stores shown
```

The AI is asked for one strict JSON object. Because models don't always
comply, `src/lib/parse.js` handles the output defensively:

- unwraps ```` ```json ```` fences and strips prose before/after the object
- coerces prices like `"$1,299.00"` or `"499 GBP"` into numbers
- clamps confidence to 0–100 and maps unknown statuses to `unknown`
- drops malformed stores rather than letting one crash a card

**Real data or nothing — never fake data.** No key, a bad key, a rate limit, a
timeout, a network failure or unparseable output all show the same thing: a
plain-language explanation of what went wrong and a "Try again" button. There
is no synthetic fallback data anywhere in the app; a result you see always
came from a live model response.

### API key setup

The key is configured at **`/setup-api`**, behind a username and password.

```bash
npm run hash-password 'your-password'     # prints the two env values
```

Put them in `.env` (or your host's environment variables) and rebuild:

```
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD_HASH=<the printed digest>
```

Until those are set, `/setup-api` stays locked and nobody — including you —
can reach the key form.

**What the gate is and is not.** This is a static site with no server, so the
sign-in keeps the form away from visitors; it is not a vault. The password
itself is never shipped, only its SHA-256 digest, and a key saved through the
page lives in that browser's `localStorage` alone — it is never served to
anyone else. A build-time `VITE_OPENROUTER_API_KEY` is also honoured, but it
compiles into the public bundle, so use it only for private deployments.

---

## Features

**Search**
- Country auto-detected from the IANA time zone, with a browser-locale fallback
- 10 countries, each with its own currency, distance unit and curated districts
- Area combobox: filters popular districts, but accepts any free-text location
- Popular-product chips and localStorage-backed recent searches

**Results**
- Store cards with availability badge, estimated price, distance, address,
  hours and an AI-confidence meter
- **Open now / Closing in Nm / Closed** computed against the actual clock from
  the model's free-text hours (handles 12h, 24h and overnight ranges)
- Filter by availability, sort by price, distance or availability
- "Best price" ribbon on the cheapest in-stock store
- One-tap directions straight into Google Maps (opens the native app on mobile)
- Copy address, save favourites, share a search link

**Craft**
- Light and dark themes, applied before first paint (no flash)
- Deep-linkable searches (`?q=…&country=…&area=…`) with working back/forward
- Skeleton loading that mirrors card geometry, so nothing jumps
- Keyboard-accessible combobox, `aria-live` status, visible focus rings
- `prefers-reduced-motion` respected throughout

**Monetisation**
- Marked `.ad-slot` placeholders (leaderboard, in-feed, sidebar) with reserved
  height so a real ad causes no layout shift. Drop an AdSense snippet into
  `src/components/AdSlot.jsx`.

---

## Project structure

```
src/
├── App.jsx                  state orchestration, routing, URL sync
├── index.css                design tokens, themes, animations (Tailwind v4)
├── lib/
│   ├── ai.js                OpenRouter client, prompt, error mapping
│   ├── parse.js             JSON extraction + normalisation  (pure, tested)
│   ├── locations.js         countries, districts, timezone detection
│   ├── format.js            currency, distance, opening-hours logic
│   ├── maps.js              Google Maps directions, clipboard
│   ├── storage.js           guarded localStorage wrapper
│   └── url.js               search state <-> query string
└── components/              Header, Hero, SearchPanel, AreaCombobox,
                             ResultsView, StoreCard, FilterBar, SetupApi, …
```

---

## Deploying

Any static host works. Because `/setup-api` is a real path, every unknown path
must fall back to `index.html` — `public/_redirects` (Netlify), `vercel.json`
(Vercel) and a generated `dist/404.html` (GitHub Pages) all ship with the repo,
so this works out of the box.

| Host | Setup |
|---|---|
| **Vercel / Netlify** | Build `npm run build`, publish directory `dist` |
| **GitHub Pages** | `BASE_PATH=/your-repo/ npm run build`, then push `dist/` to `gh-pages` |
| **Cloudflare Pages** | Build `npm run build`, output `dist` |

---

## Accuracy

StockScout shows **AI-estimated** availability inferred from typical retail
stocking patterns — it is not a live inventory feed and is not affiliated with
any retailer. Always call ahead before making a special trip. The UI says this
in the hero, the footer and on every confidence meter.

## Licence

MIT
