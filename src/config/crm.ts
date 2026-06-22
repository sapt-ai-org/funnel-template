import type { CreateObjectTypeInput } from '../lib/sapt/types'

export const FUNNEL_LEAD_TYPE_SLUG = 'funnel_lead'

export const funnelLeadObjectType: CreateObjectTypeInput = {
  slug: FUNNEL_LEAD_TYPE_SLUG,
  name: 'Funnel Lead',
  description: 'Leads and conversions captured by the Sapt funnel template.',
  icon: 'target',
  color: '#14b8a6',
  isPublicIngestable: true,
  linksToPerson: true,
  rejectUnknownFields: false,
  statuses: [
    { key: 'new', label: 'New', color: '#3b82f6', isInitial: true },
    { key: 'qualified', label: 'Qualified', color: '#22c55e' },
    { key: 'converted', label: 'Converted', color: '#a855f7', isTerminal: true },
  ],
  schema: {
    name: { label: 'Name', schema: { type: 'string' } },
    email: { label: 'Email', schema: { type: 'string', format: 'email' } },
    phone: { label: 'Phone', schema: { type: 'string', format: 'phone' } },
    company: { label: 'Company', schema: { type: 'string' } },
    offer: { label: 'Offer', schema: { type: 'string' } },
    message: { label: 'Message', schema: { type: 'string' } },
    visitorId: { label: 'Sapt visitor ID', schema: { type: 'string' } },
    landingPage: { label: 'Landing page', schema: { type: 'string', format: 'url' } },
    referrer: { label: 'Referrer', schema: { type: 'string' } },
    utmSource: { label: 'UTM source', schema: { type: 'string' } },
    utmMedium: { label: 'UTM medium', schema: { type: 'string' } },
    utmCampaign: { label: 'UTM campaign', schema: { type: 'string' } },
    utmTerm: { label: 'UTM term', schema: { type: 'string' } },
    utmContent: { label: 'UTM content', schema: { type: 'string' } },
    answers: { label: 'Funnel answers', schema: { type: 'object' } },
    source: { label: 'Source', schema: { type: 'string' } },
  },
}

export function objectTypeUpdatePayload() {
  return {
    name: funnelLeadObjectType.name,
    description: funnelLeadObjectType.description,
    icon: funnelLeadObjectType.icon,
    color: funnelLeadObjectType.color,
    isPublicIngestable: funnelLeadObjectType.isPublicIngestable,
    linksToPerson: funnelLeadObjectType.linksToPerson,
    rejectUnknownFields: funnelLeadObjectType.rejectUnknownFields,
    statuses: funnelLeadObjectType.statuses,
    schema: funnelLeadObjectType.schema,
  }
}
