'use client'

import type { BadgeKind } from '@/config/trust'
import { Award, BadgeCheck, House, ShieldCheck, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { LogoLoop, type LogoItem } from './LogoLoop'

const KIND_ICON: Record<BadgeKind, LucideIcon> = {
  certification: BadgeCheck,
  membership: ShieldCheck,
  award: Award,
  ownership: House,
}

/** One badge, already resolved on the server: its mark at its optical size, or none. */
export interface LoopBadge {
  label: string
  kind: BadgeKind
  href?: string
  logo?: { src: string; width: number; height: number }
}

/**
 * The trust strip's endless row of program marks.
 *
 * Every mark keeps its own optical size (see logo-size.ts) instead of the
 * single height LogoLoop would give it, so a round seal and a long wordmark
 * still read as the same size. A badge with no mark (family owned, a local
 * award) rides along as a quiet text pill. Each is labelled with the program's
 * name for screen readers and as a tooltip, and links to the shop's listing
 * with the program when there is one.
 */
export function TrustLoop({ badges, ariaLabel }: { badges: LoopBadge[]; ariaLabel: string }) {
  const items: LogoItem[] = badges.map((b) =>
    b.logo
      ? { src: b.logo.src, width: b.logo.width, height: b.logo.height, alt: b.label, title: b.label, href: b.href }
      : { node: <Pill badge={b} />, title: b.label, ariaLabel: b.label, href: b.href }
  )

  return (
    <LogoLoop
      logos={items}
      speed={40}
      gap={64}
      logoHeight={60}
      hoverSpeed={0}
      fadeOut
      fadeOutColor="var(--surface)"
      ariaLabel={ariaLabel}
      // Asked for less motion, the loop stands still; let the row scroll so
      // no mark is cut off at the edge.
      className="scrollbar-hide motion-reduce:overflow-x-auto"
      renderItem={(item) => <Mark item={item} />}
    />
  )
}

function Mark({ item }: { item: LogoItem }) {
  const body: ReactNode =
    'node' in item ? (
      item.node
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.src}
        width={item.width}
        height={item.height}
        alt={item.alt}
        title={item.title}
        loading="lazy"
        decoding="async"
        draggable={false}
        className="block max-w-none select-none"
      />
    )

  if (!item.href) return <span className="inline-flex h-[60px] items-center">{body}</span>
  return (
    <a
      href={item.href}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`${'node' in item ? item.ariaLabel : item.alt}: see the listing`}
      className="inline-flex h-[60px] items-center rounded transition-opacity hover:opacity-80"
    >
      {body}
    </a>
  )
}

function Pill({ badge }: { badge: LoopBadge }) {
  const Icon = KIND_ICON[badge.kind]
  return (
    <span className="inline-flex h-11 items-center gap-2 rounded-md border border-border px-4 text-[15px] leading-none font-semibold whitespace-nowrap">
      <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
      {badge.label}
    </span>
  )
}
