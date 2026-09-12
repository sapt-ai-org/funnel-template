import type { BookingService, LandingSpec } from '@/config/funnel'
import type { Service } from '@/lib/cms'
import { cn } from '@/lib/utils'
import { Breadcrumbs } from '../Breadcrumbs'
import { BookingSlot, HeroBackdrop, HeroFacts } from '../HeroParts'
import { OpenStatus } from '../hours'
import { Container } from '../primitives'

/**
 * The top of a service's own page: the home hero, around one service. The
 * service's photo is the background, its name is the headline, and the
 * booking card already knows which service this is, so it goes straight to
 * when they need it and who to call.
 *
 * Someone who lands here searched for this job. The page answers "do they do
 * it" in the headline and lets them book it without scrolling.
 */
export function ServiceHero({
  service,
  summary,
  booking,
  ctaLabel,
  funnel,
  servicesTitle,
}: {
  service: Service
  /** The shop's own summary, or the default one for this service. */
  summary: string
  booking: BookingService
  servicesTitle: string
} & Pick<LandingSpec, 'ctaLabel' | 'funnel'>) {
  const bg = service.photo && !service.photo.placeholder ? service.photo : null
  const dark = Boolean(bg)

  return (
    <section className={cn('relative isolate overflow-hidden', dark ? 'bg-ink text-white' : 'motif bg-bg')}>
      {bg ? <HeroBackdrop photo={bg} /> : null}

      <Container className="grid gap-x-12 gap-y-10 pt-8 pb-14 sm:pt-12 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:pt-16 lg:pb-24">
        <div className="lg:col-span-7 lg:pt-4">
          <Breadcrumbs
            onDark={dark}
            items={[{ href: '/', label: 'Home' }, { href: '/services', label: servicesTitle }, { label: service.name }]}
          />
          {/* The strip above the header carries this from `md` up. */}
          <div className="mt-6 md:hidden">
            <OpenStatus onDark={dark} />
          </div>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,11vw,5.25rem)] font-bold leading-[0.92] tracking-[-0.015em] text-balance lg:mt-10">
            {service.name}
          </h1>
          <p className={cn('mt-6 max-w-[40ch] text-lg leading-relaxed sm:text-xl', dark ? 'text-white/80' : 'text-text-muted')}>
            {summary}
          </p>
        </div>

        <BookingSlot funnel={funnel} ctaLabel={ctaLabel} service={booking} className="lg:col-span-5 lg:row-span-2" />

        <HeroFacts dark={dark} className="lg:col-span-7 lg:self-start" />
      </Container>
    </section>
  )
}
