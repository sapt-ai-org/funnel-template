import type { ResolvedPhoto } from '@/lib/images'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Photo } from './Photo'

/**
 * A photo, a title and a line, as one link: a service on the services page,
 * a job story on the blog. The whole card is the tap target, because on a
 * phone a thumb does not aim for the words.
 */
export function LinkCard({
  href,
  photo,
  eyebrow,
  title,
  body,
  headingLevel = 3,
  className,
}: {
  href: string
  photo?: ResolvedPhoto | null
  eyebrow?: string | null
  title: string
  body?: string | null
  headingLevel?: 2 | 3
  className?: string
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <Link
      href={href}
      className={cn(
        'group flex h-full flex-col rounded-lg border border-border bg-surface p-3 transition-colors hover:border-text/40',
        className
      )}
    >
      {photo ? (
        <Photo photo={photo} className="aspect-[4/3]" sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw" />
      ) : null}
      <div className="px-2 pb-2 pt-4">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.06em] text-text-muted">{eyebrow}</p> : null}
        <Heading className={cn('font-display text-2xl font-bold leading-tight group-hover:text-primary', eyebrow && 'mt-1')}>
          {title}
        </Heading>
        {body ? <p className="mt-2 text-text-muted">{body}</p> : null}
      </div>
    </Link>
  )
}
