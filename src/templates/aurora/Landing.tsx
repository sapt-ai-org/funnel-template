'use client'

/**
 * Aurora — soft, centered, card-based. The original client-demo design.
 *
 * A TEMPLATE: it renders the shared `LandingSpec`, and is swapped by changing
 * the single import in `src/app/page.tsx`.
 *
 * Genuinely shared, do not reimplement: `FunnelOverlay` (the quiz takeover),
 * `/api/book` (lead capture), and the `track` / `haptic` utilities.
 *
 * Owned per-template, must be wired in every template: the `open` state that
 * gates the overlay, and an `openFunnel()` that fires `haptic` + `track(
 * 'funnel_open')` before setting it. Copy that wiring when adding a template.
 */

import { FunnelOverlay } from '@/components/funnel/FunnelOverlay'
import type { LandingSpec } from '@/config/funnel'
import { track } from '@/lib/analytics'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'
import { ArrowRight, ChevronDown, Star } from 'lucide-react'
import { useState } from 'react'

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
      ))}
    </div>
  )
}

function Cta({ label, onClick, className }: { label: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full bg-primary-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:bg-primary-600 hover:shadow-xl active:scale-[0.99]',
        className
      )}
    >
      {label}
      <ArrowRight className="h-5 w-5" />
    </button>
  )
}

export function Landing({ spec }: { spec: LandingSpec }) {
  const [open, setOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(0)

  const openFunnel = () => {
    haptic('light')
    track('funnel_open', {})
    setOpen(true)
  }

  return (
    <div className="bg-bg text-text">
      {/* ── Minimal header ── */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        {spec.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={spec.logo.src} alt={spec.logo.alt} className="h-9 w-auto object-contain" />
        ) : (
          <span className="font-display text-lg font-bold tracking-tight">{spec.brandName}</span>
        )}
        <button
          onClick={openFunnel}
          className="hidden rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600 sm:inline-flex"
        >
          {spec.ctaLabel}
        </button>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-gradient-to-b from-primary-50 to-transparent" />
        <div className="relative mx-auto max-w-3xl px-5 pb-16 pt-16 text-center sm:pt-24">
          {spec.hero.rating && (
            <div className="mb-5 flex flex-col items-center gap-1.5">
              <Stars />
              <p className="text-sm text-text-muted">
                <span className="font-semibold text-text">{spec.hero.rating.score}</span> {spec.reviewConnector} {spec.hero.rating.count}
              </p>
            </div>
          )}
          <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-primary-600">{spec.hero.eyebrow}</p>
          <h1 className="font-display text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            {spec.hero.headline}
          </h1>
          {spec.hero.subhead && <p className="mx-auto mt-5 max-w-xl text-lg text-text-muted">{spec.hero.subhead}</p>}
          <div className="mt-8">
            <Cta label={spec.ctaLabel} onClick={openFunnel} />
          </div>

          {/* Trust logos */}
          <div className="mt-16">
            <p className="mb-6 text-sm font-medium text-text-light">{spec.trustLabel}</p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {spec.trustLogos.map((logo) => (
                <span key={logo} className="font-display text-xl font-bold tracking-tight text-text-light/70">
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="bg-border-light/60 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-600">{spec.benefits.eyebrow}</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{spec.benefits.title}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {spec.benefits.items.map((b) => (
              <div key={b.title} className="rounded-3xl bg-surface p-8 shadow-sm ring-1 ring-border">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-3xl">{b.emoji}</div>
                <h3 className="mb-2 font-display text-xl font-bold">{b.title}</h3>
                <p className="leading-relaxed text-text-muted">{b.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Cta label={spec.ctaLabel} onClick={openFunnel} />
          </div>
        </div>
      </section>

      {/* ── Case studies / testimonials ── */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-600">{spec.proof.eyebrow}</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{spec.proof.title}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {spec.proof.items.map((t, i) => (
              <figure key={`${t.author}-${i}`} className="flex flex-col rounded-3xl bg-surface p-8 shadow-sm ring-1 ring-border">
                <Stars n={t.rating ?? 5} />
                <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-text">“{t.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 font-semibold text-white">
                    {t.author.charAt(0)}
                  </span>
                  <span>
                    <span className="block font-semibold">{t.author}</span>
                    <span className="block text-sm text-text-muted">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-border-light/60 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-5">
          <div className="mb-12 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-600">{spec.faq.eyebrow}</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{spec.faq.title}</h2>
          </div>
          <div className="space-y-3">
            {spec.faq.items.map((f, i) => {
              const isOpen = faqOpen === i
              return (
                <div key={f.q} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
                  <button
                    onClick={() => setFaqOpen(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left font-semibold"
                  >
                    {f.q}
                    <ChevronDown className={cn('h-5 w-5 flex-shrink-0 text-text-muted transition-transform', isOpen && 'rotate-180')} />
                  </button>
                  {isOpen && <p className="px-6 pb-5 leading-relaxed text-text-muted">{f.a}</p>}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 py-20 sm:py-24">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-500 to-accent-500 px-6 py-16 text-center text-white shadow-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <p className="relative mb-3 text-sm font-semibold uppercase tracking-wide text-white/80">{spec.finalCta.eyebrow}</p>
          <h2 className="relative font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{spec.finalCta.title}</h2>
          {spec.finalCta.subhead && <p className="relative mx-auto mt-4 max-w-lg text-lg text-white/85">{spec.finalCta.subhead}</p>}
          <button
            onClick={openFunnel}
            className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-primary-600 shadow-lg transition-all hover:bg-white/90 active:scale-[0.99]"
          >
            {spec.ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <footer className="border-t border-border py-10 text-center text-sm text-text-light">
        <p className="font-display font-bold text-text">{spec.brandName}</p>
        <p className="mt-1">© {new Date().getFullYear()} {spec.brandName}. {spec.footerSuffix}</p>
      </footer>

      {open && <FunnelOverlay flow={spec.funnel} brandName={spec.brandName} onClose={() => setOpen(false)} />}
    </div>
  )
}
