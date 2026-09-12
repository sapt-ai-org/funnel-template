import { business, phoneHref } from '@/config/business'
import type { BookingService, LandingSpec } from '@/config/funnel'
import type { ResolvedPhoto } from '@/lib/images'
import { cn } from '@/lib/utils'
import { MapPin, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { HeroBooking } from './HeroBooking'
import { GoogleMark } from './primitives'

/**
 * The pieces every booking hero is made of: the home page's and each
 * service's. One photo behind, the words on the left, the booking card on the
 * right, the facts under the words. Built once here so the two heroes cannot
 * drift apart.
 */

/**
 * The photo behind a hero, under a navy wash strong enough that white type
 * always passes contrast, whatever the photo.
 *
 * Sized to the screen, not to the section: the booking form changes height as
 * someone moves through its steps, and a photo sized to the section would
 * zoom and re-crop on every step. `lvh` stays put when a phone's address bar
 * hides. Past the photo, the section's own navy carries on.
 */
export function HeroBackdrop({ photo }: { photo: ResolvedPhoto }) {
  return (
    <div aria-hidden className="absolute inset-x-0 top-0 -z-10 h-[max(100lvh,48rem)]">
      {/* eslint-disable-next-line @next/next/no-img-element -- served as-is; see Photo.tsx */}
      <img
        src={photo.src}
        srcSet={photo.srcSet}
        sizes="100vw"
        alt=""
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="h-full w-full object-cover"
      />
      {/* Darkest behind the words: left to right on a desktop, top to
          bottom on a phone, where the words sit above the form. */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(23_32_43/0.9)_0%,rgb(23_32_43/0.78)_100%)] lg:bg-[linear-gradient(90deg,rgb(23_32_43/0.93)_0%,rgb(23_32_43/0.8)_50%,rgb(23_32_43/0.5)_100%)]" />
      {/* The photo's lower edge fades into the navy, so a tall form never shows a seam. */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,var(--color-ink))]" />
    </div>
  )
}

/**
 * The booking column. From `lg` the form sits beside the headline and sets
 * the hero's height. An invisible copy of the card, holding the form's
 * tallest step, keeps that height fixed, so the hero and its photo stay put as
 * someone answers; the real card sits on top at its own height. Below `lg`
 * the card follows the headline and simply fits its step.
 *
 * Both copies get the same `service`, so the reserve holds the height of the
 * steps this form will actually ask.
 */
export function BookingSlot({
  funnel,
  ctaLabel,
  service,
  className,
}: {
  funnel: LandingSpec['funnel']
  ctaLabel: string
  service?: BookingService | null
  className?: string
}) {
  return (
    <div id="book" className={cn('scroll-mt-6 lg:grid', className)}>
      <BookingCard funnel={funnel} ctaLabel={ctaLabel} service={service} className="lg:[grid-area:1/1] lg:self-start" />
      <BookingCard
        funnel={funnel}
        ctaLabel={ctaLabel}
        service={service}
        reserve
        className="invisible hidden lg:block lg:[grid-area:1/1]"
      />
    </div>
  )
}

/** The white card: the booking form and the line under it for anyone who would rather call. */
function BookingCard({
  funnel,
  ctaLabel,
  service,
  reserve = false,
  className,
}: {
  funnel: LandingSpec['funnel']
  ctaLabel: string
  service?: BookingService | null
  reserve?: boolean
  className?: string
}) {
  return (
    <div
      aria-hidden={reserve || undefined}
      inert={reserve || undefined}
      className={cn(
        '-mx-1 rounded-md border border-border border-t-4 border-t-primary bg-surface p-4 text-text min-[360px]:p-5 sm:mx-0 sm:p-8 shadow-[0_32px_72px_-28px_rgb(0_0_0/0.65)]',
        className
      )}
    >
      <HeroBooking
        flow={funnel}
        shopName={business.name}
        phone={business.phone}
        phoneHref={phoneHref()}
        label={ctaLabel}
        service={service}
        reserve={reserve}
      />
      {/* The two promises that decide it for a nervous driver, in the card itself. */}
      {funnel.trust?.length ? (
        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-[15px] font-medium text-text-muted">
          {funnel.trust.map((t) => (
            <li key={t} className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-open" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-7 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-border pt-5 text-[15px]">
        <span className="text-text-muted">Rather talk to someone?</span>
        <a href={phoneHref()} className="font-semibold tabular-nums hover:underline">
          Call {business.phone}
        </a>
      </p>
    </div>
  )
}

/**
 * The facts that decide between shops, one short line each: the Google
 * rating, the warranty, the town.
 */
export function HeroFacts({ dark, className }: { dark: boolean; className?: string }) {
  const rating = business.rating && business.rating.count > 0 ? business.rating : null
  return (
    <ul className={cn('flex flex-wrap gap-x-7 gap-y-3 text-[15px] font-semibold', dark ? 'text-white' : 'text-text', className)}>
      {rating ? (
        <Fact icon={<GoogleMark className="text-base" />}>
          <a href={business.mapsUrl || '#reviews'} className="hover:underline">
            {rating.value.toFixed(1)} stars from {rating.count} Google reviews
          </a>
        </Fact>
      ) : null}
      {business.warranty ? (
        <Fact icon={<ShieldCheck className="h-[18px] w-[18px]" aria-hidden />}>
          {business.warranty.months}-month / {business.warranty.miles.toLocaleString('en-US')}-mile warranty
        </Fact>
      ) : null}
      <Fact icon={<MapPin className="h-[18px] w-[18px]" aria-hidden />}>
        <a href={business.mapsUrl || '#visit'} className="hover:underline">
          {business.address.city}, {business.address.state}
        </a>
      </Fact>
    </ul>
  )
}

function Fact({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex items-center gap-2 whitespace-nowrap">
      {icon}
      {children}
    </li>
  )
}
