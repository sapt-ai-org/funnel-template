import { funnelConfig } from '../../config/funnel'
import type { LeadInput } from './schema'

export function buildLeadRecordData(input: LeadInput): Record<string, unknown> {
  return removeEmptyValues({
    name: input.name,
    email: input.email.toLowerCase(),
    phone: cleanOptional(input.phone),
    company: cleanOptional(input.company),
    offer: funnelConfig.offer.name,
    message: cleanOptional(input.message),
    answers: input.answers ?? {},
    visitorId: input.visitorId ?? undefined,
    landingPage: cleanOptional(input.landingPage),
    referrer: cleanOptional(input.referrer),
    utmSource: cleanOptional(input.utm?.source),
    utmMedium: cleanOptional(input.utm?.medium),
    utmCampaign: cleanOptional(input.utm?.campaign),
    utmTerm: cleanOptional(input.utm?.term),
    utmContent: cleanOptional(input.utm?.content),
    source: 'sapt-funnel-template',
  })
}

export function extractUtm(search: URLSearchParams) {
  return {
    source: search.get('utm_source') ?? undefined,
    medium: search.get('utm_medium') ?? undefined,
    campaign: search.get('utm_campaign') ?? undefined,
    term: search.get('utm_term') ?? undefined,
    content: search.get('utm_content') ?? undefined,
  }
}

function cleanOptional(value: string | undefined | null): string | undefined {
  const cleaned = value?.trim()
  return cleaned ? cleaned : undefined
}

function removeEmptyValues(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}
