'use client'

import type { LandingSpec } from '@/config/funnel'
import clsx from 'clsx'
import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BookButton } from '../booking'
import { buttonClass, iconCell, iconLabel, withIconCell } from '../button'

/**
 * Call and book, under the thumb on a phone once the form in the hero has
 * scrolled away. While that form is on screen the bar would only repeat it,
 * so it stays out of the way and slides up the moment the form leaves.
 * Hidden from `sm` up, where the header carries both.
 */
export function MobileActionBar({
  ctaLabel,
  phone,
  phoneHref,
}: Pick<LandingSpec, 'ctaLabel'> & { phone: string; phoneHref: string }) {
  // Shown until the observer reports in, so the bar is never missing on a
  // page without a hero form or a browser without IntersectionObserver.
  const [formInView, setFormInView] = useState(false)

  useEffect(() => {
    const form = document.getElementById('book')
    if (!form || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(([entry]) => setFormInView(entry.isIntersecting), {
      rootMargin: '0px 0px -30% 0px',
    })
    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div
        inert={formInView}
        className={clsx(
          'fixed inset-x-0 bottom-0 z-40 grid grid-cols-[auto_1fr] gap-2 border-t border-border bg-bg px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out sm:hidden',
          formInView && 'translate-y-full'
        )}
      >
        <a href={phoneHref} aria-label={`Call ${phone}`} className={clsx(buttonClass({ variant: 'outline', size: 'md' }), withIconCell, 'h-12 pr-5')}>
          <span className={iconCell}>
            <Phone className="h-[1em] w-[1em]" strokeWidth={2.25} aria-hidden />
          </span>
          <span className={iconLabel}>Call</span>
        </a>
        <BookButton source="sticky" className={clsx(buttonClass({ size: 'md', block: true }), 'h-12')}>
          {ctaLabel}
        </BookButton>
      </div>
      {/* Holds the page's end clear of the fixed bar above. It sits after the
          footer, so it wears the footer's colour. */}
      <div aria-hidden className="h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-ink sm:hidden" />
    </>
  )
}
