/**
 * OpenRouter client for `nvidia/nemotron-3-super-120b-a12b:free`.
 *
 * OpenRouter's free-model roster changes without notice — providers retire or
 * re-price a `:free` slug and the API starts returning a 4xx telling you to
 * switch to the paid version (this happened to the Qwen model this app used
 * to call). If that happens again, swap MODEL below for another entry from
 * https://openrouter.ai/api/v1/models whose id ends in `:free` and whose
 * `supported_parameters` includes `response_format` — this app always asks
 * for `response_format: { type: 'json_object' }`, and a model that doesn't
 * support it will reliably reply with prose our parser then has to guess at.
 *
 * The app is a static site, so the request goes straight from the browser to
 * OpenRouter using a key the user supplies (stored only in their own
 * localStorage). A build-time `VITE_OPENROUTER_API_KEY` is also honoured for
 * private deployments.
 *
 * This client NEVER fabricates results. If a key is missing, the request
 * fails, or the model's reply can't be parsed, `findStock` returns no data and
 * a plain-language reason — the UI shows an honest error state instead of
 * inventing stores. Real listings only ever come from a real model response.
 */

import { getApiKey } from './storage.js'
import { getCountry } from './locations.js'
import { extractJson, normalize } from './parse.js'

export const MODEL = 'nvidia/nemotron-3-super-120b-a12b:free'
const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const TIMEOUT_MS = 45000

/** Resolves the key from user settings first, then the build-time env var. */
function resolveApiKey() {
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

/** Maps an HTTP status from OpenRouter to a message a user can act on. */
function describeHttpError(status, body) {
  if (status === 401) return 'The configured OpenRouter key was rejected. Update it at /setup-api.'
  if (status === 402) return 'The OpenRouter account behind this site is out of credit for this model.'
  if (status === 429) return 'Rate limited by OpenRouter — the free model is busy. Try again shortly.'
  if (status >= 500) return 'OpenRouter is having trouble right now. Try again in a moment.'
  const detail = body?.error?.message
  return detail ? `OpenRouter error: ${detail}` : `Request failed (HTTP ${status}).`
}

/**
 * Runs a stock lookup against the live model. Always resolves — never
 * rejects — with `{ data, error }`:
 *
 *   - success:      { data: <normalized result>, error: null }
 *   - any failure:  { data: null, error: '<plain-language reason>' }
 *
 * There is no fallback data path. A failed or unconfigured lookup returns no
 * stores at all, so the caller can show a genuine error state rather than
 * display anything invented.
 */
export async function findStock(query, { signal } = {}) {
  const apiKey = resolveApiKey()

  if (!apiKey) {
    return {
      data: null,
      error: 'Live lookups are not configured for this site yet. Set an API key at /setup-api.',
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
    if (!parsed) throw new Error('The AI response could not be read as JSON. Try again.')

    return { data: normalize(parsed, query), error: null }
  } catch (error) {
    // A user-initiated cancel is not a failure worth reporting.
    if (error.name === 'AbortError' && signal?.aborted) {
      return { data: null, error: null, cancelled: true }
    }

    // `fetch` itself throws a raw browser TypeError ("Failed to fetch",
    // "NetworkError when attempting to fetch resource") for anything from a
    // dropped connection to a CORS failure — never useful to show verbatim.
    // Every message *we* threw above (describeHttpError, the JSON-parse
    // failure) is a plain Error, so this distinguishes "our words" from
    // "the browser's words" without an allowlist of exact strings.
    const message =
      error.name === 'AbortError'
        ? 'The AI took too long to respond. Try again.'
        : error instanceof TypeError
          ? 'Could not reach OpenRouter — check your connection and try again.'
          : error.message || 'Could not reach the AI service. Try again.'

    return { data: null, error: message }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}
