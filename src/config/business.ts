/**
 * The business, as one object.
 *
 * Everything on the site reads from here: the header, the hours block, the
 * review link, the JSON-LD, the sitemap, llms.txt. One fact lives in one place,
 * so a client who changes their phone number changes it once.
 *
 * MOST OF THIS IS GENERATED. `pnpm pull-gbp` rewrites everything between the
 * `pull-gbp:begin business` and `pull-gbp:end business` markers below, taking
 * the fields marked `@gbp` from the client's Google Business Profile and
 * carrying the fields marked `@manual` through untouched. Hand-editing a
 * `@gbp` field is fine for a one-off but the next pull wins.
 *
 * The placeholder values below are deliberately obvious. A site that ships
 * with "Placeholder Co" on it is embarrassing; a site that ships with a
 * plausible-looking fake address is worse, because nobody notices.
 */

export interface BusinessHours {
  /** 0 = Sunday, matching JS getDay() so nothing has to be remapped. */
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 24h "HH:MM". Ignored when `closed`. */
  open: string
  close: string
  closed?: boolean
}

export interface BusinessProfile {
  /** @gbp */ name: string
  /** @gbp — Google's own category, e.g. "Auto repair shop". */ category: string
  /** @gbp */ description: string
  /** @gbp */ phone: string
  /** @manual — the inbox leads should reach. GBP does not expose one. */ email: string
  /** @gbp */ address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  /** @gbp */ geo: { lat: number; lng: number } | null
  /** @gbp */ hours: BusinessHours[]
  /** @gbp — what the shop actually does, straight off the profile. */ services: string[]
  /** @gbp */ rating: { value: number; count: number } | null
  /** @gbp — Google's own "write a review" link (metadata.newReviewUri). */ reviewUrl: string
  /** @gbp */ mapsUrl: string
  /** @gbp */ placeId: string
  /** @manual — the live domain. Drives canonical URLs and the sitemap. */ siteUrl: string
  /** @manual */ social: { facebook?: string; instagram?: string; yelp?: string }

  /** @manual — "Family owned since 1979" outperforms any adjective. */
  yearEstablished: number | null
  /**
   * @manual — every shop site worth copying leads with its warranty, because
   * it is the one claim a customer cannot get from the dealer for less.
   */
  warranty: { months: number; miles: number } | null
  /**
   * @manual — loaner, shuttle, night drop, wifi. These decide which of three
   * shops gets the call far more often than anything about the mechanics.
   */
  amenities: string[]
  /** @manual — ASE, NAPA AutoCare, AAA, BBB. Third-party trust, not our words. */
  certifications: string[]
  /**
   * @manual — a live coupon. Empty array means the offer block does not render
   * at all, rather than showing an expired or invented discount.
   */
  specials: { title: string; detail: string; terms?: string }[]
  /**
   * @manual — the surrounding towns this shop actually serves. Feeds areaServed
   * in the schema, which is how a local business shows up for a neighbouring
   * town it has no address in.
   */
  serviceAreas: string[]
}

const PLACEHOLDER = 'REPLACE ME'

// pull-gbp:begin business
export const business: BusinessProfile = {
  name: 'Demo Auto Repair',
  category: 'Auto repair shop',
  description:
    'Independent auto repair serving the area for over twenty years. Honest diagnostics, work explained before it starts, and no upsells on things you do not need.',
  phone: '(216) 555-0148',
  email: 'service@example.com',
  address: {
    street: '000 Placeholder Ave',
    city: 'Your City',
    state: 'OH',
    postalCode: '00000',
    country: 'US',
  },
  geo: null,
  hours: [
    { day: 0, open: '00:00', close: '00:00', closed: true },
    { day: 1, open: '08:00', close: '18:00' },
    { day: 2, open: '08:00', close: '18:00' },
    { day: 3, open: '08:00', close: '18:00' },
    { day: 4, open: '08:00', close: '18:00' },
    { day: 5, open: '08:00', close: '17:00' },
    { day: 6, open: '09:00', close: '14:00' },
  ],
  services: [
    'Brakes and rotors',
    'Check engine diagnostics',
    'Oil and filter',
    'Suspension and steering',
    'Tires and alignment',
    'Batteries and charging',
    'Heating and A/C',
    'Pre-purchase inspection',
  ],
  rating: null,
  reviewUrl: '',
  mapsUrl: '',
  placeId: '',
  siteUrl: 'https://example.com',
  social: {},
  yearEstablished: null,
  warranty: { months: 36, miles: 36000 },
  amenities: [
    'Courtesy loaner cars',
    'Free local shuttle',
    'After-hours night drop',
    'Free wifi and coffee',
    'Comfortable waiting area',
  ],
  certifications: ['ASE Certified', 'NAPA AutoCare Center'],
  specials: [],
  serviceAreas: [],
}
// pull-gbp:end business

/** True when the profile still carries shipped-from-the-template values. */
export function isPlaceholder(): boolean {
  return (
    business.address.postalCode === '00000' ||
    business.name.startsWith('Demo ') ||
    business.reviewUrl === '' ||
    business.description.includes(PLACEHOLDER)
  )
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function dayName(day: number): string {
  return DAY_NAMES[day] ?? ''
}

/** "8:00 AM" from "08:00". Locale-free so server and client always agree. */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return m === 0 ? `${hour} ${period}` : `${hour}:${String(m).padStart(2, '0')} ${period}`
}

export function fullAddress(): string {
  const a = business.address
  return `${a.street}, ${a.city}, ${a.state} ${a.postalCode}`
}

/** E.164-ish tel: href. Strips everything a human types into a phone field. */
export function phoneHref(): string {
  const digits = business.phone.replace(/\D/g, '')
  return `tel:+${digits.length === 10 ? '1' : ''}${digits}`
}

/**
 * Review routing.
 *
 * `minStarsToGoogle` is the threshold at or above which a customer is sent
 * straight to the Google review form. Anything below it is routed to an
 * internal feedback form instead, and the owner is texted.
 *
 * READ THIS BEFORE CHANGING IT. Routing only happy customers to Google is
 * "review gating". Google's prohibited-content policy names it explicitly and
 * they disable the review function on listings that do it; the FTC's 2024
 * rule on consumer reviews treats suppressing negatives as a per-violation
 * matter. This is deliberately one number rather than a hardcoded branch so
 * that the behaviour can be switched off everywhere at once:
 *
 *   minStarsToGoogle: 1   → every customer reaches Google. Compliant.
 *   minStarsToGoogle: 4   → 1-3 stars are intercepted.
 *   minStarsToGoogle: 5   → only 5 stars reach Google. Maximum exposure.
 *
 * Set by the operator, per their own risk. The internal form is worth keeping
 * at any threshold: it is the service-recovery channel, and offering it
 * alongside a Google link rather than instead of one is the compliant shape.
 */
export const reviewGate = {
  minStarsToGoogle: 5 as 1 | 2 | 3 | 4 | 5,
}
