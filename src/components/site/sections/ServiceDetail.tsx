import type { LandingSpec } from '@/config/funnel'
import { cn } from '@/lib/utils'
import { Check, CircleAlert } from 'lucide-react'
import { BookButton } from '../booking'
import { buttonClass } from '../button'
import { Container, Section, SectionTitle } from '../primitives'

/**
 * What the shop does on this job, and the signs it is time to book: the two
 * things someone comparing shops for one repair wants to see before they
 * trust a price. The shop's own description, when it has written one, leads.
 */
export function ServiceDetail({
  slug,
  description,
  includes,
  signs,
  titles,
  ctaLabel,
  tone = 'white',
}: {
  slug: string
  description: string | null
  includes: string[]
  signs: string[]
  titles: Pick<LandingSpec['servicePage'], 'includesTitle' | 'signsTitle'>
  ctaLabel: string
  tone?: 'white' | 'paper'
}) {
  const book = (
    <BookButton source={`service:${slug}`} className={cn(buttonClass({ variant: 'outline', size: 'md' }), 'mt-8')}>
      {ctaLabel}
    </BookButton>
  )

  return (
    <Section id="what-we-do" tone={tone}>
      <Container className="grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className={signs.length ? 'lg:col-span-6' : 'lg:col-span-8'}>
          <SectionTitle id="what-we-do">{titles.includesTitle}</SectionTitle>
          {description ? <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-text-muted">{description}</p> : null}
          <ul className="mt-8 border-t border-border">
            {includes.map((line) => (
              <li key={line} className="flex gap-4 border-b border-border py-4 text-lg">
                <Check className="mt-1 h-5 w-5 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                {line}
              </li>
            ))}
          </ul>
          {signs.length ? null : book}
        </div>

        {signs.length ? (
          <div className="lg:col-span-5 lg:col-start-8">
            <h2 className="font-display text-[2rem] font-bold leading-[0.95] tracking-[-0.01em] sm:text-[2.5rem]">
              {titles.signsTitle}
            </h2>
            <ul className="mt-8 grid gap-4">
              {signs.map((line) => (
                <li key={line} className="flex gap-3.5 text-lg">
                  <CircleAlert className="mt-1 h-5 w-5 shrink-0 text-text-muted" strokeWidth={2.25} aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
            {book}
          </div>
        ) : null}
      </Container>
    </Section>
  )
}
