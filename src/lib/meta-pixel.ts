/**
 * Meta Pixel: what tells a shop's Facebook and Instagram ads which clicks
 * became bookings, so Meta can find more people like them.
 *
 * NO `'use client'`, and it must not get one: <MetaPixel /> is a server
 * component that calls `getPixelId()` to decide whether to render at all.
 * Everything here is a pure env read or guarded on `window`.
 *
 * Separate from `analytics.ts` on purpose. That one feeds Sapt's own
 * attribution; this one exists only so Meta can optimise delivery.
 *
 * WHAT IT SENDS:
 *   PageView  every page, including moves between pages inside the site.
 *   Lead      a booking the shop received. Never a review-feedback note.
 *
 * ── ONE LEAD, COUNTED ONCE ────────────────────────────────────────────────
 * Sapt also reports each booking to Meta from its server (the Conversions
 * API), because a browser Pixel misses everyone with an ad blocker. Meta only
 * merges the two when both carry the SAME event id; otherwise every booking
 * counts twice. So the browser mints one id per submission (`mintEventId`),
 * /api/book hands it to Sapt as `tracking.lead.eventId`, Sapt uses it
 * verbatim for its server copy and returns it as `conversionEventId`, and the
 * Pixel fires `Lead` with that returned id and no other. When Sapt answers
 * `held` (spam, or a contact marked not qualified) it sends no Lead, so
 * neither does the Pixel. This is the contract client-jersey-weight-loss
 * learned the hard way ("+125% additional conversions from the server").
 */

export type MetaEvent = 'PageView' | 'Lead'

interface Fbq {
  (command: 'track', event: MetaEvent, params?: Record<string, unknown>, options?: { eventID: string }): void
  (command: string, ...args: unknown[]): void
}

declare global {
  interface Window {
    fbq?: Fbq
  }
}

/** The pixel id, or undefined when unset (then every helper here is a no-op). */
export function getPixelId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim()
  if (!id || !/^\d{6,20}$/.test(id)) return undefined
  return id
}

/** One fresh id for a conversion both the browser and Sapt will report. */
export function mintEventId(): string {
  const c = typeof globalThis.crypto === 'object' ? globalThis.crypto : undefined
  if (typeof c?.randomUUID === 'function') return c.randomUUID()
  return `lead.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 10)}`
}

/** Send an event. Never throws: the tracker must not be able to break a booking. */
export function metaTrack(event: MetaEvent, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === 'undefined' || !getPixelId()) return
  try {
    if (eventId) window.fbq?.('track', event, params ?? {}, { eventID: eventId })
    else window.fbq?.('track', event, params ?? {})
  } catch {
    /* analytics must never break the UI */
  }
}

/**
 * `metaTrack`, at most once per `key` for the life of the tab, so a double
 * tap or a back-and-forward cannot send a second Lead. If storage is blocked
 * the event still fires: losing the latch beats losing the conversion.
 */
export function metaTrackOnce(key: string, event: MetaEvent, params?: Record<string, unknown>, eventId?: string): void {
  if (typeof window === 'undefined' || !getPixelId()) return
  const storageKey = `meta.once.${key}`
  try {
    if (window.sessionStorage.getItem(storageKey)) return
    window.sessionStorage.setItem(storageKey, '1')
  } catch {
    /* no storage: fire without the latch */
  }
  metaTrack(event, params, eventId)
}
