import { business } from '@/config/business'
import type { LandingSpec } from '@/config/funnel'
import { Check } from 'lucide-react'
import { Container, Section, SectionTitle } from '../primitives'

/**
 * The promise, drawn as the thing it describes: a repair order torn off the
 * pad, with the customer's approval as the last line. Every shop claims to be
 * honest; this shows the mechanism that makes it true, in the one document a
 * shop customer already knows how to read.
 *
 * It is the page's one bold element. Keep everything around it quiet.
 */
export function RepairOrder({ promise }: Pick<LandingSpec, 'promise'>) {
  return (
    <Section id="how-it-works" tone="ink">
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5 lg:pt-4">
          <SectionTitle id="how-it-works">{promise.title}</SectionTitle>
          <p className="mt-5 max-w-[38ch] text-lg leading-relaxed text-white/75">{promise.intro}</p>
        </div>

        <div className="lg:col-span-7">
          <div className="ticket bg-surface px-6 pt-9 pb-10 text-text shadow-[0_24px_48px_-24px_rgb(0_0_0/0.5)] sm:px-10">
            <div className="flex items-baseline justify-between gap-4 border-b-2 border-text pb-3">
              <span className="truncate font-display text-xl font-bold uppercase tracking-[0.02em]">
                {business.name}
              </span>
              <span className="shrink-0 text-sm font-medium text-text-muted">Repair order</span>
            </div>

            <ol className="divide-y divide-border">
              {promise.steps.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[2.25rem_1fr] gap-x-3 py-5 sm:grid-cols-[3rem_1fr]">
                  <span className="font-display text-[1.75rem] font-bold leading-none tabular-nums text-text-light sm:text-[2rem]">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold leading-snug">{step.title}</h3>
                    <p className="mt-1 text-text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="flex items-center gap-4 border-t-2 border-dashed border-border pt-6">
              <span
                aria-hidden
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border-2 border-primary bg-primary text-white"
              >
                <Check className="h-5 w-5" strokeWidth={3} />
              </span>
              <span className="font-semibold">{promise.approval}</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
