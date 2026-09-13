/**
 * Parsing and normalisation of raw model output.
 *
 * Kept separate from the network client so it can be exercised directly by
 * tests — this is the layer most likely to meet malformed input, since the
 * model is free to wrap its JSON in prose, fences or stray commentary.
 */

import { getCountry } from './locations.js'

/**
 * Pulls a JSON object out of a model response that may be wrapped in prose or
 * markdown fences. Returns null if nothing parseable is present.
 */
export function extractJson(text) {
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
export function normalize(raw, query) {
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

