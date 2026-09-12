import { NextResponse } from 'next/server'
import { getSaptServerConfig, isSaptConfigured } from '@/lib/sapt-config'
import { bookingExternalId, leadTracking, promotedAnswers, validateBooking } from '@/lib/booking'
import { ingestObject } from '@/lib/sapt-server'

/**
 * POST /api/book
 *
 * Saves a completed booking to the Sapt CRM as a record of your `booking`
 * object type (POST → CRM). Public — needs only the Project ID.
 *
 * The `booking` type must exist in your project with `isPublicIngestable: true`
 * before this works. Create it once (one call on the Sapt MCP, or by hand — see
 * SAPT_SETUP_GUIDE.md). Until then this returns a clear error so you know to set
 * it up, rather than silently dropping the booking.
 *
 * ONE EVENT ID PER BOOKING. The browser mints `leadEventId` once per
 * submission; it goes to Sapt as `tracking.lead.eventId`, Sapt uses it for the
 * Lead it reports to Meta from the server, and it comes back as
 * `conversionEventId`, the only id the browser's Pixel Lead may fire with. The
 * same string on both sides is what stops Meta counting every booking twice.
 * `held` means Sapt withheld the booking (spam, or not qualified) and sends
 * no Lead, so the Pixel must not either. See src/lib/meta-pixel.ts.
 */

interface BookingBody {
  name?: string
  email?: string
  phone?: string
  service?: string
  serviceName?: string
  vehicle?: string
  date?: string // ISO date the visitor requested (optional — lead funnels omit it)
  time?: string // human label, e.g. "2:00 PM"
  answers?: Record<string, unknown> // funnel step answers, keyed by step id
  visitorId?: string
  utm?: Record<string, string>
  /** Minted once per submission by the browser; see above. */
  leadEventId?: string
}

export async function POST(request: Request) {
  let body: BookingBody
  try {
    body = (await request.json()) as BookingBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const tracking = leadTracking({
    leadEventId: body.leadEventId,
    visitorId: body.visitorId,
    referer: request.headers.get('referer'),
    userAgent: request.headers.get('user-agent'),
  })

  if (!isSaptConfigured()) {
    // Template not wired to a project yet (e.g. local/demo). Don't show the
    // visitor a raw error — complete the funnel gracefully. The lead is NOT
    // saved; set NEXT_PUBLIC_SAPT_PROJECT_ID to enable real capture.
    console.warn('[/api/book] Sapt not configured — returning demo success (lead not saved).')
    return NextResponse.json({ ok: true, demo: true, held: false, conversionEventId: tracking.lead.eventId })
  }

  // A name and a phone number: a shop calls and texts, it does not email.
  const check = validateBooking(body)
  if (!check.ok) return NextResponse.json({ ok: false, error: check.error }, { status: 400 })
  const { name, email, phone } = check

  const { bookingTypeSlug } = getSaptServerConfig()
  const booking = await ingestObject(bookingTypeSlug, {
    externalId: bookingExternalId(check.phoneDigits),
    tracking,
    data: {
      name,
      ...(email ? { email } : {}),
      phone,
      service: body.serviceName || body.service,
      // Promoted out of the answers blob: a shop filters its board by what is
      // wrong with the car and how soon it needs to be in, reads what they
      // wrote under Other, and a workflow cannot branch on JSON.
      ...promotedAnswers(body.answers),
      ...(body.vehicle ? { vehicle: body.vehicle } : {}),
      preferredDate: body.date,
      preferredTime: body.time,
      // No `status`. The booking type carries a real stage pipeline, and a
      // record lands on whichever stage is marked `isInitial` without being
      // told. Sending one would be a value for a field that does not exist.
      source: 'booking_funnel',
      // Funnel step answers, stored as JSON. Unknown fields land as "pending
      // fields" in the Sapt schema editor — promote them to real fields if you
      // want to filter/report on them.
      ...(body.answers ? { answers: JSON.stringify(body.answers) } : {}),
      ...(body.visitorId ? { saptVisitorId: body.visitorId } : {}),
      ...(body.utm ?? {}),
    },
  })

  if (!booking.ok) {
    // Most common cause: the `booking` type hasn't been created (or isn't
    // publicly ingestable) yet. See SAPT_SETUP_GUIDE.md, section 4. The detail
    // is for the logs; the customer gets a plain sentence and the phone.
    console.warn(
      `[/api/book] CRM record failed (type "${bookingTypeSlug}"): ${JSON.stringify(booking.error)}`
    )
    return NextResponse.json(
      { ok: false, error: 'That did not go through on our end. Please call the shop and we will book you in.' },
      { status: 502 }
    )
  }

  // A held booking looks exactly like any other to the visitor; only the Pixel is told.
  return NextResponse.json({
    ok: true,
    bookingId: booking.data?.recordId ?? null,
    held: booking.data?.held === true,
    conversionEventId: booking.data?.held ? null : (booking.data?.conversionEventId ?? null),
  })
}
