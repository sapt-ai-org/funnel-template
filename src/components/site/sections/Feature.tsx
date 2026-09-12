import type { FeatureBlock } from '@/config/funnel'
import { filePhoto, photo as slotPhoto, type ResolvedPhoto } from '@/lib/images'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import { BookButton } from '../booking'
import { buttonClass } from '../button'
import { Photo } from '../Photo'
import { Container, Section, SectionTitle, Split } from '../primitives'

/**
 * A custom section, written entirely in funnel.ts: a photo beside a title, a
 * paragraph, a few points and an optional book button. It covers what a shop
 * wants to add most often ("Fleet accounts", "Hybrid and EV service",
 * "Diesel") without anyone writing a component. Anything it cannot express
 * gets its own file in this folder instead.
 */
export function Feature({ block, ctaLabel }: { block: FeatureBlock; ctaLabel: string }) {
  const shot: ResolvedPhoto | null = !block.photo
    ? null
    : typeof block.photo === 'object'
      ? filePhoto(block.photo.src, block.photo.alt)
      : slotPhoto(block.photo)

  return (
    <Section id={block.id} tone={block.tone ?? 'white'}>
      <Container>
        <Split
          reverse={block.reverse}
          media={shot ? <Photo photo={shot} className="aspect-[4/3]" sizes="(min-width: 1024px) 460px, 100vw" /> : undefined}
        >
          <SectionTitle id={block.id}>{block.title}</SectionTitle>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-text-muted">{block.body}</p>
          {block.points?.length ? (
            <ul className="mt-7 grid gap-3">
              {block.points.map((point) => (
                <li key={point} className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-text-muted" strokeWidth={2.5} aria-hidden />
                  {point}
                </li>
              ))}
            </ul>
          ) : null}
          {block.cta ? (
            <BookButton source={`feature:${block.id}`} className={clsx(buttonClass({ variant: 'outline', size: 'md' }), 'mt-8')}>
              {ctaLabel}
            </BookButton>
          ) : null}
        </Split>
      </Container>
    </Section>
  )
}
