import { business, isTemplate, SAMPLE_REVIEWS, type Review } from '@/config/business'
import type { LandingSpec } from '@/config/funnel'
import { cn } from '@/lib/utils'
import { Marquee } from '../Marquee'
import { Container, GoogleMark, Section, SectionHeader, Stars } from '../primitives'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * The row moves, which is what makes the section feel alive — but only once
 * there are enough cards to outrun the screen. At six cards of 22rem the row
 * is about 2,200px, comfortably wider than a laptop, so the loop never brings
 * a reviewer back around while the first copy of them is still visible. Below
 * that it would, and the same name twice on one screen reads as invented, so a
 * shop with only a handful gets them standing still instead.
 *
 * One row, not two: splitting the same reviews across two rows halves the
 * count in each and puts the repeat straight back.
 */
const MIN_FOR_MARQUEE = 6

/** "2026-08" → "Aug 2026". */
function month(yyyymm: string): string {
  const [y, m] = yyyymm.split('-').map(Number)
  return MONTHS[m - 1] ? `${MONTHS[m - 1]} ${y}` : ''
}

/** `fill` for the still grid, where the cell sets the width; fixed for the moving row. */
function ReviewCard({ review, fill = false }: { review: Review; fill?: boolean }) {
  return (
    <figure
      className={cn(
        'flex shrink-0 snap-start flex-col rounded-md border border-border bg-surface p-6',
        fill ? 'w-full' : 'w-[17.5rem] sm:w-[22rem]'
      )}
    >
      <Stars value={review.rating} className="text-[15px]" />
      <blockquote className="mt-4 text-[17px] leading-relaxed text-pretty">{review.text}</blockquote>
      {/* The name and where it was written. No initial in a box beside it: the
          name is already there, and the square was decoration standing in for a
          face nobody uploaded. */}
      <figcaption className="mt-auto pt-6 leading-tight">
        <span className="block font-semibold">{review.author}</span>
        <span className="mt-1.5 flex items-center gap-1.5 text-sm text-text-muted">
          <GoogleMark className="text-[13px]" />
          Google review, {month(review.date)}
        </span>
      </figcaption>
    </figure>
  )
}

/**
 * What customers wrote on Google.
 *
 * The rating is the headline and comes from Google or not at all. The cards
 * are the shop's own recent Google reviews, chosen and shortened by
 * `pull-gbp`; nobody types them. The untouched template shows samples so the
 * design can be judged full (SAMPLE_REVIEWS cannot render once the first pull
 * replaces the demo name), and after that only what Google returned. A shop
 * with nothing on Google yet gets no section, rather than an empty one.
 */
export function Reviews({ proof }: Pick<LandingSpec, 'proof'>) {
  const rating = business.rating && business.rating.count > 0 ? business.rating : null
  const sample = business.reviews.length === 0 && isTemplate()
  const reviews = sample ? SAMPLE_REVIEWS : business.reviews
  if (!rating && reviews.length === 0) return null

  return (
    <Section id="reviews" tone="paper">
      <Container>
        <SectionHeader
          id="reviews"
          title={proof.title}
          aside={
            rating ? (
              <a href={business.mapsUrl || undefined} target="_blank" rel="noreferrer" className="group flex items-center gap-4">
                <span className="font-display text-6xl leading-none font-bold">{rating.value.toFixed(1)}</span>
                <span>
                  <Stars value={rating.value} className="text-xl" />
                  <span className="flex items-center gap-1.5 text-text-muted group-hover:text-text group-hover:underline">
                    <GoogleMark />
                    {rating.count} reviews on Google
                  </span>
                </span>
              </a>
            ) : null
          }
        />
      </Container>

      {reviews.length >= MIN_FOR_MARQUEE ? (
        // One row, about ten seconds a card: slow enough to read one as it
        // passes, and long enough that the loop never shows a repeat.
        <div className="relative mt-12">
          <Marquee seconds={reviews.length * 10}>
            {reviews.map((review, i) => (
              <ReviewCard key={`${review.author}-${i}`} review={review} />
            ))}
          </Marquee>
          {/* Moving cards fade out at both edges rather than being cut off. */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-linear-to-r from-bg motion-reduce:hidden sm:w-40" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-linear-to-l from-bg motion-reduce:hidden sm:w-40" />
        </div>
      ) : reviews.length > 0 ? (
        <Container className="mt-12">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, i) => (
              <li key={`${review.author}-${i}`} className="flex">
                <ReviewCard review={review} fill />
              </li>
            ))}
          </ul>
        </Container>
      ) : null}
    </Section>
  )
}
