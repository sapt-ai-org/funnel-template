import { business, isTemplate, phoneHref } from '@/config/business'
import type { LandingSpec } from '@/config/funnel'
import { MapPin, Phone } from 'lucide-react'
import { HeaderNav } from '../HeaderNav'
import { OpenStatus } from '../hours'
import { Container, GoogleMark } from '../primitives'

/**
 * The top of every page, in two parts.
 *
 * The strip (from `md`): the facts a driver checks before anything else. Open
 * or closed, where, the rating, the number. On a phone the menu and the
 * pinned bar carry them instead, and the hero says open or closed.
 *
 * The bar (HeaderNav.tsx): the name, the services dropdown and the other
 * links, and the book button. It stays at the top as the page scrolls.
 *
 * Each item appears only at a width with room for it whole, so nothing wraps:
 *
 *   phone       name, call, menu        (book lives in the bar at the bottom)
 *   ≥ 640px     + book
 *   ≥ 768px     + the strip: open or closed, and the number
 *   ≥ 1024px    the menu button becomes the nav; the strip adds the address
 *   ≥ 1280px    the strip adds the Google rating
 */
export function SiteHeader({
  logo,
  ctaLabel,
  nav,
  services,
  hasPosts,
}: Pick<LandingSpec, 'logo' | 'ctaLabel' | 'nav'> & {
  services: { slug: string; name: string }[]
  hasPosts: boolean
}) {
  const rating = business.rating && business.rating.count > 0 ? business.rating : null
  // The same test the reviews section uses to decide whether it renders.
  const hasReviews = Boolean(rating) || business.reviews.length > 0 || isTemplate()
  const links = nav.links.filter((l) => !l.requires || (l.requires === 'reviews' ? hasReviews : hasPosts))
  const a = business.address
  const address = {
    line: a.street ? `${a.street}, ${a.city}` : '',
    href: business.mapsUrl || null,
  }

  return (
    <>
      <div className="hidden bg-ink text-[14px] text-white md:block">
        <Container className="flex h-10 items-center gap-6">
          <OpenStatus onDark className="shrink-0" />
          {address.line ? (
            <StripItem href={address.href} className="hidden min-w-0 lg:flex">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{address.line}</span>
            </StripItem>
          ) : null}
          <div className="ml-auto flex shrink-0 items-center gap-6">
            {rating ? (
              <StripItem href={business.mapsUrl || null} className="hidden xl:flex">
                <GoogleMark className="text-[15px]" />
                {rating.value.toFixed(1)} from {rating.count} Google reviews
              </StripItem>
            ) : null}
            <a href={phoneHref()} className="flex items-center gap-2 font-semibold tabular-nums hover:underline">
              <Phone className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              {business.phone}
            </a>
          </div>
        </Container>
      </div>

      <HeaderNav
        logo={logo}
        name={business.name}
        ctaLabel={ctaLabel}
        nav={nav}
        links={links}
        services={services}
        phone={business.phone}
        phoneHref={phoneHref()}
        address={address}
      />
    </>
  )
}

function StripItem({ href, className, children }: { href: string | null; className?: string; children: React.ReactNode }) {
  const cls = `items-center gap-2 text-white/80 ${className ?? ''}`
  return href ? (
    <a href={href} className={`${cls} hover:text-white hover:underline`}>
      {children}
    </a>
  ) : (
    <span className={cls}>{children}</span>
  )
}
