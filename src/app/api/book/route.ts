import { NextResponse } from 'next/server'
import { getSaptServerConfig, isSaptConfigured } from '@/lib/sapt-config'
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
}

export async function POST(request: Request) {
  if (!isSaptConfigured()) {
    // Template not wired to a project yet (e.g. local/demo). Don't show the
    // visitor a raw error — complete the funnel gracefully. The lead is NOT
    // saved; set NEXT_PUBLIC_SAPT_PROJECT_ID to enable real capture.
    console.warn('[/api/book] Sapt not configured — returning demo success (lead not saved).')
    return NextResponse.json({ ok: true, demo: true })
  }

  let body: BookingBody
  try {
    body = (await request.json()) as BookingBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const email = body.email?.trim()
  const name = body.name?.trim()
  if (!email || !name) {
    return NextResponse.json(
      { ok: false, error: 'Name and email are required.' },
      { status: 400 }
    )
  }

  const { bookingTypeSlug } = getSaptServerConfig()
  const booking = await ingestObject(bookingTypeSlug, {
    externalId: `booking:${email}:${body.date ?? ''}:${body.time ?? ''}`,
    data: {
      name,
      email,
      phone: body.phone,
      service: body.serviceName || body.service,
      // Promoted out of the answers blob: a shop filters its board by what is
      // wrong with the car and how soon it needs to be in, and a workflow
      // cannot branch on a field buried in JSON.
      ...(typeof body.answers?.issue === 'string' ? { issue: body.answers.issue } : {}),
      ...(typeof body.answers?.timing === 'string' ? { timing: body.answers.timing } : {}),
      ...(body.vehicle ? { vehicle: body.vehicle } : {}),
      preferredDate: body.date,
      preferredTime: body.time,
      // `status` targets a Sapt SELECT field. Its choices MUST be stored as
      // {id,slug,label} objects in the project (slug = the value sent here),
      // or Sapt rejects every submit with "Unknown choice". See SAPT_SETUP_GUIDE.md.
      status: 'new',
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
    // publicly ingestable) yet. See SAPT_SETUP_GUIDE.md, section 4.
    console.warn(
      `[/api/book] CRM record failed (type "${bookingTypeSlug}"): ${booking.error}`
    )
    return NextResponse.json(
      { ok: false, error: booking.error ?? 'Could not save your booking.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ ok: true, bookingId: booking.data?.recordId ?? null })
}
