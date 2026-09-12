import Link from 'next/link'
import { LegalLinks } from '../LegalLinks'
import { business, phoneHref, socialLinks } from '@/config/business'
import { design } from '@/config/design'
import type { LandingSpec } from '@/config/funnel'
import { summarizeHours } from '@/lib/hours'
import type { ReactNode } from 'react'
import { BookButton } from '../booking'
import { FitText } from '../FitText'
import { CallButton, Container, buttonClass } from '../primitives'
import { SocialLinks } from '../SocialIcons'
import { UsFlag } from '../UsFlag'

/**
 * The foot of the page: everything a customer might come back to find, laid
 * out like the back of a business card, with the name, address and phone
 * exactly as Google has them (the listing and the site must agree).
 *
 *   the page's closing ask (finalCta in funnel.ts) and the two actions
 *   the shop and its social profiles / visit / hours / contact
 *   the fine print: the other pages, the legal links, the flag (design.flag)
 *   the shop's name, huge, as the last thing on the page (design.footerWordmark)
 *
 * The first column is the shop's identity and nothing else. The links to the
 * other pages sit with the legal ones in the fine print, where a row of small
 * links is what a reader expects, instead of floating unlabelled under the
 * address while every other column carries a heading.
 */
export function SiteFooter({
  ctaLabel,
  finalCta,
  hasPosts = false,
}: Pick<LandingSpec, 'ctaLabel' | 'finalCta'> & { hasPosts?: boolean }) {
  const a = business.address
  const online = [
    business.mapsUrl && { href: business.mapsUrl, label: 'Google Maps' },
    business.reviewUrl && { href: business.reviewUrl, label: 'Leave a Google review' },
  ].filter((l): l is { href: string; label: string } => Boolean(l))

  return (
    <footer className="motif-ink relative overflow-hidden bg-ink text-white">
      <div className="motif-rule" aria-hidden />
      <Container className="pt-16 sm:pt-20">
        {/* The page's last ask, on the dark ground, so the page ends once. */}
        <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8 border-b border-white/15 pb-14">
          <div className="max-w-[40rem]">
            <h2 className="font-display text-[clamp(2.75rem,9vw,5rem)] leading-[0.9] font-bold tracking-[-0.01em] text-balance">
              {finalCta.title}
            </h2>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-white/70">{finalCta.subhead}</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <BookButton source="footer" className={buttonClass()}>
              {ctaLabel}
            </BookButton>
            <CallButton variant="inverse" />
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl leading-none font-bold uppercase tracking-[0.01em]">{business.name}</p>
            <p className="mt-3 text-white/65">
              {business.category} in {a.city}, {a.state}
            </p>
            {/* The marks alone, at the same weight as the text around them. A
                bordered box each made the least important thing in the footer
                the heaviest. The offset puts the first one on the column edge. */}
            <SocialLinks
              links={socialLinks()}
              className="mt-6 -ml-3"
              linkClassName="flex h-11 w-11 items-center justify-center text-white/60 transition-colors hover:text-white"
            />
          </div>

          <Column title="Visit">
            <address className="text-white/75 not-italic">
              {a.street}
              <br />
              {a.city}, {a.state} {a.postalCode}
            </address>
            {business.mapsUrl ? <FooterLink href={business.mapsUrl}>Get directions</FooterLink> : null}
          </Column>

          <Column title="Hours">
            <dl className="grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-white/75">
              {summarizeHours(business.hours).map((row) => (
                <div key={row.days} className="contents">
                  <dt className="font-medium text-white/90">{row.days}</dt>
                  <dd className="tabular-nums">{row.hours}</dd>
                </div>
              ))}
            </dl>
          </Column>

          <Column title="Contact">
            <a href={phoneHref()} className="block font-semibold tabular-nums hover:underline">
              {business.phone}
            </a>
            {business.email ? (
              <a href={`mailto:${business.email}`} className="mt-1.5 block break-all text-white/75 hover:text-white hover:underline">
                {business.email}
              </a>
            ) : null}
            {online.length ? (
              <ul className="mt-4 grid gap-1">
                {online.map((l) => (
                  <li key={l.label}>
                    <FooterLink href={l.href}>{l.label}</FooterLink>
                  </li>
                ))}
              </ul>
            ) : null}
          </Column>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-white/15 py-6 text-sm text-white/55">
          <span className="inline-flex items-center gap-2.5">
            {design.flag ? <UsFlag className="aspect-[19/10] h-3.5 w-auto shrink-0" /> : null}
            <span>
              © {new Date().getFullYear()} {business.name}. All rights reserved.
            </span>
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/services" className="underline-offset-4 hover:text-white hover:underline">
              Services
            </Link>
            {hasPosts ? (
              <Link href="/blog" className="underline-offset-4 hover:text-white hover:underline">
                Blog
              </Link>
            ) : null}
            <LegalLinks className="flex flex-wrap gap-x-5 gap-y-2" linkClassName="underline-offset-4 hover:text-white hover:underline" />
          </div>
          {business.serviceAreas.length ? <span>Also serving {business.serviceAreas.join(', ')}</span> : null}
        </div>

        {/* The whole name on one line, edge to edge of the content, in any
            typeface and at any width (see FitText). */}
        {design.footerWordmark ? (
          <div aria-hidden className="pointer-events-none pt-2 pb-5 select-none sm:pb-8">
            <FitText text={business.name} className="font-display leading-[0.8] font-bold uppercase text-white/[0.07]" />
          </div>
        ) : null}
      </Container>
    </footer>
  )
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-4 text-[15px] font-semibold text-white">{title}</h3>
      {children}
    </div>
  )
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="mt-2 inline-block text-white/75 underline-offset-4 hover:text-white hover:underline">
      {children}
    </a>
  )
}
