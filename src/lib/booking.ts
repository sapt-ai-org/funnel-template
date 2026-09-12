import { phoneDigits } from './utils'

/**
 * What a booking has to carry to be worth saving.
 *
 * A shop calls and texts; it does not email. So a name and a phone number are
 * the whole requirement, and everything else in the form (what is wrong, how
 * soon, the car) is useful but optional. Errors say what to add, in the
 * visitor's terms, because the booking form shows them as they are.
 */
export type BookingCheck =
  | { ok: true; name: string; phone: string; phoneDigits: string; email: string | undefined }
  | { ok: false; error: string }

export function validateBooking(body: { name?: string; phone?: string; email?: string }): BookingCheck {
  const name = body.name?.trim()
  const phone = body.phone?.trim()
  const digits = phone ? phoneDigits(phone) : ''
  if (!name) return { ok: false, error: 'Add your name so the shop knows who to ask for.' }
  if (!phone || digits.length !== 10) {
    return { ok: false, error: 'Add a 10-digit phone number so the shop can call you back.' }
  }
  return { ok: true, name, phone, phoneDigits: digits, email: body.email?.trim() || undefined }
}

/**
 * The CRM record's id: one per phone number per day. A double tap or a retry
 * lands on the same record instead of making two; the same customer booking
 * again next week gets a new one instead of overwriting the last.
 */
export function bookingExternalId(digits: string, at: Date = new Date()): string {
  return `booking:${digits}:${at.toISOString().slice(0, 10)}`
}

/** Sapt's visitor id is a v4 UUID; anything else must stay off `tracking` or Sapt rejects the whole request. */
const SAPT_VISITOR_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function httpUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:' ? `${url.origin}${url.pathname}` : undefined
  } catch {
    return undefined
  }
}

/**
 * What Sapt needs to report this booking to Meta as one Lead: the event id the
 * browser minted (the Pixel fires with the same one; see
 * src/lib/meta-pixel.ts), plus the visitor, page and browser it came from, so
 * the server copy matches the click. A missing or odd id gets a fresh one,
 * so Sapt always has a stable id to send.
 */
export function leadTracking(args: {
  leadEventId?: unknown
  visitorId?: unknown
  referer?: string | null
  userAgent?: string | null
  mint?: () => string
}) {
  const sent = typeof args.leadEventId === 'string' ? args.leadEventId.trim().slice(0, 200) : ''
  const eventId = sent || (args.mint ?? (() => crypto.randomUUID()))()
  const visitorId = typeof args.visitorId === 'string' && SAPT_VISITOR_ID.test(args.visitorId) ? args.visitorId : undefined
  const sourceUrl = httpUrl(args.referer)
  const clientUserAgent = args.userAgent?.trim().slice(0, 1000) || undefined
  return {
    lead: { kind: 'lead' as const, eventId },
    ...(visitorId ? { visitorId } : {}),
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(clientUserAgent ? { clientUserAgent } : {}),
  }
}

/** Longest note kept from "Other": a sentence or two, not an essay. */
const DETAILS_MAX = 500

/**
 * The answers a shop filters its board by and a workflow branches on, lifted
 * out of the answers blob into real fields: what is wrong, how soon, and
 * whatever the customer wrote when none of the choices fit. Anything that is
 * not text is dropped rather than trusted.
 */
export function promotedAnswers(answers: Record<string, unknown> = {}): {
  issue?: string
  timing?: string
  details?: string
} {
  const text = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '')
  const issue = text(answers.issue)
  const timing = text(answers.timing)
  const details = text(answers.issue_details).slice(0, DETAILS_MAX)
  return {
    ...(issue ? { issue } : {}),
    ...(timing ? { timing } : {}),
    ...(details ? { details } : {}),
  }
}
