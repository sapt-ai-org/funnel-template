import type { LandingSpec } from '@/config/funnel'
import { heroPhoto } from '@/lib/images'
import { cn } from '@/lib/utils'
import { BookingSlot, HeroBackdrop, HeroFacts } from '../HeroParts'
import { OpenStatus } from '../hours'
import { Container } from '../primitives'

/**
 * The first screen is the booking. The promise on the left, the form on the
 * right with its first question already showing, so starting a booking is
 * answering a question rather than finding a button. On a phone the form
 * follows the headline directly.
 *
 * Behind it, the shop itself (PHOTO_PLAN.hero: the floor, the front, a car on
 * the lift). The photo is fetched first, at the size the screen needs. A shop
 * with no photo gets the plain light hero instead.
 *
 * Under the subhead, the facts that decide between shops. A service's own
 * page has the same hero around that service (ServiceHero.tsx).
 */
export function Hero({ hero, ctaLabel, funnel }: Pick<LandingSpec, 'hero' | 'ctaLabel' | 'funnel'>) {
  const bg = heroPhoto()
  const dark = Boolean(bg)

  return (
    <section className={cn('relative isolate overflow-hidden', dark ? 'bg-ink text-white' : 'motif bg-bg')}>
      {bg ? <HeroBackdrop photo={bg} /> : null}

      <Container className="grid gap-x-12 gap-y-10 pt-8 pb-14 sm:pt-14 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:pt-20 lg:pb-24">
        <div className="lg:col-span-7 lg:pt-6">
          {/* The strip above the header carries this from `md` up. */}
          <div className="mb-6 md:hidden">
            <OpenStatus onDark={dark} />
          </div>
          <h1 className="font-display text-[clamp(3rem,13vw,6rem)] font-bold leading-[0.9] tracking-[-0.015em] text-balance">
            {hero.headline}
          </h1>
          <p className={cn('mt-6 max-w-[40ch] text-lg leading-relaxed sm:text-xl', dark ? 'text-white/80' : 'text-text-muted')}>
            {hero.subhead}
          </p>
        </div>

        <BookingSlot funnel={funnel} ctaLabel={ctaLabel} className="lg:col-span-5 lg:row-span-2" />

        <HeroFacts dark={dark} className="lg:col-span-7 lg:self-start" />
      </Container>
    </section>
  )
}
