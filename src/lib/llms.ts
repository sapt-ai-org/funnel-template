/**
 * /llms-full.txt: everything the site says, in one plain-text file.
 *
 * The llms.txt convention has two files. /llms.txt is the index an AI
 * assistant reads first: the facts, a line per page, the questions (see
 * `llmsTxt` in schema.ts). This is its companion: the index, then the full
 * content of every page it points to, so an assistant can answer "does this
 * shop do pre-purchase inspections, and what do they check?" from one fetch
 * without crawling the site. Built from the same reads and the same fallbacks
 * as the pages, so it never says something the site does not.
 */

import { business } from '@/config/business'
import { landingSpec } from '@/config/funnel'
import { serviceCopy } from '@/config/services'
import type { Article, ArticleSection, Service, Special } from '@/lib/cms'
import { llmsTxt } from '@/lib/schema'

const origin = () => business.siteUrl.replace(/\/+$/, '')

export function llmsFullTxt(content: {
  services: Service[]
  /** The home page's questions. */
  faqs: { q: string; a: string }[]
  /** Each service's questions, as its page shows them, keyed by slug. */
  serviceFaqs: Record<string, { q: string; a: string }[]>
  articles: Article[]
  specials: Special[]
}): string {
  // The index, without the per-service questions: they appear below under each service in full.
  const lines = [llmsTxt({ services: content.services, faqs: content.faqs, articles: content.articles }).trimEnd()]

  const promise = landingSpec.promise
  lines.push('', '---', '', `## ${promise.title}`, promise.intro, '')
  promise.steps.forEach((step, i) => lines.push(`${i + 1}. **${step.title}.** ${step.body}`))

  for (const s of content.services) {
    const copy = serviceCopy(s.slug, s.name)
    lines.push('', '---', '', `## ${s.name}`, `Page: ${origin()}/services/${s.slug}`, '', s.summary)
    if (s.description) lines.push('', s.description)
    if (copy.includes.length) lines.push('', `### ${landingSpec.servicePage.includesTitle}`, ...copy.includes.map((l) => `- ${l}`))
    if (copy.signs.length) lines.push('', `### ${landingSpec.servicePage.signsTitle}`, ...copy.signs.map((l) => `- ${l}`))
    const questions = content.serviceFaqs[s.slug] ?? []
    if (questions.length) {
      lines.push('', `### ${landingSpec.servicePage.questionsTitle}`)
      for (const f of questions) lines.push('', `#### ${f.q}`, f.a)
    }
  }

  if (content.specials.length) {
    lines.push('', '---', '', '## Specials')
    for (const sp of content.specials) {
      lines.push('', `### ${sp.title}`, sp.detail)
      if (sp.terms) lines.push(`Terms: ${sp.terms}`)
    }
  }

  for (const post of content.articles) {
    const meta = [post.category, post.vehicle, post.publishedAt ? post.publishedAt.slice(0, 10) : null].filter(Boolean).join(', ')
    lines.push('', '---', '', `## ${post.title}`, `Page: ${origin()}/blog/${post.slug}`)
    if (meta) lines.push(meta)
    if (post.excerpt) lines.push('', post.excerpt)
    for (const section of post.sections) lines.push('', ...sectionText(section))
  }

  lines.push(
    '',
    '---',
    '',
    `The short index of this site is ${origin()}/llms.txt. This file was built ${new Date().toISOString().slice(0, 10)}.`
  )
  return lines.join('\n') + '\n'
}

/** A post's body as Markdown: headings one level under the post's own. */
function sectionText(s: ArticleSection): string[] {
  switch (s.type) {
    case 'paragraph':
      return [s.text]
    case 'heading':
      return [`${s.level === 'h3' ? '####' : '###'} ${s.text}`]
    case 'list':
      return s.items.map((item, i) => (s.ordered ? `${i + 1}. ${item}` : `- ${item}`))
    case 'image':
      return [`![${s.alt}](${s.url})${s.caption ? `\n${s.caption}` : ''}`]
    case 'callout':
      return [`> ${s.title ? `**${s.title}** ` : ''}${s.text}`]
    case 'stat':
      return [`**${s.value}** ${s.label}${s.description ? `: ${s.description}` : ''}`]
  }
}

