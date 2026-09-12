/**
 * Pull the business off its Google Business Profile.
 *
 * The shop already wrote all of this once, on Google, and a customer comparing
 * the Maps listing to the website will believe the listing. So the listing is
 * the source: name, category, address, phone, hours, services, description,
 * rating, the review link, and the owner's own photos.
 *
 *   pnpm pull-gbp              write it
 *   pnpm pull-gbp --dry-run    print what it would write, touch nothing
 *
 * What it rewrites:
 *   src/config/business.ts   between the `pull-gbp:begin/end business` markers
 *   src/lib/images.ts        between the `pull-gbp:begin/end slots` markers
 *   public/photos/           the downloaded photos themselves
 *
 * Fields marked `@manual` in `business.ts` are read back out of the current
 * file and written through unchanged, so running this a second time never
 * clears the answers a person gave.
 *
 * Reads go through Sapt, not Google: Sapt already holds the shop's OAuth
 * tokens, so this needs one server-side API key and no Google credentials of
 * its own.
 *
 * Environment (from `.env.local`):
 *   NEXT_PUBLIC_SAPT_PROJECT_ID  required
 *   SAPT_API_KEY                 required, server-side only, never committed
 *   NEXT_PUBLIC_SAPT_BASE_URL    optional, default https://api.sapt.ai
 *   GBP_LOCATION_ID              optional, only when the project has several
 */

import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import { business, type BusinessHours, type BusinessProfile } from '../src/config/business'
import { SLOTS, type ImageSlot, type SlotId } from '../src/lib/images'

const DEFAULT_BASE_URL = 'https://api.sapt.ai'
const BUSINESS_PATH = 'src/config/business.ts'
const IMAGES_PATH = 'src/lib/images.ts'
const PHOTO_DIR = 'public/photos'

/**
 * The template's own guard. It asserts that `business.ts` still carries no
 * Google identifiers, which is exactly what a successful pull breaks, so a
 * checkout that has real data in it is no longer a template and does not keep
 * the guard. `init-project.ts` removes the same file on the provisioning path.
 */
const PLACEHOLDER_TEST_PATH = 'src/config/placeholder.test.ts'

/** Refusing to write here is the only thing standing between a client's Google identifiers and a public repo. */
const TEMPLATE_ORIGIN = /sapt-ai-org\/funnel-template(\.git)?$/

// ============================================================================
// ENV
// ============================================================================

/**
 * `.env.local` without a dependency. Next.js loads it for the app but a script
 * run through tsx gets a bare `process.env`, and adding dotenv to ship one
 * script is not worth a dependency.
 */
export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (key) out[key] = value
  }
  return out
}

function loadEnv(root: string): void {
  for (const name of ['.env.local', '.env']) {
    const file = path.join(root, name)
    if (!fs.existsSync(file)) continue
    for (const [key, value] of Object.entries(parseEnvFile(fs.readFileSync(file, 'utf8')))) {
      if (process.env[key] === undefined) process.env[key] = value
    }
  }
}

// ============================================================================
// SAPT
// ============================================================================

/**
 * One tRPC query over plain fetch.
 *
 * Sapt's tRPC runs a superjson transformer, so input is wrapped in `{ json }`
 * and the payload comes back under `result.data.json`. That is the whole
 * protocol at this level; a tRPC client would only add a dependency.
 */
async function trpcQuery<T>(procedure: string, input: Record<string, unknown>): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_SAPT_BASE_URL || DEFAULT_BASE_URL
  const apiKey = process.env.SAPT_API_KEY
  const query = encodeURIComponent(JSON.stringify({ json: input }))
  const res = await fetch(`${baseUrl}/api/trpc/${procedure}?input=${query}`, {
    headers: { Authorization: `ApiKey ${apiKey}` },
  })

  const text = await res.text()
  if (!res.ok) {
    let message = `${res.status} ${res.statusText}`
    try {
      const parsed = JSON.parse(text) as { error?: { json?: { message?: string } } }
      if (parsed.error?.json?.message) message = parsed.error.json.message
    } catch {
      // Non-JSON body: the status line is the whole story.
    }
    throw new Error(`${procedure} failed: ${message}`)
  }
  return (JSON.parse(text) as { result: { data: { json: T } } }).result.data.json
}

