/**
 * ════════════════════════════════════════════════════════════════════════════
 *  THE FUNNEL — EDIT THIS ONE FILE TO STAND UP A NEW CLIENT
 * ────────────────────────────────────────────────────────────────────────────
 *  This drives the ENTIRE page (`/`): the hero, trust logos, benefits, case
 *  studies, FAQ, and the final CTA — plus the multi-step lead funnel that opens
 *  as a full-screen takeover when any button is tapped (perspective.co-style).
 *
 *  It's built for ONE offer. Everything is just strings + short lists. To launch
 *  a new client, rewrite the values below — no component edits.
 *  (Two-offer variant? The funnel's first `choice` step can list both offers.)
 *
 *  Keep copy SHORT and punchy. One idea per line. Positive framing only.
 *  For health / med-spa / stem-cell / cosmetic clients, read the COMPLIANCE note
 *  at the bottom BEFORE writing a word — Meta rejects non-compliant copy.
 * ════════════════════════════════════════════════════════════════════════════
 */

/* ── Funnel step types (the takeover flow) ─────────────────────────────────── */

export interface FunnelOption {
  id: string
  label: string
  sublabel?: string
  emoji?: string
}

export interface ChoiceStep {
  kind: 'choice'
  id: string
  question: string
  help?: string
  /** Allow multiple selections (shows a Continue button). Default: single-select + auto-advance. */
  multi?: boolean
  options: FunnelOption[]
}

export interface ContactStep {
  kind: 'contact'
  id: string
  question: string
  help?: string
  fields: ContactField[]
  submitLabel: string
}

export interface ContactField {
  id: 'name' | 'email' | 'phone'
  label: string
  placeholder: string
}

export type FunnelStep = ChoiceStep | ContactStep

export interface FunnelFlow {
  /** Promise shown on the takeover's branded side panel. */
  panelHeadline: string
  panelSubhead: string
  /** Trust chips on the panel, e.g. "Free consultation". */
  trust?: string[]
  steps: FunnelStep[]
  /** Fine print on the contact step (18+ / results-vary). */
  legal?: string
  success: { title: string; body: string; phone?: string; phoneHref?: string }
  ui: {
    backLabel: string
    closeLabel: string
    continueLabel: string
    submittingLabel: string
    genericError: string
    backToSiteLabel: string
  }
}

/* ── Landing page types (the scrollable `/` page) ──────────────────────────── */

export interface Benefit { emoji: string; title: string; body: string }
export interface Testimonial { author: string; role: string; quote: string; rating?: number }
export interface Faq { q: string; a: string }

export interface LandingSpec {
  template: 'aurora' | 'mono'
  brandName: string
  /**
   * Client logo, stamped in at provisioning time from the project's branding.
   * `null` in the template itself — every template must fall back to rendering
   * `brandName` as text when this is null.
   */
  logo: { src: string; alt: string } | null
  /** Primary CTA label reused across the page — say exactly what happens. */
  ctaLabel: string
  seo: { title: string; description: string }
  theme: {
    primary: string
    accent: string
    background: string
    surface: string
    text: string
    textMuted: string
    border: string
    bodyFontFamily: string
    displayFontFamily: string
    fontStylesheetUrl?: string
  }
  reviewConnector: string
  footerSuffix: string
  hero: {
    eyebrow: string
    headline: string
    subhead?: string
    /** Optional social-proof rating shown above the headline. */
    rating?: { score: string; count: string }
  }
  /** Company / partner names shown in the "trusted by" strip (rendered as text wordmarks). */
  trustLogos: string[]
  trustLabel: string
  benefits: { eyebrow: string; title: string; items: Benefit[] }
  proof: { eyebrow: string; title: string; items: Testimonial[] }
  faq: { eyebrow: string; title: string; items: Faq[] }
  finalCta: { eyebrow: string; title: string; subhead?: string }
  /** The lead funnel that opens on any CTA tap. */
  funnel: FunnelFlow
}

/* ════════════════════════════════════════════════════════════════════════════
   ⬇️  THE ACTIVE PROJECT — an independent auto repair shop.

   Facts about the business (name, address, phone, hours, services, rating) do
   NOT live here. They live in src/config/business.ts, generated from the
   Google Business Profile, so the site and the listing cannot disagree.
   This file is voice and offer only.
   ════════════════════════════════════════════════════════════════════════════ */

