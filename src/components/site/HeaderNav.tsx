'use client'

import type { LandingSpec, NavLink, NavSpec } from '@/config/funnel'
import clsx from 'clsx'
import { ChevronDown, ChevronRight, MapPin, Menu, Phone, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { BookButton } from './booking'
import { buttonClass, iconCell, iconLabel, withIconCell } from './button'
import { OpenStatus } from './hours'

/**
 * The header bar: the name, the way around the site, and the book button.
 *
 *  - From `lg` it carries the whole nav. "Services" opens a panel listing
 *    every service beside a box for the driver who does not know what the car
 *    needs. It opens on click or keyboard like a button; on a mouse it also
 *    opens on hover, as a courtesy, never as the only way in.
 *  - Below `lg`, a menu button opens the same links full screen, with the
 *    hours and the two ways to book at the bottom, under the thumb.
 *
 * It stays at the top of the screen. On a phone it slides away while someone
 * reads down the page and comes back the moment they scroll up, so the page
 * gets the whole screen until they reach for the menu.
 */

type Service = { slug: string; name: string }

export interface HeaderNavProps {
  logo: LandingSpec['logo']
  name: string
  ctaLabel: string
  nav: NavSpec
  /** Already filtered to the ones this site has something behind. */
  links: NavLink[]
  services: Service[]
  phone: string
  phoneHref: string
  address: { line: string; href: string | null }
}

export function HeaderNav(props: HeaderNavProps) {
  const { logo, name, ctaLabel, nav, links, services, phone, phoneHref } = props
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const hidden = useHideOnScroll(menuOpen)
  const menuId = useId()
  const toggle = useRef<HTMLButtonElement>(null)
  const header = useRef<HTMLElement>(null)

  const closeMenu = useCallback((restoreFocus: boolean) => {
    setMenuOpen(false)
    if (restoreFocus) toggle.current?.focus()
  }, [])

  // A new page closes whatever was open.
  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <header
      ref={header}
      className={clsx(
        'sticky top-0 z-50 border-b border-border bg-bg transition-transform duration-300 ease-out',
        hidden && 'max-lg:-translate-y-full'
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[74rem] items-center gap-4 px-5 sm:px-8 lg:h-20 lg:gap-8">
        <Link href="/" className="min-w-0 shrink" aria-label={`${name}, home`}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.src} alt={logo.alt} className="h-9 w-auto max-w-[11rem] object-contain sm:h-10" />
          ) : (
            <span className="block truncate font-display text-[1.375rem] font-bold uppercase leading-none tracking-[0.02em] sm:text-2xl">
              {name}
            </span>
          )}
        </Link>

        <nav aria-label="Main" className="hidden h-full lg:block">
          <ul className="flex h-full items-stretch">
            <ServicesMenu nav={nav} services={services} ctaLabel={ctaLabel} phone={phone} phoneHref={phoneHref} pathname={pathname} />
            {links.map((link) => (
              <li key={link.href} className="flex">
                <NavItem href={link.href} current={isCurrent(pathname, link.href)}>
                  {link.label}
                </NavItem>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          {/* On a phone the number is a button; from `md` the strip above shows it in full. */}
          <a
            href={phoneHref}
            aria-label={`Call ${phone}`}
            className="flex h-11 w-11 items-center justify-center rounded-md border-[1.5px] border-border text-text hover:border-text md:hidden"
          >
            <Phone className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </a>
          {/* Wrapped: the button's own display would beat `hidden` (clsx joins, it does not merge). */}
          <div className="hidden sm:block">
            <BookButton source="header" className={buttonClass({ size: 'md' })}>
              {ctaLabel}
            </BookButton>
          </div>
          <button
            ref={toggle}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? nav.closeMenuLabel : nav.openMenuLabel}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-md border-[1.5px] border-text bg-text text-bg lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" strokeWidth={2.5} aria-hidden /> : <Menu className="h-5 w-5" strokeWidth={2.5} aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <MobileMenu {...props} id={menuId} header={header} toggle={toggle} pathname={pathname} onClose={closeMenu} />
      ) : null}
    </header>
  )
}

/** A top-level link. A bar under it marks the page you are on. */
function NavItem({ href, current, children }: { href: string; current: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={current ? 'page' : undefined}
      className={clsx(
        'relative flex items-center px-3.5 text-[15px] font-semibold whitespace-nowrap hover:text-text-muted',
        'after:absolute after:inset-x-3.5 after:bottom-0 after:h-[3px] after:bg-text after:transition-opacity',
        current ? 'after:opacity-100' : 'after:opacity-0'
      )}
    >
      {children}
    </Link>
  )
}

