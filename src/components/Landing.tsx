'use client'

/**
 * The shop's website.
 *
 * Section order is lifted from what already works for independent auto repair,
 * because the pattern is proven and a shop owner recognises it: phone and star
 * rating pinned at the top, a photo of the actual building, the amenities that
 * decide which of three shops gets the call, the warranty, services, reviews,
 * then the form. What is different here is the execution — one column of real
 * typography instead of six competing widgets, and every fact read from
 * `business` so it matches the Google listing exactly.
 *
 * Photographs are load-bearing. A shop that shows its own bay outsells one
 * running stock images of somebody else's, so unfilled slots render a labelled
 * placeholder rather than quietly falling back to a stock photo.
 */

import { FunnelOverlay } from '@/components/funnel/FunnelOverlay'
import { business, dayName, formatTime, fullAddress, phoneHref } from '@/config/business'
import type { LandingSpec } from '@/config/funnel'
import { track } from '@/lib/analytics'
import { haptic } from '@/lib/haptics'
import { image, type SlotId } from '@/lib/images'
import { localBusinessSchema } from '@/lib/schema'
import { ArrowUpRight, Clock, MapPin, Phone, ShieldCheck, Star } from 'lucide-react'
import { useState } from 'react'

/**
 * Renders a slot, placeholder included.
 *
 * By default the slot's declared ratio sets the height, which is what keeps a
 * grid of photos from reflowing as they load. `fill` instead stretches the
 * photo to whatever height its parent already has: the hero has copy laid over
 * it, and on a phone that copy is twice as tall as a 16:9 crop of the same
 * width, so there the copy has to set the height and the photo has to follow.
 */
function Shot({ id, className, fill }: { id: SlotId; className?: string; fill?: boolean }) {
  const img = image(id, { withLabel: !fill })
  return (
    <div
      className={fill ? `absolute inset-0 ${className ?? ''}` : className}
      style={{
        ...(fill ? null : { aspectRatio: String(img.ratio) }),
        background: '#EEEDEA',
        overflow: 'hidden',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.src}
        alt={img.alt}
        className="h-full w-full object-cover"
        // The hero is the largest-contentful paint. Lazy-loading it is a
        // measurable delay on the one image the visitor is waiting for.
        loading={fill ? 'eager' : 'lazy'}
      />
    </div>
  )
}

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-4 w-4"
          fill={n <= Math.round(value) ? '#FBBC04' : 'transparent'}
          stroke="#FBBC04"
        />
      ))}
    </span>
  )
}

