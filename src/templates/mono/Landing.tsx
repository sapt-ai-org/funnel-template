'use client'

/**
 * Mono — editorial and typographic. Left-aligned, full-bleed, hairline rules,
 * numbered benefits, one pull-quote, persistent bottom CTA bar. The
 * counterweight to Aurora's soft centered cards.
 *
 * A TEMPLATE: it renders the shared `LandingSpec` and owns nothing else.
 *
 * Deliberately not rendered by this template: `benefits.items[].emoji`
 * (numerals replace icons) and `proof.items[].rating` (the pull-quote carries
 * no star row). Both are spec fields Aurora does render — an operator swapping
 * templates will see them disappear. `proof.items[1..]` are also unused; mono
 * shows only the first testimonial by design.
 */

import { FunnelOverlay } from '@/components/funnel/FunnelOverlay'
import type { LandingSpec } from '@/config/funnel'
import { track } from '@/lib/analytics'
import { haptic } from '@/lib/haptics'
import { cn } from '@/lib/utils'
import { ArrowUpRight, Minus, Plus, Star } from 'lucide-react'
import { useState } from 'react'

export function Landing({ spec }: { spec: LandingSpec }) {
  const [open, setOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  const openFunnel = () => {
    haptic('light')
    track('funnel_open', {})
    setOpen(true)
  }

  return (
    <div className="bg-bg text-text pb-24">
      {/* ── Rule-bound header ── */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-baseline justify-between px-5 py-6">
          {spec.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={spec.logo.src} alt={spec.logo.alt} className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-display text-sm font-bold uppercase tracking-[0.2em]">
              {spec.brandName}
            </span>
          )}
          <span className="text-xs uppercase tracking-widest text-text-light">
            {spec.hero.eyebrow}
          </span>
        </div>
      </header>

      {/* ── Left-aligned hero ── */}
      <section className="mx-auto max-w-5xl px-5 pb-20 pt-16 sm:pt-24">
        {spec.hero.rating && (
          <p className="mb-8 flex items-center gap-2 text-sm text-text-muted">
            <Star className="h-4 w-4 fill-text text-text" />
            <span className="font-semibold text-text">{spec.hero.rating.score}</span>
            <span>from {spec.hero.rating.count}</span>
          </p>
        )}
        <h1 className="max-w-3xl font-display text-[2.75rem] font-black leading-[0.98] tracking-tight sm:text-6xl md:text-7xl">
          {spec.hero.headline}
        </h1>
        {spec.hero.subhead && (
          <p className="mt-8 max-w-xl border-l-2 border-primary-500 pl-5 text-lg leading-relaxed text-text-muted">
            {spec.hero.subhead}
          </p>
        )}
        <button
          onClick={openFunnel}
          className="group mt-10 inline-flex items-center gap-3 border-b-2 border-text pb-1 font-display text-lg font-bold tracking-tight transition-colors hover:border-primary-500 hover:text-primary-500"
        >
          {spec.ctaLabel}
          <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </section>

      {/* ── Trust strip ── */}
      <section className="border-y border-border bg-surface">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-8 gap-y-3 px-5 py-6">
          <span className="text-xs uppercase tracking-widest text-text-light">
            {spec.trustLabel}
          </span>
          {spec.trustLogos.map((logo) => (
            <span
              key={logo}
              className="font-display text-sm font-bold tracking-tight text-text-muted"
            >
              {logo}
            </span>
          ))}
        </div>
      </section>

      {/* ── Numbered benefits ── */}
      <section className="mx-auto max-w-5xl px-5 py-20">
        <p className="mb-2 text-xs uppercase tracking-widest text-primary-600">
          {spec.benefits.eyebrow}
        </p>
        <h2 className="mb-12 max-w-2xl font-display text-3xl font-black tracking-tight sm:text-4xl">
          {spec.benefits.title}
        </h2>
        <ol className="border-t border-border">
          {spec.benefits.items.map((b, i) => (
            <li
              key={b.title}
              className="grid gap-2 border-b border-border py-8 sm:grid-cols-[4rem_1fr_2fr] sm:gap-8"
            >
              <span className="font-display text-2xl font-black text-primary-500">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display text-xl font-bold">{b.title}</h3>
              <p className="leading-relaxed text-text-muted">{b.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Single pull-quote ── */}
      {spec.proof.items[0] && (
        <section className="bg-surface">
          <div className="mx-auto max-w-4xl px-5 py-20">
            <p className="mb-2 text-xs uppercase tracking-widest text-primary-600">
              {spec.proof.eyebrow}
            </p>
            <h2 className="mb-8 max-w-2xl font-display text-3xl font-black tracking-tight">
              {spec.proof.title}
            </h2>
            <blockquote className="font-display text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
              “{spec.proof.items[0].quote}”
            </blockquote>
            <p className="mt-6 text-sm text-text-muted">
              {spec.proof.items[0].author} — {spec.proof.items[0].role}
            </p>
          </div>
        </section>
      )}

      {/* ── FAQ as a rule-separated list ── */}
      <section className="mx-auto max-w-3xl px-5 py-20">
        <p className="mb-2 text-xs uppercase tracking-widest text-primary-600">
          {spec.faq.eyebrow}
        </p>
        <h2 className="mb-10 font-display text-3xl font-black tracking-tight">{spec.faq.title}</h2>
        <div className="border-t border-border">
          {spec.faq.items.map((f, i) => {
            const isOpen = faqOpen === i
            return (
              <div key={f.q} className="border-b border-border">
                <button
                  onClick={() => setFaqOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left font-display font-bold"
                >
                  {f.q}
                  {isOpen ? (
                    <Minus className="h-4 w-4 flex-shrink-0 text-primary-500" />
                  ) : (
                    <Plus className="h-4 w-4 flex-shrink-0 text-text-light" />
                  )}
                </button>
                {isOpen && <p className="pb-5 leading-relaxed text-text-muted">{f.a}</p>}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Final CTA, flat and full-bleed ── */}
      <section className="border-t border-border bg-primary-500 text-white">
        <div className="mx-auto max-w-5xl px-5 py-20">
          <p className="mb-2 text-xs uppercase tracking-widest text-white/70">
            {spec.finalCta.eyebrow}
          </p>
          <h2 className="max-w-2xl font-display text-3xl font-black tracking-tight sm:text-5xl">
            {spec.finalCta.title}
          </h2>
          {spec.finalCta.subhead && (
            <p className="mt-4 max-w-lg text-lg text-white/85">{spec.finalCta.subhead}</p>
          )}
          <button
            onClick={openFunnel}
            className="mt-8 inline-flex items-center gap-3 bg-white px-7 py-4 font-display font-bold tracking-tight text-primary-600 transition-transform active:scale-[0.99]"
          >
            {spec.ctaLabel}
            <ArrowUpRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-5 py-10 text-xs uppercase tracking-widest text-text-light">
        © {new Date().getFullYear()} {spec.brandName}
      </footer>

      {/* ── Persistent bottom CTA bar ── */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur',
          open && 'hidden'
        )}
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <span className="hidden text-sm text-text-muted sm:block">{spec.finalCta.title}</span>
          <button
            onClick={openFunnel}
            className="flex-1 bg-text px-6 py-3 font-display text-sm font-bold tracking-tight text-bg transition-opacity hover:opacity-90 sm:flex-none"
          >
            {spec.ctaLabel}
          </button>
        </div>
      </div>

      {open && (
        <FunnelOverlay
          flow={spec.funnel}
          brandName={spec.brandName}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  )
}
