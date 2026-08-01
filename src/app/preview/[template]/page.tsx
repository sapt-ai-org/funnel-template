import { landingSpec } from '@/config/funnel'
import { TEMPLATES } from '@/templates/registry'
import { notFound } from 'next/navigation'

/**
 * Live template preview, rendered with the placeholder spec. This is what the
 * admin picker embeds in a phone frame. Deleted by `init-project.ts`.
 */

export function generateStaticParams() {
  return Object.keys(TEMPLATES).map((template) => ({ template }))
}

export default async function TemplatePreview({
  params,
}: {
  params: Promise<{ template: string }>
}) {
  const { template } = await params
  const entry = TEMPLATES[template]
  if (!entry) notFound()

  const Landing = entry.component
  return <Landing spec={landingSpec} />
}