export function Landing({ spec }: { spec: LandingSpec }) {
  const [open, setOpen] = useState(false)

  const openFunnel = () => {
    haptic('light')
    track('funnel_open', {})
    setOpen(true)
  }

  const today = new Date().getDay()
  const todayHours = business.hours.find((h) => h.day === today)
  const hero = image('hero', { withLabel: false })

  return (
    <div className="bg-bg text-text">
      {/* Machine-readable before it is human-readable: the local pack and every
          answer engine read this before a word of the page. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema()) }}
      />

      {/* ── Utility bar: rating, phone, book. Never scrolls away on desktop. ── */}
      <div className="border-b border-border bg-text text-bg">
        <div className="mx-auto flex max-w-6xl items-center gap-x-6 px-5 py-2.5 text-sm">
          {business.rating && business.rating.count > 0 ? (
            <a
              href={business.mapsUrl || '#reviews'}
              className="flex min-w-0 items-center gap-2 opacity-90 hover:opacity-100"
            >
              <Stars value={business.rating.value} />
              <span className="font-semibold">{business.rating.value.toFixed(1)}</span>
              <span className="truncate underline underline-offset-2">
                {business.rating.count} Google reviews
              </span>
            </a>
          ) : (
            <span className="truncate opacity-70">{business.category}</span>
          )}

          {/* Hidden on a phone: both of these repeat the sticky bar pinned to
              the bottom of the same screen, and wrapping them here pushed the
              headline off the top of the viewport. */}
          <a href={phoneHref()} className="ml-auto hidden items-center gap-2 font-semibold sm:flex">
            <Phone className="h-4 w-4" />
            {business.phone}
          </a>
          <button
            type="button"
            onClick={openFunnel}
            className="hidden rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white sm:block"
          >
            {spec.ctaLabel}
          </button>
        </div>
      </div>

      {/* ── Header ── */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 sm:py-5">
          {spec.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spec.logo.src} alt={spec.logo.alt} className="h-9 w-auto object-contain" />
          ) : (
            <span className="font-display text-base font-bold uppercase tracking-[0.18em]">
              {business.name}
            </span>
          )}
          <span className="hidden text-sm text-text-light sm:block">
            {business.address.city}, {business.address.state}
          </span>
        </div>
      </header>

      {/* ── Hero: the building, not a stock garage ──
          The photo sits BEHIND the copy in the stacking order but not above it
          in the layout. The copy is in normal flow, so the section is always
          as tall as the words plus the buttons; the photo stretches to match.
          Sizing the section by the photo's ratio instead put a 400px block of
          absolutely positioned copy inside a 219px box on a phone, and it
          spilled up through the header. */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <Shot id="hero" fill />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/55 to-black/25" />
        </div>
        {/* The brief for the one photo that cannot be skipped, stated in the
            page rather than inside the placeholder image, because a stretched
            placeholder crops its own caption to wherever the crop lands. It
            disappears the moment the slot has a photo. */}
        {hero.missing ? (
          <p className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-black/50 px-5 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-white/85">
            Photo needed: {hero.brief}
          </p>
        ) : null}
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-20 sm:pb-14 sm:pt-48">
          <h1 className="max-w-[18ch] text-balance font-display text-[clamp(30px,8.5vw,60px)] font-bold leading-[1.05] text-white">
            {spec.hero.headline}
          </h1>
          <p className="mt-4 max-w-[46ch] text-base text-white/85 sm:text-lg">
            {spec.hero.subhead}
          </p>
          {/* Full-width buttons on a phone: a thumb reaching across a moving
              car does not aim. They shrink to their content from `sm` up. */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <button
              type="button"
              onClick={openFunnel}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white"
            >
              {spec.ctaLabel}
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <a
              href={phoneHref()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/50 bg-black/25 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm"
            >
              <Phone className="h-4 w-4" />
              Call {business.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── Amenities + warranty: what actually decides the call ── */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-5 px-5 py-8 sm:grid-cols-2 sm:gap-8 sm:py-10 lg:grid-cols-4">
          {business.warranty ? (
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <p className="font-semibold">
                  {business.warranty.months} months / {business.warranty.miles.toLocaleString()} miles
                </p>
                <p className="text-sm text-text-light">Nationwide warranty on qualifying work</p>
              </div>
            </div>
          ) : null}
          {business.amenities.slice(0, 3).map((a) => (
            <div key={a} className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <p className="font-medium">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Welcome ── */}
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Shot id="exterior" className="rounded-2xl" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-light">
            {business.address.city}, {business.address.state}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">
            Welcome to {business.name}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-text-muted">{business.description}</p>
          {business.yearEstablished ? (
            <p className="mt-4 font-semibold">
              Serving {business.address.city} since {business.yearEstablished}.
            </p>
          ) : null}
          <button
            type="button"
            onClick={openFunnel}
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-white"
          >
            {spec.ctaLabel}
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">What we fix</h2>
          <div className="mt-8 grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {business.services.map((s, i) => (
              <div key={s} className="flex items-baseline gap-4 border-b border-border py-3">
                <span className="font-mono text-xs text-text-light">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-medium">{s}</span>
              </div>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <Shot id="bay" className="rounded-xl" />
            <Shot id="interior" className="rounded-xl" />
            <Shot id="detail" className="rounded-xl" />
          </div>
        </div>
      </section>

      {/* ── Reviews ── */}
      <section id="reviews" className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">What customers say</h2>
          {business.reviewUrl ? (
            <a
              href={business.reviewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold underline underline-offset-4"
            >
              Leave a review
            </a>
          ) : null}
        </div>

        {business.rating && business.rating.count > 0 ? (
          <p className="mt-3 flex items-center gap-2 text-text-muted">
            <Stars value={business.rating.value} />
            <span className="font-semibold text-text">{business.rating.value.toFixed(1)}</span>
            <span>from {business.rating.count} Google reviews</span>
          </p>
        ) : null}

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {spec.proof.items.slice(0, 2).map((t) => (
            <figure key={t.author} className="rounded-2xl border border-border p-6">
              <Stars value={5} />
              <blockquote className="mt-3 text-base leading-relaxed">{t.quote}</blockquote>
              <figcaption className="mt-4 text-sm font-semibold text-text-light">
                {t.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── Team ── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">The people doing the work</h2>
            <p className="mt-5 text-base leading-relaxed text-text-muted">
              Every job is explained before it starts, and nothing gets done that does not need
              doing.
            </p>
            {business.certifications.length ? (
              <ul className="mt-6 flex flex-wrap gap-2">
                {business.certifications.map((c) => (
                  <li
                    key={c}
                    className="rounded-full border border-border px-4 py-1.5 text-sm font-medium"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <Shot id="team" className="rounded-2xl" />
        </div>
      </section>

      {/* ── Book ── */}
      <section className="mx-auto max-w-6xl px-5 py-12 text-center sm:py-16">
        <h2 className="font-display text-3xl font-bold sm:text-5xl">{spec.finalCta.title}</h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-text-muted">{spec.finalCta.subhead}</p>
        <button
          type="button"
          onClick={openFunnel}
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white sm:w-auto"
        >
          {spec.ctaLabel}
          <ArrowUpRight className="h-5 w-5" />
        </button>
      </section>

      {/* ── Footer: the facts, matching the Google listing exactly ── */}
      <footer className="border-t border-border bg-text text-bg">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:grid-cols-2 sm:gap-10 sm:py-14 lg:grid-cols-3">
          <div>
            <p className="font-display text-lg font-bold">{business.name}</p>
            <a
              href={business.mapsUrl || undefined}
              target="_blank"
              rel="noreferrer"
              className="mt-4 flex items-start gap-2 text-sm opacity-80 hover:opacity-100"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {fullAddress()}
            </a>
            <a href={phoneHref()} className="mt-3 flex items-center gap-2 text-sm opacity-80">
              <Phone className="h-4 w-4" />
              {business.phone}
            </a>
          </div>

          <div>
            <p className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4" />
              Hours
              {todayHours && !todayHours.closed ? (
                <span className="ml-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">
                  Open today until {formatTime(todayHours.close)}
                </span>
              ) : null}
            </p>
            <dl className="mt-4 space-y-1.5 text-sm opacity-80">
              {business.hours.map((h) => (
                <div key={h.day} className="flex justify-between gap-6">
                  <dt className={h.day === today ? 'font-semibold opacity-100' : ''}>
                    {dayName(h.day)}
                  </dt>
                  <dd className="tabular-nums">
                    {h.closed ? 'Closed' : `${formatTime(h.open)} – ${formatTime(h.close)}`}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col items-start gap-3">
            {business.mapsUrl ? (
              <a
                href={business.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold"
              >
                Get directions
              </a>
            ) : null}
            {business.reviewUrl ? (
              <a
                href={business.reviewUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold"
              >
                Leave a Google review
              </a>
            ) : null}
            {business.serviceAreas.length ? (
              <p className="mt-2 text-xs leading-relaxed opacity-60">
                Also serving {business.serviceAreas.join(', ')}
              </p>
            ) : null}
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs opacity-60">
          © {new Date().getFullYear()} {business.name}. {spec.footerSuffix}
        </div>
      </footer>

      {/* ── Sticky call/book bar. A shop owner's customer is on a phone. ── */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-bg px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:hidden">
        <a
          href={phoneHref()}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border py-3 font-semibold"
        >
          <Phone className="h-4 w-4" />
          Call
        </a>
        <button
          type="button"
          onClick={openFunnel}
          className="flex-1 rounded-full bg-primary py-3 font-semibold text-white"
        >
          {spec.ctaLabel}
        </button>
      </div>
      {/* Stands in for the fixed bar above, which is out of flow. */}
      <div className="h-[calc(72px+env(safe-area-inset-bottom))] sm:hidden" />

      {open && (
        <FunnelOverlay
          flow={spec.funnel}
          brandName={business.name}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
