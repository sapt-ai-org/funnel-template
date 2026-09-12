'use client'

import { LegalLinks } from '@/components/site/LegalLinks'
import { buttonClass } from '@/components/site/button'
import { business, reviewGate } from '@/config/business'
import clsx from 'clsx'
import { useState } from 'react'

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

const FIELD = 'h-14 w-full rounded-md border-[1.5px] border-border bg-surface px-4 text-lg outline-none transition-colors placeholder:text-text-light focus:border-text focus-visible:outline-none'

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
    <main className="min-h-[100svh] bg-bg">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-lg flex-col px-5 pt-8 pb-14">
        <p className="font-display text-xl font-bold uppercase tracking-[0.02em]">{business.name}</p>

        <div className="flex flex-1 flex-col justify-center py-10">
          {sent ? (
            <div>
              <h1 className="font-display text-5xl font-bold leading-[0.95]">Thank you.</h1>
              <p className="mt-4 text-lg text-text-muted">
                The owner has your note and will reach out personally.
              </p>
            </div>
          ) : rating !== null && rating < reviewGate.minStarsToGoogle ? (
            <div>
              <h1 className="font-display text-5xl font-bold leading-[0.95]">What went wrong?</h1>
              <p className="mt-4 text-lg text-text-muted">
                This goes straight to the owner. We would rather fix it than leave it.
              </p>

              <form onSubmit={submitFeedback} className="mt-8 grid gap-3">
                <input
                  required
                  aria-label="Your name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={FIELD}
                />
                <input
                  required
                  type="tel"
                  aria-label="Phone"
                  autoComplete="tel"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={FIELD}
                />
                <textarea
                  required
                  rows={5}
                  aria-label="What happened?"
                  placeholder="What happened?"
                  value={form.comments}
                  onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  className={clsx(FIELD, 'h-auto py-3.5')}
                />
                <button type="submit" disabled={busy} className={clsx(buttonClass({ block: true }), 'mt-2')}>
                  {busy ? 'Sending…' : 'Send to the owner'}
                </button>
              </form>
            </div>
          ) : (
            <div>
              <h1 className="font-display text-5xl font-bold leading-[0.95] sm:text-6xl">How did we do?</h1>
              <p className="mt-4 text-lg text-text-muted">Tap a star. It takes a second.</p>

              <div className="mt-10 flex gap-1.5" onMouseLeave={() => setHover(null)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => choose(n)}
                    className="rounded-lg p-1"
                  >
                    <svg viewBox="0 0 24 24" className="h-14 w-14" fill={n <= shown ? '#FBBC04' : 'var(--border)'} aria-hidden>
                      <path d="M12 2l2.9 6.3 6.6.7-4.9 4.4 1.4 6.6L12 16.6 6 20l1.4-6.6L2.5 9l6.6-.7z" />
                    </svg>
                  </button>
                ))}
              </div>

              {!business.reviewUrl ? (
                <p className="mt-10 rounded-md border-[1.5px] border-dashed border-border px-4 py-3 text-[15px] text-text-muted">
                  No Google review link yet. Run <code className="font-semibold text-text">pnpm pull-gbp</code> to
                  fetch it from the Business Profile.
                </p>
              ) : null}
            </div>
          )}
        </div>
        <LegalLinks className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-text-muted" linkClassName="underline-offset-4 hover:text-text hover:underline" />
      </div>
    </main>
  )
}
