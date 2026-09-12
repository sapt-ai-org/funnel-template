'use client'

import { BookingForm } from '@/components/funnel/BookingForm'
import type { BookingService, FunnelFlow } from '@/config/funnel'

/**
 * The booking form, inline in a hero card. Rendered on the server with its
 * first question already showing, so the form is on screen from the first
 * paint and interactive as soon as the page hydrates.
 */
export function HeroBooking({
  service,
  ...props
}: {
  flow: FunnelFlow
  shopName: string
  phone: string
  phoneHref: string
  label: string
  /** The service whose page this hero is on; the home hero has none. */
  service?: BookingService | null
  /** An invisible copy that only holds the tallest step's height (see HeroParts.tsx). */
  reserve?: boolean
}) {
  return (
    <BookingForm
      {...props}
      service={service}
      variant="inline"
      source={service ? `service_form:${service.slug}` : 'hero_form'}
    />
  )
}
