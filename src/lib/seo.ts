/**
 * Every page's <head>, built one way.
 *
 * Next merges metadata shallowly: a page that sets `openGraph` replaces the
 * layout's whole `openGraph`, and a page that does not inherits the home
 * page's title and URL on every share card. So each page states all of it,
 * through `pageMetadata`: its title, its description, its canonical path, and
 * the Open Graph and X cards that repeat them. The share image comes from the
 * `opengraph-image` files, which Next attaches to every page beneath them.
 *
 * Titles and descriptions are built from facts (business.ts) and fitted to
 * what a results page shows, so a long town or service name shortens the line
 * rather than getting cut mid-word by Google.
 */

import { business } from '@/config/business'
import type { Metadata } from 'next'

/** The share card (src/lib/og.tsx): its size, type and words, shared with every page's tags. */
export const OG_SIZE = { width: 1200, height: 630 }
export const OG_TYPE = 'image/png'
export const ogAlt = () =>
  `${business.name}, ${business.category.toLowerCase()} in ${business.address.city}, ${business.address.state}`

/** Roughly what Google shows before cutting a title (about 600px). */
export const TITLE_MAX = 60
/** Roughly what Google shows of a description on a phone and a desktop. */
export const DESCRIPTION_MAX = 160

/**
 * "Brakes in Cleveland, OH | Smith Auto": the page's own words first, then
 * the shop's name when there is room for it. The name is what a results page
 * drops first, so it goes last.
 */
export function fitTitle(primary: string, brand: string = business.name): string {
  if (primary.toLowerCase().includes(brand.toLowerCase())) return primary
  const full = `${primary} | ${brand}`
  return full.length <= TITLE_MAX ? full : primary
}

/** Cut at a word, never mid-word, and say so with an ellipsis. */
export function fitDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–-]+$/, '')}…`
}

/**
 * Sentences in order of importance, as many whole ones as fit. The first is
 * always kept (and fitted); a later one is only added whole, never cut.
 */
export function joinFit(...sentences: string[]): string {
  let out = fitDescription(sentences[0] ?? '')
  for (const s of sentences.slice(1)) {
    const next = `${out} ${s}`.trim()
    if (next.length <= DESCRIPTION_MAX) out = next
  }
  return out
}

/**
 * As many names as fit in `max`, then "and more": a list that reads as a
 * sentence at any length, where a plain cut would end on half a service.
 */
export function listFit(lead: string, names: string[], max = DESCRIPTION_MAX): string {
  const more = ' and more.'
  for (let n = names.length; n > 0; n--) {
    const shown = names.slice(0, n)
    const text =
      n === names.length
        ? `${lead}${shown.length > 1 ? `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}` : shown[0]}.`
        : `${lead}${shown.join(', ')}${more}`
    if (text.length <= max) return text
  }
  return fitDescription(`${lead}${names.join(', ')}.`, max)
}

/** The town a local search names, as the site writes it: "Cleveland, OH". */
export const town = () => `${business.address.city}, ${business.address.state}`

export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  image = '/opengraph-image',
}: {
  title: string
  description: string
  /** The page's path from the root, e.g. "/services/brakes". The canonical and the card's URL. */
  path: string
  type?: 'website' | 'article'
  publishedTime?: string | null
  /** The share card's route: the site's own, or a segment's (a service's card). */
  image?: string
}): Metadata {
  const desc = fitDescription(description)
  return {
    // `absolute` so no layout template can wrap it a second time.
    title: { absolute: title },
    description: desc,
    alternates: { canonical: path },
    openGraph: {
      type,
      url: path,
      siteName: business.name,
      locale: 'en_US',
      title,
      description: desc,
      ...(type === 'article' && publishedTime ? { publishedTime } : {}),
      // A page that states `openGraph` loses the card the opengraph-image
      // files would have given it, and a stated image outranks a segment's
      // own file, so every page names its card here.
      images: [{ url: image, ...OG_SIZE, type: OG_TYPE, alt: ogAlt() }],
    },
    twitter: { card: 'summary_large_image', title, description: desc, images: [{ url: image, alt: ogAlt() }] },
  }
}