interface SaptLocation {
  id: string
  locationName: string
  metadata: {
    addressLines?: string[]
    locality?: string
    administrativeArea?: string
    postalCode?: string
    regionCode?: string
    category?: string
    phone?: string
    website?: string
    reviewUri?: string
    placeId?: string
    mapsUri?: string
  }
}

interface GbpPeriod {
  openDay: string
  closeDay: string
  openTime: { hours: number; minutes: number }
  closeTime: { hours: number; minutes: number }
}

interface SaptHours {
  regularHours?: { periods: GbpPeriod[] }
}

interface SaptSiteProfile {
  description: string
  services: string[]
  photos: { name: string; url: string; thumbnailUrl: string; category: string }[]
}

/** One review as Google's Business Profile API returns it. */
export interface GbpReview {
  reviewer: { displayName?: string; isAnonymous?: boolean }
  starRating: 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' | 'STAR_RATING_UNSPECIFIED'
  comment?: string
  createTime: string
}

interface SaptReviews {
  reviews?: GbpReview[]
  averageRating?: number
  totalReviewCount?: number
}

// ============================================================================
// SHAPING
// ============================================================================

const GBP_DAY_INDEX: Record<string, 0 | 1 | 2 | 3 | 4 | 5 | 6> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
}

function hhmm(t: { hours: number; minutes: number }): string {
  return `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}`
}

/**
 * Google's periods to the site's seven days.
 *
 * Google sends a period per opening, so a day the shop is shut is simply
 * absent and a day with a lunch break appears twice. The site shows one open
 * and one close per day, which is what a customer deciding whether to drive
 * over actually needs, so a split day collapses to its earliest open and its
 * latest close. A day with no period at all is closed, stated explicitly
 * rather than left out, because "Sunday: closed" is worth printing.
 */
export function toBusinessHours(periods: GbpPeriod[]): BusinessHours[] {
  const byDay = new Map<number, { open: string; close: string }>()

  for (const period of periods) {
    const day = GBP_DAY_INDEX[period.openDay]
    if (day === undefined) continue
    const open = hhmm(period.openTime)
    // An overnight close lands on the next day. Clamping it to midnight keeps
    // the row readable and keeps `open < close`, which the schema.org output
    // and the "open now" comparison both assume.
    const close = period.closeDay === period.openDay ? hhmm(period.closeTime) : '23:59'
    const existing = byDay.get(day)
    byDay.set(day, {
      open: existing && existing.open < open ? existing.open : open,
      close: existing && existing.close > close ? existing.close : close,
    })
  }

  const days: BusinessHours[] = []
  for (let day = 0; day <= 6; day += 1) {
    const hit = byDay.get(day)
    days.push(
      hit
        ? { day: day as BusinessHours['day'], open: hit.open, close: hit.close }
        : { day: day as BusinessHours['day'], open: '00:00', close: '00:00', closed: true }
    )
  }
  return days
}

/**
 * Which photo belongs in which slot.
 *
 * Google's own category is the only signal available, and it is a coarse one,
 * so this is a preference order rather than a classification: each slot takes
 * the first unused photo from the categories that suit it, and whatever is
 * left fills the gallery. A slot with no candidate stays empty and keeps
 * rendering its brief, which is the honest outcome. `PROFILE` and `LOGO` are
 * excluded outright: a logo dropped into a hero is the single most obvious
 * tell that a site was assembled by a machine.
 */
const SLOT_CATEGORIES: { slot: SlotId; categories: string[] }[] = [
  { slot: 'storefront', categories: ['COVER', 'EXTERIOR'] },
  { slot: 'exterior', categories: ['EXTERIOR', 'COVER'] },
  { slot: 'interior', categories: ['INTERIOR'] },
  { slot: 'team', categories: ['TEAM'] },
  { slot: 'bay', categories: ['AT_WORK', 'INTERIOR'] },
  { slot: 'detail', categories: ['AT_WORK', 'PRODUCT'] },
  { slot: 'gallery1', categories: ['INTERIOR', 'ADDITIONAL', 'PRODUCT'] },
  { slot: 'gallery2', categories: ['ADDITIONAL', 'PRODUCT', 'AT_WORK'] },
  { slot: 'gallery3', categories: ['ADDITIONAL', 'PRODUCT', 'EXTERIOR'] },
  { slot: 'gallery4', categories: ['EXTERIOR', 'ADDITIONAL'] },
]

const EXCLUDED_CATEGORIES = new Set(['PROFILE', 'LOGO', 'MENU', 'FOOD_AND_DRINK'])

