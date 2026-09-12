import { business } from '@/config/business'
import type { LandingSpec } from '@/config/funnel'
import { storefrontPhoto } from '@/lib/images'
import { HoursList, OpenStatus } from '../hours'
import { Photo } from '../Photo'
import { ButtonLink, CallButton, Container, Section, SectionTitle } from '../primitives'

/**
 * Where and when, written exactly as the Google listing has it. Google
 * cross-checks name, address and phone between the two, and a mismatch reads
 * as one of them being stale. No embedded map: an iframe map is the heaviest
 * thing a page like this could load, and "Get directions" opens the real one.
 *
 * The address, whether they are open right now, and the ways to get there on
 * the left; the week on the right. Open-or-closed sits with the address
 * because it is the question a driver actually arrives with — the week below
 * it only confirms the answer. The list is ruled, not boxed: one device
 * instead of a border, a top bar and a tint all saying the same thing.
 *
 * Under both, the building as it looks from the road: the one photo a
 * customer needs at the moment they are looking for it.
 */
export function Visit({ visit }: Pick<LandingSpec, 'visit'>) {
  const a = business.address
  const storefront = storefrontPhoto()

  return (
    <Section id="visit" tone="white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionTitle id="visit">{visit.title}</SectionTitle>

            {/* One type step for one address: the street is not a headline. */}
            <address className="mt-8 text-lg leading-relaxed not-italic">
              <span className="block font-semibold">{a.street}</span>
              <span className="block text-text-muted">
                {a.city}, {a.state} {a.postalCode}
              </span>
            </address>

            <OpenStatus className="mt-4 text-lg font-semibold" />

            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              {business.mapsUrl ? (
                <ButtonLink href={business.mapsUrl} target="_blank" rel="noreferrer" variant="primary">
                  Get directions
                </ButtonLink>
              ) : null}
              <CallButton />
            </div>

            {business.serviceAreas.length ? (
              <p className="mt-8 text-text-muted">Also serving {business.serviceAreas.join(', ')}.</p>
            ) : null}
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            {/* Today is already set in bold and labelled by HoursList, so it
                needs no tint behind it as well. */}
            <div className="border-t border-border">
              <HoursList className="text-lg" />
            </div>
          </div>
        </div>

        {storefront ? (
          <figure className="mt-12 sm:mt-16">
            <Photo photo={storefront} className="aspect-[4/3] sm:aspect-[21/9]" sizes="(min-width: 1184px) 1120px, 100vw" />
            <figcaption className="mt-3 text-[15px] text-text-muted">What you will see when you pull up.</figcaption>
          </figure>
        ) : null}
      </Container>
    </Section>
  )
}
