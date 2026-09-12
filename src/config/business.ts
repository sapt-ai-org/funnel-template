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

import type { Badge } from './trust'

export interface BusinessHours {
  /** 0 = Sunday, matching JS getDay() so nothing has to be remapped. */
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** 24h "HH:MM". Ignored when `closed`. */
  open: string
  close: string
  closed?: boolean
}

export interface Review {
  /** "Maria G." Surname cut to an initial by pull-gbp. */
  author: string
  rating: number
  text: string
  /** "2026-08". Month, not day: the page is static and "2 days ago" goes stale. */
  date: string
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
  /**
   * @gbp — recent four and five star Google reviews with something written,
   * chosen by `pickReviews` in pull-gbp. Never typed by hand: a review on the
   * site that the customer did not write on Google is a fake review.
   */
  reviews: Review[]
  /** @gbp — Google's own "write a review" link (metadata.newReviewUri). */ reviewUrl: string
  /** @gbp */ mapsUrl: string
  /** @gbp */ placeId: string
  /** @manual — the live domain. Drives canonical URLs and the sitemap. */ siteUrl: string
  /**
   * @manual — IANA zone the hours are in, e.g. "America/Chicago". Google's
   * profile does not expose one, and "open now" is wrong without it for any
   * visitor who is not in the shop's own zone.
   */
  timeZone: string
  // The shop's social profiles are `social`, below the pull-gbp markers.

  /** @manual — "Family owned since 1979" outperforms any adjective. */
  yearEstablished: number | null
  /**
   * @manual — who runs it. Captions the portrait in the shop section: an
   * independent shop's strongest advantage over a chain is a named person.
   */
  owner: { name: string; role: string } | null
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
  /**
   * @manual — the third-party programs the shop is actually in: ASE, AAA,
   * BBB, NAPA AutoCare and the rest of the catalog in src/config/trust.ts.
   * Third-party trust, not our words. Add each program's `url` so a customer
   * can check it, and its official `logo` once the owner sends the artwork.
   */
  badges: Badge[]
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
  reviews: [],
  reviewUrl: '',
  mapsUrl: '',
  placeId: '',
  siteUrl: 'https://example.com',
  timeZone: 'America/New_York',
  yearEstablished: null,
  owner: null,
  warranty: { months: 36, miles: 36000 },
  amenities: [
    'Courtesy loaner cars',
    'Free local shuttle',
    'After-hours night drop',
    'Free wifi and coffee',
    'Comfortable waiting area',
  ],
  badges: [
    { program: 'ase' },
    { program: 'aaa' },
    { program: 'bbb' },
    { program: 'napa' },
    { program: 'carfax' },
    { program: 'repairpal' },
    { program: 'michelin' },
    { program: 'goodyear' },
    { program: 'bfgoodrich' },
    { program: 'bridgestone' },
  ],
  specials: [],
  serviceAreas: [],
}
// pull-gbp:end business

export type SocialNetwork = 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin' | 'x' | 'yelp'

/**
 * @manual — the shop's own profiles, one full URL each: an icon in the footer
 * for every one that is filled in, and each is given to search engines as the
 * same business. An empty string shows nothing. Uncomment a network the shop
 * is on and fill it in the same way.
 *
 * Google does not expose these, so they sit outside the pull-gbp markers and
 * a pull never touches them.
 */
export const social: Partial<Record<SocialNetwork, string>> = {
  instagram: '', // https://www.instagram.com/yourshop
  facebook: '', // https://www.facebook.com/yourshop
  youtube: '', // https://www.youtube.com/@yourshop
  tiktok: '', // https://www.tiktok.com/@yourshop
  // linkedin: '', // https://www.linkedin.com/company/yourshop
  // x: '', // https://x.com/yourshop
  // yelp: '', // https://www.yelp.com/biz/yourshop
}

/**
 * What the footer links to on the untouched template, so the row can be seen
 * and judged: each network's home page. Only while `isTemplate()` is true, and
 * never given to search engines.
 */
const SAMPLE_SOCIAL: Partial<Record<SocialNetwork, string>> = {
  instagram: 'https://www.instagram.com/',
  facebook: 'https://www.facebook.com/',
  youtube: 'https://www.youtube.com/',
  tiktok: 'https://www.tiktok.com/',
}

/** The profiles the shop has filled in, in the order above. */
export function socialProfiles(): [SocialNetwork, string][] {
  return (Object.entries(social) as [SocialNetwork, string | undefined][])
    .map(([network, url]): [SocialNetwork, string] => [network, url?.trim() ?? ''])
    .filter(([, url]) => /^https?:\/\//.test(url))
}

/** The footer's icons: the shop's own profiles, or the samples while the site is the template. */
export function socialLinks(): [SocialNetwork, string][] {
  const own = socialProfiles()
  if (own.length || !isTemplate()) return own
  return Object.entries(SAMPLE_SOCIAL) as [SocialNetwork, string][]
}

/** True when the profile still carries shipped-from-the-template values. */
export function isPlaceholder(): boolean {
  return (
    business.address.postalCode === '00000' ||
    business.name.startsWith('Demo ') ||
    business.reviewUrl === '' ||
    business.description.includes(PLACEHOLDER)
  )
}

/**
 * True only for the untouched template: the demo name has not been replaced
 * by the first `pull-gbp`. Stricter than `isPlaceholder`, which stays true for
 * a real shop whose listing is unverified.
 */
export function isTemplate(): boolean {
  return business.name.startsWith('Demo ')
}

/**
 * What the reviews section shows on the template, so the design can be judged
 * with it full. Every card carries a "Sample" tag on the page, and they can only
 * render while `isTemplate()` is true: the first pull replaces the name, and
 * from then on only reviews Google returned are ever shown.
 */
export const SAMPLE_REVIEWS: Review[] = [
  { author: 'Maria G.', rating: 5, date: '2026-08', text: 'They called before doing anything, showed me the worn pad next to a new one, and the price did not move between the quote and the invoice.' },
  { author: 'Dan R.', rating: 5, date: '2026-08', text: 'Dealer wanted twelve hundred. They found it was a sensor, charged me a fraction, and had it back the same afternoon.' },
  { author: 'Keisha W.', rating: 5, date: '2026-07', text: 'Dropped it off before work, got a text with photos and a price by ten, approved it from my desk. Done by four.' },
  { author: 'Tom B.', rating: 4, date: '2026-07', text: 'Took a day longer than hoped for a part, but they told me that up front and gave me a loaner without my asking.' },
  { author: 'Priya S.', rating: 5, date: '2026-06', text: 'Honest about what could wait. I came in for brakes expecting a list of extras and left with just the brakes.' },
  { author: 'Luis M.', rating: 5, date: '2026-06', text: 'Check engine light three shops could not find. They found a cracked vacuum line in an hour and showed it to me.' },
]

/**
 * The name on the template's portrait, so the shop section can be judged with
 * its nameplate. Like SAMPLE_REVIEWS it renders only while `isTemplate()` is
 * true; a real shop shows `owner` or no plate at all, never this.
 */
export const SAMPLE_OWNER: NonNullable<BusinessProfile['owner']> = {
  name: 'Mike Russo',
  role: 'Owner and lead technician',
}

/** The person to name on the portrait: the shop's own owner, or the template's sample. */
export function shopOwner(): BusinessProfile['owner'] {
  return business.owner ?? (isTemplate() ? SAMPLE_OWNER : null)
}

const DAY_NAMES =['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

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
