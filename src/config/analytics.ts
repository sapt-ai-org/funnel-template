export const analyticsEvents = {
  viewed: 'funnel_viewed',
  ctaClicked: 'funnel_cta_clicked',
  formStarted: 'funnel_form_started',
  leadSubmitted: 'funnel_lead_submitted',
  leadCreated: 'funnel_lead_created',
  conversionCompleted: 'funnel_conversion_completed',
  setupChecked: 'funnel_setup_checked',
} as const

export type AnalyticsEventName = (typeof analyticsEvents)[keyof typeof analyticsEvents]
