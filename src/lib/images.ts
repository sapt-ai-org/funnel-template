import { isTemplate } from '../config/business'

/**
 * The shop's photographs.
 *
 * A local service site lives or dies on photographs: the owner's own bay, the
 * techs, the sign out front. Stock photography of a generic garage reads as a
 * template instantly. So this file defines NAMED SLOTS rather than a bag of
 * images, each with a brief saying what belongs in it.
 *
 * `pnpm pull-gbp` fills what it can from the Google Business Profile: Google
 * already holds the shop's exterior, interior and team shots, the same photos
 * customers see on Maps. It downloads them into `public/photos/` and rewrites
 * everything between the `pull-gbp:begin slots` and `pull-gbp:end slots`
 * markers below. The owner portrait is never filled automatically.
 *
 * What a slot renders, in order:
 *   1. the shop's own photo, when the slot has one
 *   2. on the untouched template, a sample photo, tagged "Sample" on the page
 *   3. in development, a labelled "Photo needed" box, so whoever is setting
 *      the site up sees exactly what is missing and where
 *   4. in production, nothing: the section closes up around it. A live site
 *      never shows a placeholder.
 */

export type SlotId =
  | 'storefront'
  | 'exterior'
  | 'owner'
  | 'team'
  | 'interior'
  | 'bay'
  | 'detail'
  | 'gallery1'
  | 'gallery2'
  | 'gallery3'
  | 'gallery4'

export interface ImageSlot {
  id: SlotId
  /** What photo belongs here. Shown on the development placeholder. */
  brief: string
  /** width / height of the photo's box where nothing else sets one. */
  ratio: number
  /** Filled by pull-gbp or by hand, e.g. '/photos/bay.jpg'. */
  src?: string
  /** Real alt text. Required with `src`: it is both accessibility and a ranking signal. */
  alt?: string
}

// pull-gbp:begin slots
export const SLOTS: Record<SlotId, ImageSlot> = {
  storefront: { id: 'storefront', brief: 'The shop front in daylight, sign and bay doors in frame', ratio: 4 / 3 },
  exterior: { id: 'exterior', brief: 'The building from the street or the lot', ratio: 4 / 3 },
  owner: { id: 'owner', brief: 'The owner, waist up, in the shop', ratio: 4 / 5 },
  team: { id: 'team', brief: 'The technicians together, in work clothes', ratio: 3 / 2 },
  interior: { id: 'interior', brief: 'The shop floor, wide, lifts in frame', ratio: 16 / 9 },
  bay: { id: 'bay', brief: 'A car up on the lift, work in progress', ratio: 4 / 3 },
  detail: { id: 'detail', brief: 'Close up: hands and tools on the work', ratio: 1 },
  gallery1: { id: 'gallery1', brief: 'A technician at a car with a diagnostic scanner', ratio: 4 / 3 },
  gallery2: { id: 'gallery2', brief: 'Tire or wheel work: mounting, balancing, alignment', ratio: 4 / 3 },
  gallery3: { id: 'gallery3', brief: 'Brake work up close: rotor, caliper, pads', ratio: 4 / 3 },
  gallery4: { id: 'gallery4', brief: 'The waiting area or the service counter', ratio: 4 / 3 },
}
// pull-gbp:end slots

/**
 * Photos the untouched template shows, so the layout can be judged full.
 * Unsplash and Pexels licensed (credits in public/samples/CREDITS.md); every
 * one is tagged "Sample" on the page and none can render after the first
 * `pull-gbp`, which replaces the demo name `isTemplate()` checks.
 */
const SAMPLE_PHOTOS: Partial<Record<SlotId, { alt: string }>> = {
  storefront: { alt: 'A row of open service bays with cars inside, seen from the lot' },
  owner: { alt: 'A mechanic in a work shirt, smiling, beside his tool cart' },
  interior: { alt: 'A bright shop floor with an SUV raised on a lift' },
  bay: { alt: 'A technician working under a car raised on a lift' },
  detail: { alt: 'Gloved hands turning a socket wrench on an engine' },
  gallery1: { alt: 'A technician checking an engine with a diagnostic tablet' },
  gallery2: { alt: 'A tire being mounted on a tire changer' },
  gallery3: { alt: 'Hands working at a brake rotor and caliper' },
}

/** Widths every sample is exported at, so the browser picks the one it needs. */
const SAMPLE_WIDTHS = [800, 1600] as const

export interface ResolvedPhoto {
  /** The slot it came from, or 'file' for a photo given by path (see filePhoto). */
  id: SlotId | 'file'
  src: string
  srcSet?: string
  alt: string
  ratio: number
  /** A template sample. The page tags it so nobody mistakes it for the shop. */
  sample: boolean
  /** Nothing to show: a development-only "Photo needed" box. */
  placeholder: boolean
  brief: string
}