export const landingSpec: LandingSpec = {
  template: "mono",
  brandName: "Demo Auto Repair",
  logo: null,
  ctaLabel: "Book an appointment",
  seo: {
    title: "Demo Auto Repair — Honest auto repair in Your City, OH",
    description:
      "Independent auto repair. Brakes, check engine diagnostics, tires and more. Nationwide 36 month / 36,000 mile warranty. Book online in under a minute.",
  },
  theme: {
    primary: "#C8102E",
    accent: "#1D4ED8",
    background: "#FAFAFA",
    surface: "#FFFFFF",
    text: "#1F2937",
    textMuted: "#6B7280",
    border: "#E5E7EB",
    bodyFontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    displayFontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    fontStylesheetUrl: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap",
  },
  reviewConnector: "from",
  footerSuffix: "All rights reserved.",

  hero: {
    eyebrow: "Your City, OH",
    headline: "Your car fixed right, explained before we touch it.",
    subhead:
      "Straight diagnostics, work you approve first, and a nationwide warranty. Most repairs back the same day.",
    rating: { score: "4.9", count: "reviews" },
  },

  trustLabel: "Certified by",
  trustLogos: ["ASE Certified", "NAPA AutoCare", "AAA Approved"],

  benefits: {
    eyebrow: "Why this shop",
    title: "What you get that the dealer will not give you",
    items: [
      {
        emoji: "🔧",
        title: "You approve the work before it starts",
        body: "We show you what we found, tell you what it costs, and wait. Nothing gets done that you did not say yes to.",
      },
      {
        emoji: "🛡️",
        title: "36 months, 36,000 miles, nationwide",
        body: "Qualifying parts and labor are covered anywhere in the country, not just in our bays.",
      },
      {
        emoji: "🚗",
        title: "You still get your day",
        body: "Loaner cars, a free local shuttle, and an after-hours night drop so the repair does not cost you a day off work.",
      },
    ],
  },

  proof: {
    eyebrow: "Real customers",
    title: "What people say",
    items: [
      {
        author: "PLACEHOLDER — paste a real Google review",
        role: "Customer",
        quote:
          "They called before doing anything, showed me the worn pad next to a new one, and the price did not move between the quote and the invoice.",
        rating: 5,
      },
      {
        author: "PLACEHOLDER — paste a second real Google review",
        role: "Customer",
        quote:
          "Dealer wanted twelve hundred. These guys found it was a sensor, charged me a fraction, and had it back the same afternoon.",
        rating: 5,
      },
    ],
  },

  faq: {
    eyebrow: "Good to know",
    title: "Frequently asked questions",
    items: [
      {
        q: "How much will it cost?",
        a: "You get the number before we start. Diagnostics are quoted up front, and no repair begins without your approval.",
      },
      {
        q: "Do you work on my make?",
        a: "Domestic, import and hybrid. If a job needs a dealer tool we do not have, we will tell you that instead of guessing.",
      },
      {
        q: "How long will it take?",
        a: "Most common repairs go back the same day. Anything longer, we tell you at drop-off, not when you call to ask.",
      },
      {
        q: "Can I get a ride or a loaner?",
        a: "Yes. Free local shuttle, courtesy loaners subject to availability, and a night drop if you cannot make our hours.",
      },
      {
        q: "Is the warranty real?",
        a: "36 months or 36,000 miles on qualifying parts and labor, honored nationwide. Ask for the paperwork before you pay.",
      },
    ],
  },

  finalCta: {
    eyebrow: "Ready when you are",
    title: "Get your car booked in.",
    subhead:
      "Takes under a minute. Tell us what it is doing and we will tell you what it needs.",
  },

  funnel: {
    panelHeadline: "Tell us what the car is doing.",
    panelSubhead: "Three taps and your details. We will call you back to confirm a time.",
    trust: ["Free estimate", "No work without your approval", "Takes under a minute"],
    steps: [
      {
        kind: "choice",
        id: "issue",
        question: "What is going on with the vehicle?",
        help: "Closest one is fine. We will work the rest out on the phone.",
        options: [
          { id: "warning_light", emoji: "⚠️", label: "A warning light is on", sublabel: "Check engine, ABS, TPMS" },
          { id: "brakes", emoji: "🛑", label: "Brakes", sublabel: "Grinding, squealing, soft pedal" },
          { id: "noise", emoji: "🔊", label: "A noise or a vibration", sublabel: "Something changed recently" },
          { id: "wont_start", emoji: "🔋", label: "It will not start", sublabel: "Battery, starter, no crank" },
          { id: "maintenance", emoji: "🛠️", label: "Routine maintenance", sublabel: "Oil, tires, inspection" },
          { id: "not_sure", emoji: "🤔", label: "Not sure", sublabel: "Have a look and tell me" },
        ],
      },
      {
        kind: "choice",
        id: "timing",
        question: "When do you need it in?",
        options: [
          { id: "today", emoji: "🔥", label: "Today if you can take it" },
          { id: "this_week", emoji: "📅", label: "This week" },
          { id: "flexible", emoji: "👍", label: "Whenever suits you" },
        ],
      },
      {
        kind: "contact",
        id: "contact",
        question: "Where do we reach you?",
        help: "We will call to confirm a time. No work happens without your say-so.",
        fields: [
          { id: "name", label: "Full name", placeholder: "Your name" },
          { id: "phone", label: "Mobile", placeholder: "Phone number" },
          { id: "email", label: "Email", placeholder: "you@email.com" },
        ],
        submitLabel: "Request my appointment",
      },
    ],
    legal: "By submitting you agree we may contact you about your vehicle. Estimates are provided before any work begins.",
    success: {
      title: "Got it.",
      body: "We will call shortly to confirm a time. If it is urgent, call the shop and we will get you straight in.",
      phone: "(216) 555-0148",
      phoneHref: "tel:+12165550148",
    },
    ui: {
      backLabel: "Back",
      closeLabel: "Close",
      continueLabel: "Continue",
      submittingLabel: "Submitting…",
      genericError: "We couldn’t submit that. Please try again.",
      backToSiteLabel: "Back to site",
    },
  },
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPLIANCE — Meta Health & Wellness (read before editing copy)
   ────────────────────────────────────────────────────────────────────────────
   Cosmetic / med-spa / stem-cell / weight / supplement funnels MUST:
     • target 18+  (set on the ad set AND stated in `funnel.legal`)
     • use positive framing — never attack someone's appearance
     • never promise guaranteed outcomes or timeframes without "results vary"
     • (stem-cell/regenerative) NEVER claim to treat/cure a disease — consult only
   NEVER use these words in any funnel or ad copy:
   ════════════════════════════════════════════════════════════════════════════ */

export const BANNED_WORDS = [
  'guaranteed',
  'permanent',
  'cure',
  'reverse',
  'miracle',
  'instant',
  'eliminate',
  'heal',
] as const

/** Returns any banned words found in `text` (case-insensitive). Empty = clean. */
export function scanForBannedWords(text: string): string[] {
  return BANNED_WORDS.filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(text))
}

