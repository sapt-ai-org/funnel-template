'use client'

import { business, dayName, formatTime } from '@/config/business'
import { openStatus, shopClock, type OpenStatus as Status } from '@/lib/hours'
// clsx rather than cn: this ships to the browser, and nothing here needs
// tailwind-merge's conflict resolution.
import clsx from 'clsx'
import { useEffect, useState } from 'react'

/**
 * The page is built once and served from a CDN, so anything that depends on
 * the current time has to be worked out in the browser. Both components here
 * render a same-sized blank on the server and fill in after mount, which keeps
 * the markup identical on both sides and the layout still.
 */

function useShopClock() {
  const [clock, setClock] = useState<ReturnType<typeof shopClock> | null>(null)
  useEffect(() => {
    const tick = () => setClock(shopClock(new Date(), business.timeZone))
    tick()
    const id = window.setInterval(tick, 60_000)
    return () => window.clearInterval(id)
  }, [])
  return clock
}

/**
 * "Open until 6 PM" with a green dot, or when it next opens. It always
 * displays as inline-flex; to hide it at a breakpoint, wrap it, because
 * `className` is joined, not merged, and cannot override `display`.
 */
export function OpenStatus({ className, onDark = false }: { className?: string; onDark?: boolean }) {
  const clock = useShopClock()
  const status: Status | null = clock ? openStatus(business.hours, clock) : null

  return (
    <span className={clsx('inline-flex items-center gap-2 text-[15px] font-medium', className)} aria-live="polite">
      <span
        aria-hidden
        className={clsx(
          'h-2 w-2 shrink-0 rounded-full',
          !status ? 'bg-transparent' : status.open ? (onDark ? 'bg-[#3DDC84]' : 'bg-open') : onDark ? 'bg-white/50' : 'bg-text-light'
        )}
      />
      {/* A non-breaking space holds the line's height until the clock is known.
          On a dark ground the dot carries the green; the words stay white. */}
      <span className={clsx(status?.open && !onDark && 'text-open')}>{status?.label ?? '\u00a0'}</span>
    </span>
  )
}

/**
 * The week, Monday first, with today picked out once the shop's day is known.
 * `rowClassName` pads the rows when the list sits in a card; `shadeToday`
 * also tints today's row, for a list set apart in its own box.
 */
export function HoursList({
  className,
  rowClassName,
  shadeToday = false,
}: {
  className?: string
  rowClassName?: string
  shadeToday?: boolean
}) {
  const clock = useShopClock()
  const week = [...business.hours].sort((a, b) => ((a.day + 6) % 7) - ((b.day + 6) % 7))

  return (
    <dl className={clsx('divide-y divide-border', className)}>
      {week.map((h) => {
        const today = clock?.day === h.day
        return (
          <div
            key={h.day}
            className={clsx('flex items-baseline justify-between gap-6 py-3', rowClassName, today && 'font-semibold', today && shadeToday && 'bg-bg')}
          >
            <dt>
              {dayName(h.day)}
              {today ? <span className="ml-2 text-sm font-medium text-text-muted">Today</span> : null}
            </dt>
            <dd className={clsx('tabular-nums', h.closed && 'text-text-muted')}>
              {h.closed ? 'Closed' : `${formatTime(h.open)} to ${formatTime(h.close)}`}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
