/**
 * Demo-mode data generator.
 *
 * Used when no OpenRouter key is configured, or when the API call fails, so
 * the app is never a dead end. Results are *deterministic* for a given
 * query — the same search always produces the same stores, which makes demo
 * mode feel like a real lookup rather than random noise.
 */

import { getCountry } from './locations.js'

/** Small string hash → 32-bit int. Same input, same output, every time. */
function hash(str) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

/** Deterministic PRNG seeded from the query. */
function seeded(seed) {
  let s = seed || 1
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

/** Retail chains that plausibly exist per country, plus generic independents. */
const CHAINS = {
  US: ['Best Buy', 'Target', 'Walmart Supercenter', 'Costco Wholesale', 'B&H Photo', 'Micro Center'],
  CA: ['Best Buy Canada', 'Canadian Tire', 'Walmart Canada', 'The Source', 'London Drugs'],
  GB: ['Currys', 'Argos', 'John Lewis', 'Tesco Extra', 'Selfridges'],
  AU: ['JB Hi-Fi', 'Harvey Norman', 'Officeworks', 'Big W', 'The Good Guys'],
  IN: ['Croma', 'Reliance Digital', 'Vijay Sales', 'Sangeetha Mobiles', 'Chroma Express'],
  NP: ['Daraz Hub', 'CG Digital', 'Neoteric Nepal', 'Oliz Store', 'Evolution Nepal'],
  AE: ['Sharaf DG', 'Jumbo Electronics', 'Emax', 'Carrefour', 'Virgin Megastore'],
  SG: ['Challenger', 'Harvey Norman SG', 'Courts', 'Best Denki'],
  DE: ['MediaMarkt', 'Saturn', 'Expert', 'Conrad Electronic'],
  ZA: ['Incredible Connection', 'Game', 'Makro', 'HiFi Corp'],
}

const GENERIC = ['Electronics Hub', 'City Superstore', 'The Gadget Room', 'Corner Retail Co.', 'Prime Outlet']

const STREETS = ['High Street', 'Market Road', 'Central Avenue', 'Station Road', 'Park Lane', 'Commerce Street']

/** Rough base price bands inferred from keywords in the product name. */
function basePrice(product) {
  const p = product.toLowerCase()
  const bands = [
    [/iphone|galaxy s|pixel \d|macbook|laptop|oled|playstation|xbox|camera/, 899],
    [/ipad|tablet|switch|monitor|dyson|espresso|drone/, 449],
    [/airpods|headphone|earbud|watch|speaker|keyboard|router/, 199],
    [/shoe|sneaker|jacket|backpack|lego|cookware/, 99],
    [/bottle|mug|charger|cable|toy|book|grocer/, 29],
  ]
  for (const [re, price] of bands) if (re.test(p)) return price
  return 149
}

/** Currency multipliers so demo prices land in a believable local range. */
const FX = { US: 1, CA: 1.36, GB: 0.79, AU: 1.52, IN: 84, NP: 134, AE: 3.67, SG: 1.35, DE: 0.92, ZA: 18.5 }

export function generateMockResults({ product, countryCode, area }) {
  const country = getCountry(countryCode)
  const rand = seeded(hash(`${product}|${countryCode}|${area}`))

  const pool = [...(CHAINS[countryCode] || []), ...GENERIC]
  const count = 5 + Math.floor(rand() * 3) // 5–7 stores
  const usd = basePrice(product)
  const fx = FX[countryCode] || 1

  // Weighted status draw: mostly in stock, some low, occasionally out.
  const drawStatus = () => {
    const r = rand()
    if (r < 0.5) return 'in_stock'
    if (r < 0.82) return 'low_stock'
    return 'out_of_stock'
  }

  const used = new Set()
  const stores = Array.from({ length: count }, (_, i) => {
    // Pick a distinct retailer from the pool.
    let name = pool[Math.floor(rand() * pool.length)]
    let guard = 0
    while (used.has(name) && guard++ < 12) name = pool[Math.floor(rand() * pool.length)]
    used.add(name)

    const status = drawStatus()
    const variance = 0.88 + rand() * 0.3 // ±~15% price spread between stores
    const price = Math.round(usd * fx * variance * (countryCode === 'IN' || countryCode === 'NP' ? 1 : 100)) /
      (countryCode === 'IN' || countryCode === 'NP' ? 1 : 100)

    const openHour = 8 + Math.floor(rand() * 3)
    const closeHour = 19 + Math.floor(rand() * 4)

    return {
      name,
      branch: area.split(',')[0].trim(),
      address: `${10 + Math.floor(rand() * 280)} ${STREETS[Math.floor(rand() * STREETS.length)]}, ${area}`,
      status,
      quantityHint:
        status === 'in_stock'
          ? `${4 + Math.floor(rand() * 20)}+ units`
          : status === 'low_stock'
            ? `${1 + Math.floor(rand() * 3)} left`
            : 'Restock expected',
      price,
      hours: `${openHour}:00 AM - ${closeHour - 12}:00 PM`,
      phone: null,
      distanceKm: Math.round((0.4 + rand() * 11) * 10) / 10,
      confidence: Math.round((status === 'in_stock' ? 0.72 : 0.55) * 100 + rand() * 22),
      note:
        status === 'out_of_stock'
          ? 'Typically restocked within a week — worth calling ahead.'
          : status === 'low_stock'
            ? 'Limited shelf stock; consider reserving online for pickup.'
            : 'Usually well stocked at this branch.',
    }
  })

  const available = stores.filter((s) => s.status !== 'out_of_stock')
  const cheapest = available.length
    ? available.reduce((a, b) => (a.price < b.price ? a : b))
    : null

  return {
    demo: true,
    query: { product, countryCode, area },
    summary:
      `Demo results for "${product}" around ${area}. ` +
      (cheapest
        ? `${available.length} of ${stores.length} nearby stores show availability, with the best price at ${cheapest.name}.`
        : 'No nearby store is showing availability right now.'),
    tip: 'Add your free OpenRouter key in Settings to run a real AI lookup against live retail knowledge.',
    stores,
    generatedAt: Date.now(),
    currency: country.currency,
  }
}