/** How Google's category reads in alt text: "Inside Torres' Auto & Tire". */
const CATEGORY_ALT: Record<string, (name: string) => string> = {
  COVER: (n) => `${n}, from the street`,
  EXTERIOR: (n) => `${n}, from the street`,
  INTERIOR: (n) => `Inside ${n}`,
  AT_WORK: (n) => `A technician at work at ${n}`,
  TEAM: (n) => `The team at ${n}`,
  PRODUCT: (n) => `Work done at ${n}`,
  COMMON_AREA: (n) => `The waiting area at ${n}`,
}

/**
 * Alt text for a photo pulled from Google, from what Google says it shows.
 * Not from the slot's brief: gallery slots are filled with whatever is left,
 * and a brief ("brake work up close") would describe a photo that is not
 * there, which is wrong for a screen reader and for search alike.
 */
export function photoAlt(category: string, name: string): string {
  return (CATEGORY_ALT[category] ?? ((n: string) => `At ${n}`))(name)
}

export interface PhotoCandidate {
  url: string
  category: string
}

/**
 * `owner` is deliberately absent from the mapping. Google has no category for
 * "the owner, head and shoulders", and guessing wrong puts a stranger's face
 * on the about section.
 */
export function assignPhotoSlots(
  photos: PhotoCandidate[]
): { slot: SlotId; url: string; category: string }[] {
  const pool = photos.filter((p) => !EXCLUDED_CATEGORIES.has(p.category))
  const used = new Set<string>()
  const assigned: { slot: SlotId; url: string; category: string }[] = []

  for (const { slot, categories } of SLOT_CATEGORIES) {
    const hit = categories
      .flatMap((category) => pool.filter((p) => p.category === category))
      .find((p) => !used.has(p.url))
    if (!hit) continue
    used.add(hit.url)
    assigned.push({ slot, url: hit.url, category: hit.category })
  }

  // Anything left over backfills whichever gallery slots are still empty,
  // rather than being dropped. A real photo beats a placeholder every time.
  const spare = pool.filter((p) => !used.has(p.url))
  for (const slot of ['gallery1', 'gallery2', 'gallery3', 'gallery4'] as const) {
    if (assigned.some((a) => a.slot === slot)) continue
    const next = spare.shift()
    if (!next) break
    assigned.push({ slot, url: next.url, category: next.category })
  }

  return assigned
}

const STARS: Record<GbpReview['starRating'], number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  STAR_RATING_UNSPECIFIED: 0,
}

/** A card's worth of words: enough to say something, short enough to read in motion. */
const REVIEW_TEXT = { min: 40, max: 320 }

/**
 * The reviews worth putting on the site, from the newest page Google returns.
 *
 * Four and five stars with something written. The page states the real
 * average and count right above them, so choosing which reviews to quote is
 * picking testimonials, not hiding anything. Skipped: anonymous reviewers,
 * Google's machine translations, and text too short or too long for a card.
 * Surnames are cut to an initial; the reviewer wrote for Google, not for the
 * shop's homepage.
 */
export function pickReviews(reviews: GbpReview[], limit = 12): BusinessProfile['reviews'] {
  const picked: BusinessProfile['reviews'] = []
  for (const r of reviews) {
    if (picked.length >= limit) break
    const text = (r.comment ?? '').trim().replace(/\s+/g, ' ')
    const name = (r.reviewer.displayName ?? '').trim()
    if (STARS[r.starRating] < 4) continue
    if (r.reviewer.isAnonymous || !name) continue
    if (text.length < REVIEW_TEXT.min || text.length > REVIEW_TEXT.max) continue
    if (text.includes('(Translated by Google)')) continue
    const [first, ...rest] = name.split(/\s+/)
    const last = rest.at(-1)
    picked.push({
      author: last ? `${first} ${last[0].toUpperCase()}.` : first,
      rating: STARS[r.starRating],
      text,
      date: r.createTime.slice(0, 7),
    })
  }
  return picked
}

// ============================================================================
// WRITING TYPESCRIPT
// ============================================================================

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

