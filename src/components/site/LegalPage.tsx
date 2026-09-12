import type { LegalDocument } from '@/config/legal'
import { PageHead } from './PageHead'
import { Container, Section } from './primitives'

/** A policy page: a narrow column of plain headings and paragraphs, easy to read on a phone. */
export function LegalPage({ doc, updated }: { doc: LegalDocument; updated: string }) {
  return (
    <Section tone="paper" className="pt-8 sm:pt-12">
      <Container className="max-w-[48rem]">
        <PageHead crumbs={[{ href: '/', label: 'Home' }, { label: doc.title }]} title={doc.title} intro={doc.intro} />
        <p className="mt-4 text-[15px] text-text-muted">Last updated {updated}</p>
        <div className="mt-10 grid gap-10">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{s.heading}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 text-lg leading-relaxed text-text-muted">
                  {p}
                </p>
              ))}
              {s.list?.length ? (
                <ul className="mt-3 grid list-disc gap-1.5 pl-6 text-lg leading-relaxed text-text-muted">
                  {s.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
      </Container>
    </Section>
  )
}
