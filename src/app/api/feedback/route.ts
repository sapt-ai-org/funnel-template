import { NextResponse } from 'next/server'
import { getSaptServerConfig, isSaptConfigured } from '@/lib/sapt-config'
import { ingestObject } from '@/lib/sapt-server'

/**
 * POST /api/feedback
 *
 * The internal side of the review flow: a customer who rated below the Google
 * threshold. Written to the same `booking` type with a `feedback` source so it
 * lands in one inbox and can trigger the owner's follow-up automation, rather
 * than sitting in a second system nobody opens.
 *
 * This is a service-recovery signal, not a lead. It should be the fastest
 * notification the shop gets: an unhappy customer who has just been asked for
 * a review is the most reversible unhappy customer there is, and the window
 * is hours, not days.
 */
interface FeedbackBody {
  rating?: number
  name?: string
  phone?: string
  email?: string
  comments?: string
}

export async function POST(request: Request) {
  if (!isSaptConfigured()) {
    console.warn('[/api/feedback] Sapt not configured — feedback not saved.')
    return NextResponse.json({ ok: true, demo: true })
  }

  let body: FeedbackBody
  try {
    body = (await request.json()) as FeedbackBody
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const rating = Number(body.rating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ ok: false, error: 'A rating of 1 to 5 is required' }, { status: 400 })
  }

  const { bookingTypeSlug } = getSaptServerConfig()
  const result = await ingestObject(bookingTypeSlug, {
    data: {
      name: body.name?.trim() || 'Anonymous',
      email: body.email?.trim() || '',
      phone: body.phone?.trim() || '',
      service: 'Customer feedback',
      status: 'new',
      source: 'feedback',
      rating,
      answers: JSON.stringify({ rating, comments: body.comments?.trim() || '' }),
    },
  })

  if (!result.ok) {
    console.error('[/api/feedback] ingest failed:', result.error)
    return NextResponse.json({ ok: false, error: 'Could not save feedback' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