function isCurrent(pathname: string, href: string): boolean {
  if (href.includes('#')) return false
  return pathname === href || pathname.startsWith(`${href}/`)
}

/* ── Services dropdown (lg and up) ─────────────────────────────────────────── */

function ServicesMenu({
  nav,
  services,
  ctaLabel,
  phone,
  phoneHref,
  pathname,
}: {
  nav: NavSpec
  services: Service[]
  ctaLabel: string
  phone: string
  phoneHref: string
  pathname: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const wrapper = useRef<HTMLLIElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const onServices = pathname === '/services' || pathname.startsWith('/services/')

  const later = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(fn, ms)
  }

  useEffect(() => setOpen(false), [pathname])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      trigger.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    // Static, so the panel below positions against the whole header, not this item.
    <li
      ref={wrapper}
      className="flex"
      onPointerEnter={(e) => e.pointerType === 'mouse' && later(() => setOpen(true), 90)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && later(() => setOpen(false), 180)}
      onBlur={(e) => {
        if (!wrapper.current?.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          window.clearTimeout(timer.current)
          setOpen((o) => !o)
        }}
        className={clsx(
          'relative flex items-center gap-1.5 px-3.5 text-[15px] font-semibold whitespace-nowrap hover:text-text-muted',
          'after:absolute after:inset-x-3.5 after:bottom-0 after:h-[3px] after:bg-text after:transition-opacity',
          open || onServices ? 'after:opacity-100' : 'after:opacity-0'
        )}
      >
        {nav.servicesLabel}
        <ChevronDown className={clsx('h-4 w-4 transition-transform duration-200', open && 'rotate-180')} strokeWidth={2.5} aria-hidden />
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="animate-menu-in absolute inset-x-0 top-full border-b border-border bg-surface shadow-[0_28px_48px_-28px_rgb(0_0_0/0.45)]"
      >
        <div className="mx-auto grid w-full max-w-[74rem] gap-10 px-8 py-9 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <ul className="grid grid-cols-2 gap-x-8 border-t border-border xl:grid-cols-3">
              {services.map((s) => {
                const current = pathname === `/services/${s.slug}`
                return (
                  <li key={s.slug} className="border-b border-border">
                    <Link
                      href={`/services/${s.slug}`}
                      aria-current={current ? 'page' : undefined}
                      className={clsx(
                        'group flex items-center justify-between gap-3 py-3.5 text-[16px] hover:text-primary',
                        current ? 'font-bold' : 'font-medium'
                      )}
                    >
                      {s.name}
                      <ChevronRight
                        className="h-4 w-4 shrink-0 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-1.5 text-[15px] font-semibold underline-offset-4 hover:underline"
            >
              {nav.allServicesLabel}
              <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            </Link>
          </div>

          <div className="border border-border border-t-4 border-t-primary bg-bg p-6 lg:col-span-4">
            <p className="font-display text-[1.75rem] font-bold leading-[0.95]">{nav.help.title}</p>
            <p className="mt-3 text-[15px] leading-relaxed text-text-muted">{nav.help.body}</p>
            <BookButton source="nav_help" className={clsx(buttonClass({ size: 'md', block: true }), 'mt-6')}>
              {ctaLabel}
            </BookButton>
            <a href={phoneHref} className="mt-4 block text-center text-[15px] font-semibold tabular-nums hover:underline">
              Or call {phone}
            </a>
          </div>
        </div>
      </div>
    </li>
  )
}

/* ── Phone menu (below lg) ─────────────────────────────────────────────────── */

function MobileMenu({
  id,
  header,
  toggle,
  pathname,
  onClose,
  nav,
  links,
  services,
  ctaLabel,
  phone,
  phoneHref,
  address,
}: HeaderNavProps & {
  id: string
  header: React.RefObject<HTMLElement | null>
  toggle: React.RefObject<HTMLButtonElement | null>
  pathname: string
  onClose: (restoreFocus: boolean) => void
}) {
  const panel = useRef<HTMLDivElement>(null)
  const [top, setTop] = useState(64)

  useEffect(() => {
    // Under the header wherever it sits, so the toggle stays on screen to close it.
    const place = () => setTop(Math.max(0, header.current?.getBoundingClientRect().bottom ?? 64))
    place()
    window.addEventListener('resize', place)

    const html = document.documentElement
    const overflow = html.style.overflow
    html.style.overflow = 'hidden'

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose(true)
        return
      }
      if (e.key !== 'Tab' || !panel.current) return
      // Round from the last item back to the toggle, and the other way, so
      // focus never slips behind the menu onto the page it covers.
      const items = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')
      const first = items[0]
      const last = items[items.length - 1]
      if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        toggle.current?.focus()
      } else if (e.shiftKey && document.activeElement === toggle.current) {
        e.preventDefault()
        last?.focus()
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        toggle.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)

    // Anywhere on the page but the menu and its toggle is the page, which
    // the menu covers; a tap on the header's name or number closes it.
    return () => {
      window.removeEventListener('resize', place)
      document.removeEventListener('keydown', onKey)
      html.style.overflow = overflow
    }
  }, [header, toggle, onClose])

  // Following a link to a section on this page does not change the path, so close on the tap.
  const close = () => onClose(false)

  const row = 'flex items-center justify-between gap-3 py-3.5 text-[17px]'

  return (
    <div
      ref={panel}
      id={id}
      style={{ top }}
      className="animate-menu-in fixed inset-x-0 bottom-0 flex flex-col bg-bg lg:hidden"
    >
      <nav aria-label="Main" className="mx-auto w-full max-w-[74rem] flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-8 sm:px-8">
        <p className="font-display text-[2rem] font-bold leading-none">{nav.servicesLabel}</p>
        <ul className="mt-4 border-t border-border sm:grid sm:grid-cols-2 sm:gap-x-8">
          {services.map((s) => {
            const current = pathname === `/services/${s.slug}`
            return (
              <li key={s.slug} className="border-b border-border">
                <Link
                  href={`/services/${s.slug}`}
                  onClick={close}
                  aria-current={current ? 'page' : undefined}
                  className={clsx('flex items-center justify-between gap-3 py-3.5 text-[17px]', current ? 'font-bold' : 'font-medium')}
                >
                  {s.name}
                  <ChevronRight className="h-5 w-5 shrink-0 text-text-muted" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
        <Link href="/services" onClick={close} className="mt-4 inline-flex items-center gap-1.5 font-semibold underline-offset-4 hover:underline">
          {nav.allServicesLabel}
          <ChevronRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
        </Link>

        {links.length ? (
          <ul className="mt-8 border-t border-border">
            {links.map((link) => (
              <li key={link.href} className="border-b border-border">
                <Link
                  href={link.href}
                  onClick={close}
                  aria-current={isCurrent(pathname, link.href) ? 'page' : undefined}
                  className={clsx(row, 'font-semibold')}
                >
                  {link.label}
                  <ChevronRight className="h-5 w-5 shrink-0 text-text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-8 grid gap-3 text-[15px]">
          <OpenStatus />
          {address.line ? (
            address.href ? (
              <a href={address.href} className="inline-flex items-center gap-2 text-text-muted hover:text-text">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {address.line}
              </a>
            ) : (
              <p className="inline-flex items-center gap-2 text-text-muted">
                <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                {address.line}
              </p>
            )
          ) : null}
        </div>
      </nav>

      {/* The two ways to book stay under the thumb however far the list scrolls. */}
      <div className="border-t border-border bg-bg">
        <div className="mx-auto grid w-full max-w-[74rem] grid-cols-[auto_1fr] gap-2 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-8">
          <a
            href={phoneHref}
            aria-label={`Call ${phone}`}
            className={clsx(buttonClass({ variant: 'outline', size: 'md' }), withIconCell, 'h-12 pr-5')}
          >
            <span className={iconCell}>
              <Phone className="h-[1em] w-[1em]" strokeWidth={2.25} aria-hidden />
            </span>
            <span className={iconLabel}>Call</span>
          </a>
          <BookButton source="menu" className={clsx(buttonClass({ size: 'md', block: true }), 'h-12')}>
            {ctaLabel}
          </BookButton>
        </div>
      </div>
    </div>
  )
}

/**
 * True while the header should be out of the way: on a phone, after
 * scrolling down past it; back the moment the reader scrolls up. Never while
 * the menu is open, and never from `lg` (the class that hides it is `max-lg:`).
 */
function useHideOnScroll(pinned: boolean): boolean {
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    if (pinned) {
      setHidden(false)
      return
    }
    let last = window.scrollY
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const y = window.scrollY
        if (y < 96) setHidden(false)
        else if (y > last + 6) setHidden(true)
        else if (y < last - 6) setHidden(false)
        last = y
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [pinned])
  return hidden
}
