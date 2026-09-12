import { cn } from '@/lib/utils'
import Link from 'next/link'

/**
 * Where this page sits, as links back up. Small and quiet: it is for the
 * visitor who landed here from a search and wants the rest of the shop.
 */
export function Breadcrumbs({
  items,
  onDark = false,
}: {
  items: { href?: string; label: string }[]
  /** Over a photo hero: white, at the strengths that pass contrast on the navy wash. */
  onDark?: boolean
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px]', onDark ? 'text-white/75' : 'text-text-muted')}>
        {items.map((crumb, i) => (
          <li key={crumb.label} className="flex items-center gap-2">
            {i > 0 ? <span aria-hidden>/</span> : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className={cn('underline-offset-4 hover:underline', onDark ? 'hover:text-white' : 'hover:text-text')}
              >
                {crumb.label}
              </Link>
            ) : (
              <span aria-current="page" className={onDark ? 'text-white' : 'text-text'}>
                {crumb.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
