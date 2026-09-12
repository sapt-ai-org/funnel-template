import Link from 'next/link'

const LINKS = [
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/accessibility', label: 'Accessibility' },
]

/**
 * The three policy pages, as one row of links. Every page carries it: the
 * footer on most, and the pages without a footer (the review flow, the 404)
 * show it on their own.
 */
export function LegalLinks({ className, linkClassName }: { className?: string; linkClassName?: string }) {
  return (
    <nav aria-label="Policies" className={className}>
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} className={linkClassName}>
          {l.label}
        </Link>
      ))}
    </nav>
  )
}
