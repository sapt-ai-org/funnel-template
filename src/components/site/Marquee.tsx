import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

/**
 * A row that scrolls forever. Adapted from Magic UI's Marquee (MIT,
 * magicui.design) with three changes a shop's site needs:
 *
 *  - The content is repeated to fill the loop, but only the first copy is
 *    exposed to screen readers and crawlers. The rest are aria-hidden, so a
 *    review is read, and indexed, once.
 *  - Someone who has asked their device for less motion gets a still row
 *    they can swipe instead, with the repeats removed.
 *  - It stops under a hovering pointer, a pressing thumb, or keyboard focus,
 *    so anyone can stop a card long enough to finish reading it.
 *
 * Pure CSS (a transform on the compositor), so it costs no JavaScript and
 * does not repaint. `seconds` is one full pass; keep it slow enough to read.
 */
export function Marquee({
  children,
  seconds = 60,
  reverse = false,
  repeat = 4,
  className,
}: {
  children: ReactNode
  seconds?: number
  reverse?: boolean
  repeat?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'group flex gap-(--gap) overflow-hidden [--gap:1rem]',
        'scrollbar-hide motion-reduce:snap-x motion-reduce:snap-mandatory motion-reduce:overflow-x-auto',
        // Still, the row starts where the page's content starts (Container's
        // max width and gutter) instead of flush against the screen edge.
        'motion-reduce:px-[max(1.25rem,calc((100vw-74rem)/2+1.25rem))] motion-reduce:scroll-px-[max(1.25rem,calc((100vw-74rem)/2+1.25rem))]',
        'sm:motion-reduce:px-[max(2rem,calc((100vw-74rem)/2+2rem))] sm:motion-reduce:scroll-px-[max(2rem,calc((100vw-74rem)/2+2rem))]',
        className
      )}
      style={{ '--duration': `${seconds}s` } as CSSProperties}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 || undefined}
          className={cn(
            'flex shrink-0 gap-(--gap) animate-marquee',
            'group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused] group-active:[animation-play-state:paused]',
            'motion-reduce:animate-none',
            reverse && '[animation-direction:reverse]',
            i > 0 && 'motion-reduce:hidden'
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
