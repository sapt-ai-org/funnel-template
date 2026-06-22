export interface FunnelQuestion {
  id: string
  label: string
  helper?: string
  placeholder?: string
  type: 'text' | 'textarea' | 'select'
  required?: boolean
  options?: { value: string; label: string }[]
}

export interface FunnelConfig {
  brand: {
    name: string
    logoUrl: string
    eyebrow: string
    headline: string
    subheadline: string
    primaryCta: string
    secondaryCta: string
  }
  offer: {
    name: string
    promise: string
    bullets: string[]
  }
  form: {
    title: string
    description: string
    submitLabel: string
    questions: FunnelQuestion[]
  }
  thankYou: {
    headline: string
    body: string
    nextStepLabel: string
    nextStepUrl: string
  }
}

export const funnelConfig: FunnelConfig = {
  brand: {
    name: 'Sapt Funnel Template',
    logoUrl: '/logo.svg',
    eyebrow: 'Cloudflare-first. Sapt-native. Ready to customize.',
    headline: 'Turn visitors into structured Sapt CRM leads in minutes.',
    subheadline:
      'A clean production-ready funnel template with lead capture, CRM writes, memory, attribution, and custom analytics events already wired in.',
    primaryCta: 'Start the funnel',
    secondaryCta: 'See how it works',
  },
  offer: {
    name: 'Strategy call',
    promise: 'Capture qualified prospects and preserve every useful detail in Sapt.',
    bullets: [
      'Creates a Sapt CRM record linked to the Person spine',
      'Stores qualitative context as Sapt memory',
      'Tracks pageviews, form events, and custom conversion events',
    ],
  },
  form: {
    title: 'Tell us what you are building',
    description: 'This default form is intentionally simple. Edit `src/config/funnel.ts` to make it yours.',
    submitLabel: 'Submit lead',
    questions: [
      {
        id: 'goal',
        label: 'What do you want help with?',
        helper: 'Keep this broad; your AI agent or team can refine later inside Sapt.',
        type: 'textarea',
        placeholder: 'We want to launch a paid acquisition funnel for...',
        required: true,
      },
      {
        id: 'timeline',
        label: 'Timeline',
        type: 'select',
        required: true,
        options: [
          { value: 'asap', label: 'As soon as possible' },
          { value: '30_days', label: 'Within 30 days' },
          { value: 'quarter', label: 'This quarter' },
          { value: 'exploring', label: 'Just exploring' },
        ],
      },
    ],
  },
  thankYou: {
    headline: 'You are all set.',
    body: 'Your submission is now in Sapt with CRM, memory, analytics, and attribution attached.',
    nextStepLabel: 'Open Sapt',
    nextStepUrl: 'https://app.sapt.ai',
  },
}
