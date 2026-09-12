import type { LandingSpec } from '@/config/funnel'
import { cn } from '@/lib/utils'
import { BookButton } from '../booking'
import { CallButton, Container, Section, buttonClass } from '../primitives'

/** The last thing on the page is the thing the page is for. */
export function FinalCta({ finalCta, ctaLabel }: Pick<LandingSpec, 'finalCta' | 'ctaLabel'>) {
  return (
    <Section tone="white">
      <Container>
        <h2 className="max-w-[16ch] font-display text-[clamp(3rem,11vw,5.5rem)] font-bold leading-[0.9] tracking-[-0.015em] text-balance">
          {finalCta.title}
        </h2>
        <p className="mt-6 max-w-[44ch] text-lg leading-relaxed text-text-muted sm:text-xl">{finalCta.subhead}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <BookButton source="final" className={cn(buttonClass({ block: true }), 'sm:w-auto')}>
            {ctaLabel}
          </BookButton>
          <CallButton block className="sm:w-auto" />
        </div>
      </Container>
    </Section>
  )
}
