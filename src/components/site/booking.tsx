'use client'

import type { BookingService, FunnelFlow } from '@/config/funnel'
import { track } from '@/lib/analytics'
import { haptic } from '@/lib/haptics'
import dynamic from 'next/dynamic'
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * The only interactive island on the page.
 *
 * Every section is a server component with no JavaScript of its own; a book
 * button anywhere asks this provider to open the flow. The flow itself is
 * split into its own chunk and fetched when the browser is idle, so it costs
 * nothing on the first paint and is already there by the time anyone taps.
 */

const loadOverlay = () => import('@/components/funnel/FunnelOverlay').then((m) => m.FunnelOverlay)
const FunnelOverlay = dynamic(loadOverlay, { ssr: false })

type OpenBooking = (source: string) => void

const BookingContext = createContext<OpenBooking | null>(null)

export function BookingProvider({
  flow,
  shopName,
  phone,
  phoneHref,
  service = null,
  children,
}: {
  flow: FunnelFlow
  shopName: string
  phone: string
  phoneHref: string
  /** On a service's own page, every book button on it books that service. */
  service?: BookingService | null
  children: ReactNode
}) {
  const [open, setOpen] = useState<string | null>(null)

  const openBooking = useCallback<OpenBooking>((source) => {
    // A buzz confirms a tap. Opened from a link there was no tap, and the
    // browser refuses to vibrate without one.
    if (source !== 'link') haptic('light')
    track('funnel_open', { source })
    setOpen(source)
  }, [])

  const close = useCallback(() => setOpen(null), [])

  useEffect(() => {
    // `/book` redirects here with ?book, so an ad or a text message that
    // promised booking lands in the booking flow, not on a page about it.
    if (new URLSearchParams(window.location.search).has('book')) openBooking('link')

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500))
    idle(() => void loadOverlay())
  }, [openBooking])

  return (
    <BookingContext.Provider value={openBooking}>
      {children}
      {open ? (
        <FunnelOverlay
          source={open}
          flow={flow}
          shopName={shopName}
          phone={phone}
          phoneHref={phoneHref}
          service={service}
          onClose={close}
        />
      ) : null}
    </BookingContext.Provider>
  )
}

/**
 * Opens the booking flow. `source` names where on the page it was tapped, so
 * the analytics can say which section actually books appointments.
 */
export function BookButton({
  source,
  className,
  children,
}: {
  source: string
  className?: string
  children: ReactNode
}) {
  const openBooking = useContext(BookingContext)
  if (!openBooking) throw new Error('BookButton must be rendered inside <BookingProvider>')
  return (
    <button type="button" onClick={() => openBooking(source)} className={className}>
      {children}
    </button>
  )
}
