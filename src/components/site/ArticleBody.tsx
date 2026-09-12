import type { ArticleSection } from '@/lib/cms'
import { filePhoto } from '@/lib/images'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'
import { Photo } from './Photo'

/**
 * A post's body, section by section, in the page's own type. Sapt stores the
 * same sections for every tenant's articles; anything this does not know how
 * to draw was already dropped when the post was read (see `parseSections`).
 */
export function ArticleBody({ sections, className }: { sections: ArticleSection[]; className?: string }) {
  return (
    <div className={cn('grid gap-6 text-lg leading-relaxed', className)}>
      {sections.map((s, i) => {
        switch (s.type) {
          case 'paragraph':
            return (
              <p key={i}>
                {s.text.split('[break]').map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 ? <br /> : null}
                    {line.trim()}
                  </Fragment>
                ))}
              </p>
            )
          case 'heading':
            return s.level === 'h3' ? (
              <h3 key={i} className="mt-2 font-display text-2xl font-bold leading-tight">
                {s.text}
              </h3>
            ) : (
              <h2 key={i} className="mt-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
                {s.text}
              </h2>
            )
          case 'list': {
            const List = s.ordered ? 'ol' : 'ul'
            return (
              <List key={i} className={cn('grid gap-2 pl-6', s.ordered ? 'list-decimal' : 'list-disc')}>
                {s.items.map((entry) => (
                  <li key={entry}>{entry}</li>
                ))}
              </List>
            )
          }
          case 'image':
            return (
              <figure key={i}>
                <Photo photo={filePhoto(s.url, s.alt, 16 / 9)} sizes="(min-width: 768px) 720px, 100vw" />
                {s.caption ? <figcaption className="mt-2 text-[15px] text-text-muted">{s.caption}</figcaption> : null}
              </figure>
            )
          case 'callout':
            return (
              <aside key={i} className="rounded-lg border-l-4 border-primary bg-surface p-5">
                {s.title ? <p className="font-semibold">{s.title}</p> : null}
                <p className={s.title ? 'mt-1' : undefined}>{s.text}</p>
              </aside>
            )
          case 'stat':
            return (
              <div key={i} className="rounded-lg border border-border bg-surface p-5">
                <p className="font-display text-5xl font-bold leading-none">{s.value}</p>
                <p className="mt-2 font-semibold">{s.label}</p>
                {s.description ? <p className="mt-1 text-text-muted">{s.description}</p> : null}
              </div>
            )
        }
      })}
    </div>
  )
}
