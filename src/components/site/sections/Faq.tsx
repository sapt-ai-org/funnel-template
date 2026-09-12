import type { LandingSpec } from '@/config/funnel'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'
import { CallButton, Container, Section, SectionTitle, type Tone } from '../primitives'

/**
 * The objections, answered before the phone call. Native <details>, so it
 * works with no JavaScript, and the answers stay in the HTML where search and
 * answer engines can quote them.
 */
export function Faq({ faq }: Pick<LandingSpec, 'faq'>) {
  // No `ask` here: the footer's call button is one screen below this section,
  // and a second one made four on the page. A service page ends differently
  // and still passes one.
  return <FaqSection id="faq" tone="paper" title={faq.title} items={faq.items} />
}

/**
 * Questions, with the title beside them holding its place as they scroll. A
 * page that needs a way to ask something that is not on the list passes
 * `ask`; one that already ends in a call button leaves it out.
 */
export function FaqSection({
  id,
  tone,
  title,
  items,
  ask,
}: {
  id: string
  tone: Tone
  title: string
  items: { q: string; a: string }[]
  ask?: LandingSpec['faq']['ask']
}) {
  return (
    <Section id={id} tone={tone}>
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionTitle id={id}>{title}</SectionTitle>
            {ask ? (
              <div className={cn('mt-8 hidden max-w-sm p-6 lg:block', tone === 'paper' ? 'bg-surface' : 'bg-bg')}>
                <p className="font-display text-[1.75rem] font-bold leading-[0.95]">{ask.title}</p>
                <p className="mt-3 text-pretty text-text-muted">{ask.body}</p>
                <CallButton className="mt-6" />
              </div>
            ) : null}
          </div>
        </div>
        <div className="lg:col-span-7">
          <FaqList items={items} />
          {/* On a phone the box would sit above the questions it is for; it follows them instead. */}
          {ask ? (
            <div className="mt-8 lg:hidden">
              <p className="font-display text-2xl font-bold leading-none">{ask.title}</p>
              <p className="mt-2 text-text-muted">{ask.body}</p>
              <CallButton block className="mt-5" />
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  )
}

/**
 * The questions themselves, for any page that has some: the home page, a
 * service's own page. The first is open, so the section starts with an answer
 * in it rather than a stack of closed rules, and the interaction explains
 * itself without anyone having to guess.
 */
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="border-t border-border">
      {items.map((item, i) => (
        <details key={item.q} open={i === 0} className="group border-b border-border">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-semibold [&::-webkit-details-marker]:hidden">
            {item.q}
            <Plus
              className="h-5 w-5 shrink-0 text-text-muted transition-transform duration-200 group-open:rotate-45"
              aria-hidden
            />
          </summary>
          <p className="max-w-[60ch] pb-6 text-text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  )
}
