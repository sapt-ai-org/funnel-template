import { cn } from '@/lib/utils'
import { Breadcrumbs } from './Breadcrumbs'

/** The one big heading a page that is not the home page opens with. */
export const pageTitleClass =
  'font-display text-[2.75rem] font-bold leading-[0.95] tracking-[-0.01em] text-balance sm:text-[4rem]'

/** The top of a list page: where it sits, what it is, and a line about it. */
export function PageHead({
  crumbs,
  title,
  intro,
}: {
  crumbs: { href?: string; label: string }[]
  title: string
  intro?: string | null
}) {
  return (
    <>
      <Breadcrumbs items={crumbs} />
      <h1 className={cn(pageTitleClass, 'mt-6')}>{title}</h1>
      {intro ? <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-text-muted">{intro}</p> : null}
    </>
  )
}
