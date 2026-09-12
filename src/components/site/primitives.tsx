import { phoneHref, business } from '@/config/business'
import { cn } from '@/lib/utils'
import { buttonClass, iconCell, iconLabel, withIconCell, type ButtonSize, type ButtonVariant } from './button'
import { Phone, Star } from 'lucide-react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

/**
 * The building blocks every section is made of. A new section should be
 * possible to write out of these alone; if it needs a new colour, radius or
 * spacing value, that is a sign it is drifting from the rest of the site.
 */

/* ── Layout ─────────────────────────────────────────────────────────────────── */

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto w-full max-w-[74rem] px-5 sm:px-8', className)}>{children}</div>
}

const TONES = {
  /** Light concrete. The page's default ground. */
  paper: 'bg-bg text-text',
  /** White. Alternates with paper so sections separate without rules. */
  white: 'bg-surface text-text',
  /** Work-shirt navy. Used once for the promise and once for the footer. */
  ink: 'bg-ink text-white',
} as const

export type Tone = keyof typeof TONES

/**
 * White and paper in turn, starting after `after`: one call per section a
 * page actually renders, so optional sections never leave two of the same
 * ground touching.
 */
export function alternate(after: 'white' | 'paper') {
  let last = after
  return (): 'white' | 'paper' => (last = last === 'white' ? 'paper' : 'white')
}

export function Section({
  id,
  tone = 'paper',
  className,
  children,
}: {
  id?: string
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={cn(TONES[tone], 'py-16 sm:py-24', className)}>
      {children}
    </section>
  )
}

/** A section's heading. Condensed and large: it is signage, read at a glance. */
export function SectionTitle({ id, className, children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <h2
      id={id ? `${id}-title` : undefined}
      className={cn(
        'font-display text-[2.5rem] font-bold leading-[0.95] tracking-[-0.01em] text-balance sm:text-[3.5rem]',
        className
      )}
    >
      {children}
    </h2>
  )
}

/**
 * The top of a section: its title, an optional line under it, and an
 * optional aside on the right (a rating, a link). One shape for every
 * section, so they line up the same way down the page.
 */
export function SectionHeader({
  id,
  title,
  intro,
  aside,
  className,
}: {
  id?: string
  title: ReactNode
  intro?: ReactNode
  aside?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-x-10 gap-y-5', className)}>
      <div className="max-w-[42rem]">
        <SectionTitle id={id}>{title}</SectionTitle>
        {intro ? <p className="mt-5 text-lg leading-relaxed text-text-muted">{intro}</p> : null}
      </div>
      {aside}
    </div>
  )
}

/**
 * A photo beside its words: five columns of media, seven of text, side by
 * side from `lg` and stacked (media first) below it. With no media the text
 * simply takes the width, so a section never shows an empty frame.
 */
export function Split({
  media,
  reverse = false,
  className,
  children,
}: {
  media?: ReactNode
  reverse?: boolean
  className?: string
  children: ReactNode
}) {
  if (!media) return <div className={cn('max-w-[48rem]', className)}>{children}</div>
  return (
    <div className={cn('grid items-center gap-10 lg:grid-cols-12 lg:gap-16', className)}>
      <div className={cn('lg:col-span-5', reverse && 'lg:order-2')}>{media}</div>
      <div className={cn('lg:col-span-7', reverse && 'lg:order-1')}>{children}</div>
    </div>
  )
}

/* ── Actions ────────────────────────────────────────────────────────────────── */

export { buttonClass, iconCell, iconLabel, withIconCell, type ButtonVariant } from './button'

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
}) {
  return <a {...props} className={cn(buttonClass({ variant, size, block }), className)} />
}

/**
 * Click-to-call, with the number written out. On a phone the number is the
 * button; on a desktop it is the thing people copy into their own phone.
 */
export function CallButton({
  variant = 'outline',
  size = 'lg',
  block,
  label,
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  label?: string
  className?: string
}) {
  return (
    <ButtonLink href={phoneHref()} variant={variant} size={size} block={block} className={cn(withIconCell, className)}>
      <span className={iconCell}>
        <Phone className="h-[1em] w-[1em]" strokeWidth={2.25} aria-hidden />
      </span>
      <span className={cn(iconLabel, 'tabular-nums')}>{label ?? `Call ${business.phone}`}</span>
    </ButtonLink>
  )
}

/* ── Proof ──────────────────────────────────────────────────────────────────── */

/**
 * Google's "G", inline (four paths, no request), for attributing a rating or
 * a review to Google: the mark tells a visitor where to check it before the
 * words do. Decorative by default; the adjacent text says "Google".
 */
export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0.99 0.99 21.576 22.02" aria-hidden className={cn('h-[1em] w-[1em] shrink-0', className)}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

/**
 * The rating, drawn in the page's own ink instead of Google's yellow. The
 * shop's colour is spent on actions only, and the stars were the one place a
 * third colour leaked into the page. The adjacent "G" still says where the
 * score comes from, so nothing is lost by dropping the yellow.
 */
export function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className="h-[1em] w-[1em]"
          fill={n <= Math.round(value) ? 'currentColor' : 'transparent'}
          stroke="currentColor"
          strokeOpacity={n <= Math.round(value) ? 1 : 0.3}
          aria-hidden
        />
      ))}
    </span>
  )
}
