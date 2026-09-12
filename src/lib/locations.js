/**
 * Location catalog.
 *
 * Static, client-side dataset of supported countries and the popular shopping
 * districts within each. Kept here (rather than fetched) so the app stays a
 * pure static site with zero backend.
 */

export const COUNTRIES = [
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    locale: 'en-US',
    unit: 'mi',
    areas: [
      'Manhattan, New York',
      'Brooklyn, New York',
      'Downtown Los Angeles',
      'Santa Monica, CA',
      'The Loop, Chicago',
      'Downtown Austin',
      'Midtown Atlanta',
      'Downtown Seattle',
      'South Beach, Miami',
      'Downtown San Francisco',
      'Back Bay, Boston',
      'Downtown Denver',
    ],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'C$',
    locale: 'en-CA',
    unit: 'km',
    areas: [
      'Downtown Toronto',
      'Yorkville, Toronto',
      'Downtown Vancouver',
      'Metrotown, Burnaby',
      'Downtown Montreal',
      'ByWard Market, Ottawa',
      'Downtown Calgary',
      'Whyte Avenue, Edmonton',
    ],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    symbol: '£',
    locale: 'en-GB',
    unit: 'mi',
    areas: [
      'Oxford Street, London',
      'Westfield Stratford, London',
      'Canary Wharf, London',
      'Manchester Arndale',
      'Birmingham Bullring',
      'Princes Street, Edinburgh',
      'Leeds City Centre',
      'Bristol Cabot Circus',
    ],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$',
    locale: 'en-AU',
    unit: 'km',
    areas: [
      'Sydney CBD',
      'Bondi Junction, Sydney',
      'Melbourne CBD',
      'Chadstone, Melbourne',
      'Brisbane CBD',
      'Perth CBD',
      'Adelaide CBD',
    ],
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    locale: 'en-IN',
    unit: 'km',
    areas: [
      'Connaught Place, Delhi',
      'Saket, Delhi',
      'Bandra West, Mumbai',
      'Lower Parel, Mumbai',
      'Indiranagar, Bengaluru',
      'Koramangala, Bengaluru',
      'T. Nagar, Chennai',
      'Banjara Hills, Hyderabad',
      'Park Street, Kolkata',
      'Koregaon Park, Pune',
    ],
  },
  {
    code: 'NP',
    name: 'Nepal',
    flag: '🇳🇵',
    currency: 'NPR',
    symbol: 'रू',
    locale: 'en-NP',
    unit: 'km',
    areas: [
      'New Road, Kathmandu',
      'Thamel, Kathmandu',
      'Durbarmarg, Kathmandu',
      'Baneshwor, Kathmandu',
      'Lalitpur (Patan)',
      'Bhaktapur',
      'Lakeside, Pokhara',
      'Biratnagar',
    ],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED',
    locale: 'en-AE',
    unit: 'km',
    areas: [
      'Dubai Marina',
      'Downtown Dubai',
      'Deira, Dubai',
      'Al Barsha, Dubai',
      'Abu Dhabi Corniche',
      'Sharjah City Centre',
    ],
  },
  {
    code: 'SG',
    name: 'Singapore',
    flag: '🇸🇬',
    currency: 'SGD',
    symbol: 'S$',
    locale: 'en-SG',
    unit: 'km',
    areas: [
      'Orchard Road',
      'Marina Bay',
      'Bugis',
      'Jurong East',
      'Tampines',
    ],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    symbol: '€',
    locale: 'de-DE',
    unit: 'km',
    areas: [
      'Mitte, Berlin',
      'Kurfürstendamm, Berlin',
      'Zeil, Frankfurt',
      'Marienplatz, Munich',
      'Königsallee, Düsseldorf',
      'Mönckebergstraße, Hamburg',
    ],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    symbol: 'R',
    locale: 'en-ZA',
    unit: 'km',
    areas: [
      'Sandton, Johannesburg',
      'Rosebank, Johannesburg',
      'V&A Waterfront, Cape Town',
      'Umhlanga, Durban',
      'Pretoria CBD',
    ],
  },
]

/** Map of IANA timezone → country code, for zero-permission detection. */
const TIMEZONE_COUNTRY = {
  'America/New_York': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Los_Angeles': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'America/Toronto': 'CA',
  'America/Vancouver': 'CA',
  'America/Edmonton': 'CA',
  'America/Winnipeg': 'CA',
  'America/Halifax': 'CA',
  'Europe/London': 'GB',
  'Europe/Belfast': 'GB',
  'Australia/Sydney': 'AU',
  'Australia/Melbourne': 'AU',
  'Australia/Brisbane': 'AU',
  'Australia/Perth': 'AU',
  'Australia/Adelaide': 'AU',
  'Asia/Kolkata': 'IN',
  'Asia/Calcutta': 'IN',
  'Asia/Kathmandu': 'NP',
  'Asia/Dubai': 'AE',
  'Asia/Singapore': 'SG',
  'Europe/Berlin': 'DE',
  'Europe/Munich': 'DE',
  'Africa/Johannesburg': 'ZA',
}

export const DEFAULT_COUNTRY = 'US'

export function getCountry(code) {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0]
}

/**
 * Best-effort country detection with no permission prompt.
 * Tries the IANA timezone first, then the browser locale's region subtag.
 */
export function detectCountry() {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (tz && TIMEZONE_COUNTRY[tz]) return TIMEZONE_COUNTRY[tz]

    const locale = navigator.language || ''
    const region = locale.split('-')[1]
    if (region) {
      const match = COUNTRIES.find((c) => c.code === region.toUpperCase())
      if (match) return match.code
    }
  } catch {
    /* Intl unavailable — fall through */
  }
  return DEFAULT_COUNTRY
}

/** Product ideas shown as one-tap chips on the landing view. */
export const PRODUCT_SUGGESTIONS = [
  'iPhone 17 Pro',
  'PlayStation 5 Slim',
  'Dyson V15 Detect',
  'AirPods Pro 3',
  'Nintendo Switch 2',
  'Lego Icons Set',
  'Nike Air Force 1',
  'Instant Pot Duo',
  'Samsung 65" OLED TV',
  'Stanley Quencher 40oz',
]
