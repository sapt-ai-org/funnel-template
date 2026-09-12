import type { Special } from '@/lib/cms'
import { Container } from '../primitives'

/**
 * A live coupon, drawn as one: a dashed cut line around the offer and its
 * terms. The offers come from Sapt (Content > Specials, which drops one after
 * its last day) or business.ts. Renders nothing at all when there are none,
 * which is the right default: an expired or invented discount is a problem
 * the shop hears about from a customer at the counter.
 */
export function Specials({ items }: { items: Special[] }) {
  if (items.length === 0) return null

  return (
    <section aria-label="Current specials" className="bg-surface pb-16 sm:pb-24">
      <Container>
        <ul className="grid gap-4 md:grid-cols-2">
          {items.map((s) => (
            <li key={s.title} className="rounded-lg border-2 border-dashed border-text/40 p-6 sm:p-8">
              <p className="font-display text-3xl font-bold leading-none sm:text-4xl">{s.title}</p>
              {s.detail ? <p className="mt-3 text-lg">{s.detail}</p> : null}
              {s.terms ? <p className="mt-3 text-sm text-text-muted">{s.terms}</p> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
