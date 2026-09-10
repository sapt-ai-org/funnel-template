/**
 * Image slots.
 *
 * A local service site lives or dies on photographs: a shop owner's own bay,
 * his own techs, his own sign. Stock photography of a generic garage reads as
 * a template instantly, and every competitor's template uses the same three
 * shots. So this file defines NAMED SLOTS rather than a bag of images, and
 * every slot has a real caption describing the photo that belongs in it.
 *
 * Unfilled slots render a labelled placeholder at the right aspect ratio, so
 * an un-photographed site still lays out correctly and it is obvious to
 * everyone, including the client, exactly which photo is missing.
 *
 * `pnpm pull-gbp` fills what it can from the Google Business Profile: Google
 * already holds the owner's exterior, interior and team shots, and those are
 * the same photos customers see on Maps, so the site matches the listing.
 */

export type SlotId =
  | 'hero'
  | 'exterior'
  | 'interior'
  | 'team'
  | 'bay'
  | 'detail'
  | 'owner'
  | 'gallery1'
  | 'gallery2'
  | 'gallery3'
  | 'gallery4'

export interface ImageSlot {
  id: SlotId
  /** What photo goes here. Shown on the placeholder, so the client can read it. */
  brief: string
  /** width / height. Drives the placeholder box and prevents layout shift. */
  ratio: number
  /** Filled by pull-gbp or by hand. Empty = render the placeholder. */
  src?: string
  /** Alt text. Real alt text is an SEO and accessibility requirement, not a nicety. */
  alt?: string
}

export const SLOTS: Record<SlotId, ImageSlot> = {
  hero: { id: 'hero', brief: 'Wide shot of the shop front, daylight, sign visible', ratio: 16 / 9 },
  exterior: { id: 'exterior', brief: 'Building exterior from the street', ratio: 4 / 3 },
  interior: { id: 'interior', brief: 'Clean shop floor, lifts in frame', ratio: 4 / 3 },
  team: { id: 'team', brief: 'The techs, together, in uniform', ratio: 3 / 2 },
  bay: { id: 'bay', brief: 'A car up on the lift, work in progress', ratio: 4 / 3 },
  detail: { id: 'detail', brief: 'Close up: hands, tools, a torque wrench', ratio: 1 },
  owner: { id: 'owner', brief: 'The owner, head and shoulders, in the shop', ratio: 1 },
  gallery1: { id: 'gallery1', brief: 'Gallery: waiting area', ratio: 1 },
  gallery2: { id: 'gallery2', brief: 'Gallery: diagnostic equipment', ratio: 1 },
  gallery3: { id: 'gallery3', brief: 'Gallery: a finished job', ratio: 1 },
  gallery4: { id: 'gallery4', brief: 'Gallery: the sign or street view', ratio: 1 },
}

/**
 * An inline SVG placeholder carrying its own brief.
 *
 * A data URI rather than a file so an empty slot costs no request and cannot
 * 404, and so a fresh clone with no photos at all still renders a complete
 * page. The diagonal hatch makes it unmistakably a placeholder at a glance —
 * a plain grey box gets mistaken for a design choice and ships.
 */
export function placeholderSrc(slot: ImageSlot): string {
  const w = 1200
  const h = Math.round(w / slot.ratio)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <pattern id="h" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="16" height="16" fill="#EEEDEA"/>
      <line x1="0" y1="0" x2="0" y2="16" stroke="#E982624D" stroke-width="8"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#h)"/>
  <rect x="12" y="12" width="${w - 24}" height="${h - 24}" fill="none" stroke="#00000018" stroke-width="2"/>
  <text x="50%" y="50%" text-anchor="middle" font-family="system-ui, sans-serif" font-size="30" fill="#6B6A66">PHOTO NEEDED</text>
  <text x="50%" y="50%" dy="42" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" fill="#8E8D88">${escapeXml(slot.brief)}</text>
</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] as string
  )
}

/** The src to render for a slot, and whether it is still a placeholder. */
export function image(id: SlotId): { src: string; alt: string; ratio: number; missing: boolean } {
  const slot = SLOTS[id]
  const missing = !slot.src
  return {
    src: slot.src ?? placeholderSrc(slot),
    // Falls back to the brief so alt text is never empty, which is both an
    // accessibility failure and a wasted ranking signal on a local site.
    alt: slot.alt ?? slot.brief,
    ratio: slot.ratio,
    missing,
  }
}

/** Every slot still waiting on a photo. Surfaced in the setup checklist. */
export function missingSlots(): ImageSlot[] {
  return Object.values(SLOTS).filter((s) => !s.src)
}