/** A plain value as the TypeScript literal a person would have typed. */
export function tsLiteral(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent)
  const inner = '  '.repeat(indent + 1)

  if (value === null) return 'null'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'string') {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const items = value.map((v) => `${inner}${tsLiteral(v, indent + 1)},`).join('\n')
    return `[\n${items}\n${pad}]`
  }

  if (typeof value === 'object') {
    // `undefined` is how an optional field says "not set". Emitting it would
    // be valid TypeScript and wrong: `closed: undefined` reads as a decision.
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined
    )
    if (entries.length === 0) return '{}'
    const body = entries
      .map(([k, v]) => `${inner}${IDENTIFIER.test(k) ? k : `'${k}'`}: ${tsLiteral(v, indent + 1)},`)
      .join('\n')
    return `{\n${body}\n${pad}}`
  }

  throw new Error(`Cannot serialize ${typeof value}`)
}

/** Replace the lines between two marker comments, markers included in neither. */
export function replaceRegion(source: string, marker: string, body: string): string {
  const begin = `// pull-gbp:begin ${marker}`
  const end = `// pull-gbp:end ${marker}`
  const from = source.indexOf(begin)
  const to = source.indexOf(end)
  if (from === -1 || to === -1 || to < from) {
    throw new Error(`Markers for "${marker}" are missing or out of order`)
  }
  return `${source.slice(0, from)}${begin}\n${body}\n${source.slice(to)}`
}

// ============================================================================
// RUN
// ============================================================================

function originIsTemplate(root: string): boolean {
  try {
    const origin = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: root,
      encoding: 'utf8',
    }).trim()
    return TEMPLATE_ORIGIN.test(origin)
  } catch {
    // No git, no origin, no remote: not the template, so not this guard's call.
    return false
  }
}

async function downloadPhoto(root: string, url: string, slot: SlotId): Promise<string | null> {
  const res = await fetch(url)
  if (!res.ok) {
    console.warn(`pull-gbp: ${slot} photo unavailable (${res.status})`)
    return null
  }
  const type = res.headers.get('content-type') || ''
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg'
  const rel = `/photos/${slot}.${ext}`
  const dir = path.join(root, PHOTO_DIR)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, `${slot}.${ext}`), Buffer.from(await res.arrayBuffer()))
  return rel
}