/** Every string a visitor will read — used by the compliance test. */
export function landingCopy(spec: LandingSpec): string {
  const parts: string[] = [
    spec.brandName, spec.ctaLabel,
    spec.seo.title, spec.seo.description, spec.reviewConnector, spec.footerSuffix,
    spec.hero.eyebrow, spec.hero.headline, spec.hero.subhead ?? '',
    spec.trustLabel, ...spec.trustLogos,
    spec.benefits.eyebrow, spec.benefits.title,
    ...spec.benefits.items.flatMap((b) => [b.title, b.body]),
    spec.proof.eyebrow, spec.proof.title,
    ...spec.proof.items.flatMap((t) => [t.author, t.role, t.quote]),
    spec.faq.eyebrow, spec.faq.title,
    ...spec.faq.items.flatMap((f) => [f.q, f.a]),
    spec.finalCta.eyebrow, spec.finalCta.title, spec.finalCta.subhead ?? '',
    spec.funnel.panelHeadline, spec.funnel.panelSubhead, spec.funnel.legal ?? '',
    spec.funnel.success.title, spec.funnel.success.body,
    ...Object.values(spec.funnel.ui),
  ]
  for (const step of spec.funnel.steps) {
    parts.push(step.question, step.help ?? '')
    if (step.kind === 'choice') for (const o of step.options) parts.push(o.label, o.sublabel ?? '')
    else parts.push(
      step.submitLabel,
      ...step.fields.flatMap((field) => [field.label, field.placeholder])
    )
  }
  return parts.join(' ')
}
