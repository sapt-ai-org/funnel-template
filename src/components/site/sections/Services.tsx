import type { LandingSpec } from '@/config/funnel'
import Link from 'next/link'
import { Container, Section, SectionTitle, type Tone } from '../primitives'

/**
 * What they fix, as a plain list: the services published in Sapt, or the
 * Google profile's list until there are any. The question a visitor brings is
 * "do they do mine?", which a list answers in one scan and a grid of icon
 * cards makes them hunt for. Each line opens that service's own page.
 *
 * The rules run the full width of the list rather than stopping either side of
 * a gutter, so two columns still read as one table. The name carries the link
 * and underlines on hover: a row that is entirely a link does not need a
 * chevron at the end of it saying so a second time.
 *
 * No book button here. The header is pinned to the top of the screen on a
 * desktop and the action bar to the bottom on a phone, so one is always within
 * reach and the page does not have to keep asking.
 *
 * The home page places it in its running order; every other page gets it
 * above the footer from SiteShell, so no page is a dead end.
 */
export function Services({
  services,
  items,
  tone = 'white',
}: Pick<LandingSpec, 'services'> & {
  items: { slug: string; name: string; summary?: string | null }[]
  tone?: Tone
}) {
  return (
    <Section id="services" tone={tone}>
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          {/* Holds its place beside the list instead of stranding at the top of it. */}
          <div className="lg:sticky lg:top-32">
            <SectionTitle id="services">{services.title}</SectionTitle>
            <p className="mt-5 max-w-[34ch] text-lg leading-relaxed text-text-muted">{services.footnote}</p>
          </div>
        </div>

        {/* No column gap: the cells pad themselves instead, so every rule meets
            the next and the two columns read as one table. */}
        <ul className="grid content-start border-t border-border sm:grid-cols-2 lg:col-span-7">
          {items.map((service) => (
            <li key={service.slug} className="border-b border-border sm:odd:pr-10 sm:even:pl-10">
              <Link href={`/services/${service.slug}`} className="group block h-full py-4 sm:py-5">
                <span className="text-lg leading-snug font-semibold underline-offset-4 group-hover:underline">
                  {service.name}
                </span>
                {/* The line that says what the job is. Hidden on a phone, where
                    the names alone scan faster, and left to run its natural
                    length: clamping it to two lines put an ellipsis mid-sentence
                    on half the cells, which reads as broken copy rather than as
                    a tidy grid. The grid already levels the rows. */}
                {service.summary ? (
                  <span className="mt-1.5 block max-w-[42ch] text-[15px] leading-snug text-pretty text-text-muted max-sm:hidden">
                    {service.summary}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