async function main(): Promise<void> {
  const root = process.cwd()
  const dryRun = process.argv.includes('--dry-run')
  loadEnv(root)

  const projectId = process.env.NEXT_PUBLIC_SAPT_PROJECT_ID
  const apiKey = process.env.SAPT_API_KEY
  if (!projectId || !apiKey) {
    throw new Error(
      'pull-gbp needs NEXT_PUBLIC_SAPT_PROJECT_ID and SAPT_API_KEY in .env.local. ' +
        'The API key is server-side only, so never prefix it with NEXT_PUBLIC_.'
    )
  }

  if (!dryRun && originIsTemplate(root)) {
    throw new Error(
      'This checkout is the public template. Writing a real Place ID or review link into it ' +
        'would publish a client identifier, so pull-gbp will not write here. Run it in the ' +
        "client's own repository, or pass --dry-run to see what it would write."
    )
  }

  const locations = await trpcQuery<SaptLocation[]>('googleBusiness.locations.list', { projectId })
  if (locations.length === 0) {
    throw new Error(
      'No Google Business Profile locations in this Sapt project. Connect the profile in ' +
        'Sapt under Integrations, run a location sync, then try again.'
    )
  }

  const wanted = process.env.GBP_LOCATION_ID
  const location = wanted ? locations.find((l) => l.id === wanted) : locations[0]
  if (!location) {
    throw new Error(
      `GBP_LOCATION_ID "${wanted}" is not in this project. Available: ` +
        locations.map((l) => `${l.id} (${l.locationName})`).join(', ')
    )
  }
  if (locations.length > 1 && !wanted) {
    console.warn(
      `pull-gbp: ${locations.length} locations in this project, using "${location.locationName}". ` +
        'Set GBP_LOCATION_ID to choose another.'
    )
  }

  const [hours, siteProfile, reviews] = await Promise.all([
    trpcQuery<SaptHours>('googleBusiness.hours.get', { projectId, gbpLocationId: location.id }),
    trpcQuery<SaptSiteProfile>('googleBusiness.locations.siteProfile', {
      projectId,
      gbpLocationId: location.id,
    }),
    trpcQuery<SaptReviews>('googleBusiness.reviews.list', {
      projectId,
      gbpLocationId: location.id,
      // The newest page, so the site quotes what customers are saying now.
      pageSize: 50,
    }),
  ])

  const meta = location.metadata
  const periods = hours.regularHours?.periods ?? []

  // Everything `@manual` comes off the module that is on disk right now, so a
  // second run keeps the answers a person already gave.
  const next: BusinessProfile = {
    ...business,
    name: location.locationName || business.name,
    category: meta.category || business.category,
    description: siteProfile.description || business.description,
    phone: meta.phone || business.phone,
    address: {
      street: meta.addressLines?.join(', ') || business.address.street,
      city: meta.locality || business.address.city,
      state: meta.administrativeArea || business.address.state,
      postalCode: meta.postalCode || business.address.postalCode,
      country: meta.regionCode || business.address.country,
    },
    hours: periods.length > 0 ? toBusinessHours(periods) : business.hours,
    services: siteProfile.services.length > 0 ? siteProfile.services : business.services,
    rating:
      reviews.averageRating && reviews.totalReviewCount
        ? { value: Number(reviews.averageRating.toFixed(1)), count: reviews.totalReviewCount }
        : null,
    reviews: pickReviews(reviews.reviews ?? []),
    reviewUrl: meta.reviewUri || '',
    mapsUrl: meta.mapsUri || '',
    placeId: meta.placeId || '',
    // The listing's website is the live domain by definition, and getting this
    // wrong silently breaks every canonical URL and the sitemap.
    siteUrl: meta.website || business.siteUrl,
  }

  const assignments = assignPhotoSlots(
    siteProfile.photos.map((p) => ({ url: p.url, category: p.category }))
  )

  console.log(`pull-gbp: ${next.name} (${next.address.city}, ${next.address.state})`)
  console.log(`pull-gbp: ${periods.length} hour periods, ${next.services.length} services`)
  console.log(
    `pull-gbp: rating ${next.rating ? `${next.rating.value} from ${next.rating.count}` : 'none yet'}`
  )
  console.log(`pull-gbp: ${next.reviews.length} reviews quoted on the site`)
  console.log(`pull-gbp: ${siteProfile.photos.length} photos, ${assignments.length} slots filled`)
  if (!next.reviewUrl) {
    console.warn('pull-gbp: no review link. Google only issues one for a verified listing.')
  }

  if (dryRun) {
    console.log('\n--- src/config/business.ts ---')
    console.log(`export const business: BusinessProfile = ${tsLiteral(next)}`)
    console.log('\n--- photo slots ---')
    for (const a of assignments) console.log(`${a.slot}  ${a.category}  ${a.url}`)
    console.log('\npull-gbp: --dry-run, nothing written')
    return
  }

  const slots: Record<SlotId, ImageSlot> = { ...SLOTS }
  for (const a of assignments) {
    const src = await downloadPhoto(root, a.url, a.slot)
    if (!src) continue
    slots[a.slot] = { ...SLOTS[a.slot], src, alt: photoAlt(a.category, next.name) }
  }

  const businessFile = path.join(root, BUSINESS_PATH)
  fs.writeFileSync(
    businessFile,
    replaceRegion(
      fs.readFileSync(businessFile, 'utf8'),
      'business',
      `export const business: BusinessProfile = ${tsLiteral(next)}`
    )
  )

  const imagesFile = path.join(root, IMAGES_PATH)
  fs.writeFileSync(
    imagesFile,
    replaceRegion(
      fs.readFileSync(imagesFile, 'utf8'),
      'slots',
      `export const SLOTS: Record<SlotId, ImageSlot> = ${tsLiteral(slots)}`
    )
  )

  const guard = path.join(root, PLACEHOLDER_TEST_PATH)
  if (fs.existsSync(guard)) {
    fs.rmSync(guard)
    console.log(`pull-gbp: removed ${PLACEHOLDER_TEST_PATH}, this checkout holds real data now`)
  }

  console.log(`pull-gbp: wrote ${BUSINESS_PATH} and ${IMAGES_PATH}`)

  const empty = (Object.keys(slots) as SlotId[]).filter((id) => !slots[id].src)
  if (empty.length > 0) {
    console.log(`pull-gbp: still needs a photo for ${empty.join(', ')}`)
  }
}

// Guard so importing this module from a test does not run the script.
if (process.env.VITEST !== 'true') {
  // An operator running this needs the sentence, not the stack. Everything
  // thrown above is written to be read.
  try {
    await main()
  } catch (err) {
    console.error(`\npull-gbp: ${err instanceof Error ? err.message : String(err)}\n`)
    process.exit(1)
  }
}