/** What a slot renders right now, or null when it should render nothing. */
export function photo(id: SlotId): ResolvedPhoto | null {
  const slot = SLOTS[id]
  const base = { id, ratio: slot.ratio, brief: slot.brief, sample: false, placeholder: false }

  if (slot.src) return { ...base, src: slot.src, alt: slot.alt ?? slot.brief }

  const sample = SAMPLE_PHOTOS[id]
  if (sample && isTemplate()) {
    const at = (w: number) => `/samples/${id}-${w}.webp`
    return {
      ...base,
      src: at(SAMPLE_WIDTHS[SAMPLE_WIDTHS.length - 1]),
      srcSet: SAMPLE_WIDTHS.map((w) => `${at(w)} ${w}w`).join(', '),
      alt: sample.alt,
      sample: true,
    }
  }

  if (process.env.NODE_ENV === 'development') return { ...base, src: '', alt: slot.brief, placeholder: true }
  return null
}

/** A photo given directly by path, for a custom section's one-off image. */
export function filePhoto(src: string, alt: string, ratio = 4 / 3): ResolvedPhoto {
  return { id: 'file', src, alt, ratio, sample: false, placeholder: false, brief: alt }
}

/** The first of several slots that has something to show: a fallback chain. */
export function firstPhoto(ids: SlotId[]): ResolvedPhoto | null {
  for (const id of ids) {
    const p = photo(id)
    if (p && !p.placeholder) return p
  }
  // Nothing real anywhere in the chain: the first slot's placeholder, if any.
  return photo(ids[0])
}

/** Every slot in the list that has something to show, in order. */
export function photos(ids: SlotId[]): ResolvedPhoto[] {
  return ids.map(photo).filter((p): p is ResolvedPhoto => p !== null)
}

/* ── The photo plan: where each photo goes on the page ─────────────────────── */

/**
 * Each position on the page takes the first slot in its chain that has a
 * photo, so a shop missing its owner portrait still gets a person in that
 * spot, and a shop with a thin profile still gets a composed page. Every
 * photo appears once: the gallery skips whatever the other positions used.
 */
export const PHOTO_PLAN = {
  /** Behind the first screen, under a dark wash: the widest, calmest shot of the shop. */
  hero: ['interior', 'storefront', 'bay'],
  /** Beside the address and hours: what they will see when they pull up. Also the share image. */
  storefront: ['storefront', 'exterior'],
  /** The shop section: a person, ideally the owner. */
  portrait: ['owner', 'team', 'interior'],
  /** The bento, strongest first (the first tile is the largest). */
  gallery: ['bay', 'detail', 'gallery1', 'team', 'interior', 'gallery2', 'gallery3', 'gallery4', 'exterior'],
} as const satisfies Record<string, SlotId[]>

/** The hero's background. Never a placeholder: with no photo the hero is plain. */
export function heroPhoto(): ResolvedPhoto | null {
  const p = firstPhoto([...PHOTO_PLAN.hero])
  return p && !p.placeholder ? p : null
}

/** A position's chain, minus the slot the hero already took. */
const afterHero = (chain: readonly SlotId[]): SlotId[] => {
  const taken = heroPhoto()?.id
  return chain.filter((id) => id !== taken)
}

export function storefrontPhoto(): ResolvedPhoto | null {
  return firstPhoto(afterHero(PHOTO_PLAN.storefront))
}

export function portraitPhoto(): ResolvedPhoto | null {
  return firstPhoto(afterHero(PHOTO_PLAN.portrait))
}

/**
 * The gallery's photos, never the ones used elsewhere. In production only
 * real ones (or template samples); in development the gaps show as labelled
 * boxes too, so the bento can be seen at the size it is meant to be.
 */
export function galleryPhotos(max: number): ResolvedPhoto[] {
  const used = new Set([heroPhoto()?.id, storefrontPhoto()?.id, portraitPhoto()?.id])
  const available = photos([...PHOTO_PLAN.gallery]).filter((p) => !used.has(p.id))
  const shown = available.filter((p) => !p.placeholder)
  // The template's samples stand on their own; gaps are only worth showing
  // on a real shop's site, where someone has a photo to go and get.
  if (isTemplate()) return shown.slice(0, max)
  // Real photos first, so a placeholder never takes the big first tile.
  return [...shown, ...available.filter((p) => p.placeholder)].slice(0, max)
}

/** Every slot still waiting on the shop's own photo. Listed by pull-gbp. */
export function missingSlots(): ImageSlot[] {
  return Object.values(SLOTS).filter((s) => !s.src)
}
