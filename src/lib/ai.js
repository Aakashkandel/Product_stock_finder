/**
 * OpenRouter client for `qwen/qwen-2.5-72b-instruct:free`.
 *
 * The app is a static site, so the request goes straight from the browser to
 * OpenRouter using a key the user supplies (stored only in their own
 * localStorage). A build-time `VITE_OPENROUTER_API_KEY` is also honoured for
 * private deployments.
 *
 * Every failure path falls back to deterministic demo data, so a search always
 * renders something useful.
 */

import { getApiKey } from './storage.js'
import { getCountry } from './locations.js'
import { generateMockResults } from './mockData.js'

export const MODEL = 'qwen/qwen-2.5-72b-instruct:free'
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const TIMEOUT_MS = 45000

/** Resolves the key from user settings first, then the build-time env var. */
export function resolveApiKey() {
  return getApiKey() || import.meta.env.VITE_OPENROUTER_API_KEY || ''
}

export function hasApiKey() {
  return Boolean(resolveApiKey())
}

const SYSTEM_PROMPT = `You are a local retail inventory intelligence agent.

Given a product, a country and a neighbourhood/shopping district, identify the retail chains, independent shops and shopping centres in THAT SPECIFIC AREA that realistically carry the product, and estimate current availability from typical stocking patterns.

Rules:
- Only name retailers that plausibly operate in the given country and area. Never invent international chains that do not trade there.
- Addresses must look like real local addresses for that district.
- Prices must be plain numbers in the country's own currency, with no symbols, no thousands separators, and no currency codes.
- Be honest with "confidence": these are estimates, not a live inventory feed.
- Return 5 to 7 stores, ordered most useful first.
- Respond with ONE JSON object and nothing else. No prose, no markdown fences.

Schema:
{
  "summary": "2-sentence overview of availability for this product in this area",
  "tip": "one short, genuinely useful buying tip for this product and area",
  "stores": [
    {
      "name": "Retailer name",
      "branch": "Branch or mall name",
      "address": "Street address, district",
      "status": "in_stock" | "low_stock" | "out_of_stock",
      "quantityHint": "short phrase e.g. '3 left' or 'Well stocked'",
      "price": 499,
      "hours": "9:00 AM - 9:00 PM",
      "phone": "local phone number or null",
      "distanceKm": 2.4,
      "confidence": 78,
      "note": "one sentence of practical context"
    }
  ]
}`

function buildUserPrompt({ product, countryCode, area }) {
  const country = getCountry(countryCode)
  return `Product: ${product}
Country: ${country.name} (${country.code})
Area / district: ${area}
Currency for all prices: ${country.currency}
Distance unit preferred by user: ${country.unit}
Local date: ${new Date().toISOString().slice(0, 10)}

Find where this product is in stock in this area right now.`
}

/**
 * Pulls a JSON object out of a model response that may be wrapped in prose or
 * markdown fences. Returns null if nothing parseable is present.
 */
function extractJson(text) {
  if (!text) return null

  const attempts = []
  attempts.push(text.trim())

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) attempts.push(fenced[1].trim())

  // Widest brace span — handles leading/trailing chatter.
  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first !== -1 && last > first) attempts.push(text.slice(first, last + 1))

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed && typeof parsed === 'object') return parsed
    } catch {
      /* try the next candidate */
    }
  }
  return null
}

const VALID_STATUS = new Set(['in_stock', 'low_stock', 'out_of_stock'])

/** Coerces a model price ("$1,299.00", "1299 USD") into a number. */
function toNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d.]/g, '')
  const n = parseFloat(cleaned)
  return Number.isFinite(n) ? n : null
}

/**
 * Normalises raw model output into the exact shape the UI renders.
 * Anything malformed is dropped rather than allowed to crash a card.
 */
function normalize(raw, query) {
  const country = getCountry(query.countryCode)
  const rawStores = Array.isArray(raw?.stores) ? raw.stores : []

  const stores = rawStores
    .filter((s) => s && typeof s.name === 'string' && s.name.trim())
    .map((s) => {
      const status = VALID_STATUS.has(s.status) ? s.status : 'unknown'
      const confidence = toNumber(s.confidence)
      return {
        name: String(s.name).trim(),
        branch: s.branch ? String(s.branch).trim() : '',
        address: s.address ? String(s.address).trim() : query.area,
        status,
        quantityHint: s.quantityHint ? String(s.quantityHint).trim() : '',
        price: toNumber(s.price),
        hours: s.hours ? String(s.hours).trim() : '',
        phone: s.phone ? String(s.phone).trim() : null,
        distanceKm: toNumber(s.distanceKm),
        confidence: confidence === null ? null : Math.max(0, Math.min(100, Math.round(confidence))),
        note: s.note ? String(s.note).trim() : '',
      }
    })

  if (!stores.length) throw new Error('The model returned no usable store data.')

  return {
    demo: false,
    query,
    summary: typeof raw.summary === 'string' ? raw.summary.trim() : '',
    tip: typeof raw.tip === 'string' ? raw.tip.trim() : '',
    stores,
    generatedAt: Date.now(),
    currency: country.currency,
  }
}

/** Maps an HTTP status from OpenRouter to a message a user can act on. */
function describeHttpError(status, body) {
  if (status === 401) return 'That OpenRouter key was rejected. Check it in Settings.'
  if (status === 402) return 'Your OpenRouter account is out of credit for this model.'
  if (status === 429) return 'Rate limited by OpenRouter — the free model is busy. Try again shortly.'
  if (status >= 500) return 'OpenRouter is having trouble right now. Try again in a moment.'
  const detail = body?.error?.message
  return detail ? `OpenRouter error: ${detail}` : `Request failed (HTTP ${status}).`
}

/**
 * Runs a stock lookup.
 *
 * Always resolves — never rejects — with `{ data, usedFallback, notice }` so
 * the caller can render results and explain any degradation in one pass.
 */
export async function findStock(query, { signal } = {}) {
  const apiKey = resolveApiKey()

  if (!apiKey) {
    return {
      data: generateMockResults(query),
      usedFallback: true,
      notice: 'Showing demo results — add a free OpenRouter API key in Settings for real AI lookups.',
    }
  }

  // Combine the caller's cancel signal with our own timeout.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        // OpenRouter uses these for attribution on free-tier models.
        'HTTP-Referer': window.location.origin,
        'X-Title': 'StockScout',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildUserPrompt(query) },
        ],
        temperature: 0.4,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => null)
      throw new Error(describeHttpError(response.status, body))
    }

    const payload = await response.json()
    const content = payload?.choices?.[0]?.message?.content
    const parsed = extractJson(content)
    if (!parsed) throw new Error('The AI response could not be read as JSON.')

    return { data: normalize(parsed, query), usedFallback: false, notice: '' }
  } catch (error) {
    // A user-initiated cancel is not an error worth reporting.
    if (error.name === 'AbortError' && signal?.aborted) {
      return { data: null, usedFallback: false, notice: '', cancelled: true }
    }

    const message =
      error.name === 'AbortError'
        ? 'The AI took too long to respond.'
        : error.message || 'Could not reach the AI service.'

    return {
      data: generateMockResults(query),
      usedFallback: true,
      notice: `${message} Showing demo results instead.`,
    }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}
