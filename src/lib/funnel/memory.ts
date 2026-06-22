import { funnelConfig } from '../../config/funnel'
import type { LeadInput } from './schema'

export function buildLeadMemoryContent(input: LeadInput, recordId: string): string {
  const lines = [
    `# Funnel lead: ${input.name}`,
    '',
    `- CRM record ID: ${recordId}`,
    `- Email: ${input.email}`,
    input.phone ? `- Phone: ${input.phone}` : null,
    input.company ? `- Company: ${input.company}` : null,
    `- Offer: ${funnelConfig.offer.name}`,
    input.visitorId ? `- Sapt visitor ID: ${input.visitorId}` : null,
    input.landingPage ? `- Landing page: ${input.landingPage}` : null,
    input.referrer ? `- Referrer: ${input.referrer}` : null,
    '',
    input.message ? `## Message\n\n${input.message}` : null,
    buildAnswersMarkdown(input.answers ?? {}),
  ]

  return lines.filter((line): line is string => typeof line === 'string').join('\n')
}

function buildAnswersMarkdown(answers: Record<string, unknown>): string | null {
  const entries = Object.entries(answers)
  if (entries.length === 0) return null

  const content = entries
    .map(([key, value]) => `### ${labelForQuestion(key)}\n\n${formatAnswer(value)}`)
    .join('\n\n')

  return `## Funnel answers\n\n${content}`
}

function labelForQuestion(id: string): string {
  return funnelConfig.form.questions.find((q) => q.id === id)?.label ?? id
}

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ')
  if (value && typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value ?? '')
}
