'use client'

/**
 * The full-screen takeover every book button outside the hero opens. The
 * questions themselves are BookingForm, the same component the hero card
 * shows inline; this file is only the frame: the shop's name, a way out, the
 * reassurance at the foot, and the page held still behind it.
 *
 * Loaded on its own chunk (see components/site/booking.tsx), so none of this
 * is on the page's critical path.
 */

import type { BookingService, FunnelFlow } from '@/config/funnel'
import { Check, X } from 'lucide-react'
import { useEffect } from 'react'
import { BookingForm } from './BookingForm'

export function FunnelOverlay({
  flow,
  shopName,
  phone,
  phoneHref,
  source,
  service,
  onClose,
}: {
  flow: FunnelFlow
  shopName: string
  phone: string
  phoneHref: string
  source: string
  /** Opened on a service's page, the takeover books that service. */
  service?: BookingService | null
  onClose: () => void
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={shopName}
      className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-bg text-text"
    >
      <header className="sticky top-0 z-10 border-b border-border bg-bg [padding-top:env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 w-full max-w-xl items-center justify-between gap-4 px-5">
          <span className="truncate font-display text-lg font-bold uppercase tracking-[0.02em]">{shopName}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label={flow.ui.closeLabel}
            className="-mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-border-light hover:text-text"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-6 pb-10 sm:pt-10">
        <BookingForm
          flow={flow}
          shopName={shopName}
          phone={phone}
          phoneHref={phoneHref}
          variant="screen"
          source={source}
          service={service}
          onClose={onClose}
        />
      </main>

      {flow.trust && flow.trust.length > 0 ? (
        <footer className="mx-auto flex w-full max-w-xl flex-wrap gap-x-6 gap-y-2 px-5 pb-[max(2rem,env(safe-area-inset-bottom))] text-[15px] text-text-muted">
          {flow.trust.map((t) => (
            <span key={t} className="inline-flex items-center gap-2">
              <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> {t}
            </span>
          ))}
        </footer>
      ) : null}
    </div>
  )
}
