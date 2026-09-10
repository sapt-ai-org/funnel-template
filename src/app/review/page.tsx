'use client'

import { useState } from 'react'
import { business, reviewGate } from '@/config/business'

/**
 * The review flow.
 *
 * One question, five targets, no chrome. This page is opened from a text
 * message on a phone, usually one-handed, usually within an hour of the
 * customer collecting their car. Anything that takes more than one tap to
 * answer loses most of the people who would have left a review.
 *
 * Where a rating goes is decided by `reviewGate.minStarsToGoogle`, not by a
 * branch in here — see the note on that config for what the threshold means
 * and why it is a single number.
 */
export default function ReviewPage() {
  const [rating, setRating] = useState<number | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', comments: '' })

  const shown = hover ?? rating ?? 0

  function choose(stars: number) {
    setRating(stars)
    if (stars >= reviewGate.minStarsToGoogle && business.reviewUrl) {
      // Straight out to Google. No interstitial "thanks!" screen: every extra
      // tap between the star and the review form costs completions.
      window.location.href = business.reviewUrl
    }
  }

  async function submitFeedback(e: React.FormEvent) {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, ...form }),
      })
    } catch {
      // The customer has done their part. Swallow it rather than showing an
      // error that reads as a second failure on top of whatever went wrong
      // with their car.
    }
    setBusy(false)
    setSent(true)
  }

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-lg flex-col justify-center px-6 py-14">
      {sent ? (
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Thank you.</h1>
          <p className="mt-3 text-neutral-600">
            {business.name} has your note and the owner will reach out personally.
          </p>
        </div>
      ) : rating !== null && rating < reviewGate.minStarsToGoogle ? (
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">What went wrong?</h1>
          <p className="mt-3 text-neutral-600">
            This goes straight to the owner. We would rather fix it than leave it.
          </p>

          <form onSubmit={submitFeedback} className="mt-7 grid gap-4">
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-neutral-300 px-4 py-3.5 text-base outline-none focus:border-neutral-900"
            />
            <input
              required
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-xl border border-neutral-300 px-4 py-3.5 text-base outline-none focus:border-neutral-900"
            />
            <textarea
              required
              rows={5}
              placeholder="What happened?"
              value={form.comments}
              onChange={(e) => setForm({ ...form, comments: e.target.value })}
              className="rounded-xl border border-neutral-300 px-4 py-3.5 text-base outline-none focus:border-neutral-900"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-neutral-900 px-6 py-4 text-base font-semibold text-white disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Send to the owner'}
            </button>
          </form>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">How did we do?</h1>
          <p className="mt-3 text-neutral-600">Tap a star. It takes a second.</p>

          <div className="mt-9 flex justify-center gap-2" onMouseLeave={() => setHover(null)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                onMouseEnter={() => setHover(n)}
                onClick={() => choose(n)}
                className="p-1 transition-transform hover:scale-110"
              >
                <svg viewBox="0 0 24 24" className="h-12 w-12" fill={n <= shown ? '#FBBC04' : '#E5E5E5'}>
                  <path d="M12 2l2.9 6.3 6.6.7-4.9 4.4 1.4 6.6L12 16.6 6 20l1.4-6.6L2.5 9l6.6-.7z" />
                </svg>
              </button>
            ))}
          </div>

          {!business.reviewUrl ? (
            <p className="mt-8 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              No Google review link configured yet. Run <code>pnpm pull-gbp</code> to fetch it
              from the Business Profile.
            </p>
          ) : null}
        </div>
      )}
    </main>
  )
}
