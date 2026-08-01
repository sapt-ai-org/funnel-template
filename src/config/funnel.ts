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
  fields: Array<'name' | 'email' | 'phone'>
  submitLabel: string
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
}

/* ── Landing page types (the scrollable `/` page) ──────────────────────────── */

export interface Benefit { emoji: string; title: string; body: string }
export interface Testimonial { author: string; role: string; quote: string; rating?: number }
export interface Faq { q: string; a: string }

export interface LandingSpec {
  brandName: string
  /**
   * Client logo, stamped in at provisioning time from the project's branding.
   * `null` in the template itself — every template must fall back to rendering
   * `brandName` as text when this is null.
   */
  logo: { src: string; alt: string } | null
  /** Primary CTA label reused across the page — say exactly what happens. */
  ctaLabel: string
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
   ⬇️  THE ACTIVE PROJECT — example: an independent med spa. Rewrite the strings.
   ════════════════════════════════════════════════════════════════════════════ */

export const landingSpec: LandingSpec = {
  brandName: "Placeholder Co",
  logo: null,
  ctaLabel: "Book your free consultation",

  hero: {
    eyebrow: "City, State",
    headline: "One striking sentence about the outcome they want.",
    subhead: "A short supporting line. Say what happens next and how long it takes.",
    rating: { score: "5.0", count: "00 reviews" },
  },

  trustLabel: "Trusted partners",
  trustLogos: ["Partner One", "Partner Two", "Partner Three"],

  benefits: {
    eyebrow: "Why us",
    title: "Three reasons they should choose this business",
    items: [
      {
        emoji: "⭐",
        title: "First benefit",
        body: "One or two sentences in the customer's words, describing what they get.",
      },
      {
        emoji: "💬",
        title: "Second benefit",
        body: "Keep it concrete. Lead with the outcome, not the process.",
      },
      {
        emoji: "✨",
        title: "Third benefit",
        body: "End on the thing that removes the biggest objection.",
      },
    ],
  },

  proof: {
    eyebrow: "Real clients",
    title: "What people say",
    items: [
      {
        author: "Placeholder — replace with a real review",
        role: "Client",
        quote: "A real quote from a real customer. Specific beats glowing.",
        rating: 5,
      },
      {
        author: "Placeholder — replace with a second real review",
        role: "Client",
        quote: "A second review, ideally naming a different objection than the first.",
        rating: 5,
      },
    ],
  },

  faq: {
    eyebrow: "Good to know",
    title: "Frequently asked questions",
    items: [
      {
        q: "How much does a consultation cost?",
        a: "Answer the price question first and plainly.",
      },
      { q: "Where are you located?", a: "List the service area or locations." },
      { q: "How do I book?", a: "Describe the two or three steps after they tap the button." },
      { q: "Do I have to decide right away?", a: "Remove the commitment objection explicitly." },
      { q: "Who will I be working with?", a: "Name the credential that builds trust." },
    ],
  },

  finalCta: {
    eyebrow: "Ready when you are",
    title: "Book your free consultation today",
    subhead: "It takes about 30 seconds. No obligation.",
  },

  funnel: {
    panelHeadline: "Book your free consultation in 30 seconds.",
    panelSubhead: "Answer a few quick questions and we'll match you with the right option.",
    trust: ["Free consultation", "No obligation", "Takes 30 seconds"],
    steps: [
      {
        kind: "choice",
        id: "goal",
        question: "What are you interested in?",
        help: "Pick the one closest to your goal.",
        options: [
          { id: "option_one", emoji: "✨", label: "First option", sublabel: "What it is" },
          { id: "option_two", emoji: "💧", label: "Second option", sublabel: "What it is" },
        ],
      },
      {
        kind: "choice",
        id: "timing",
        question: "When would you like to start?",
        options: [
          { id: "asap", emoji: "🔥", label: "As soon as possible" },
          { id: "month", emoji: "📅", label: "Within a month" },
          { id: "exploring", emoji: "👀", label: "Just exploring" },
        ],
      },
      {
        kind: "contact",
        id: "contact",
        question: "Where should we send your consultation details?",
        help: "We'll reach out to book a time that works for you.",
        fields: ["name", "phone", "email"],
        submitLabel: "Book my free consultation",
      },
    ],
    legal: "You must be 18 or older. A consultation is required; individual results vary.",
    success: {
      title: "You're all set! 🎉",
      body: "Thanks — our team will reach out shortly to book your free consultation.",
      phone: "(000) 000-0000",
      phoneHref: "tel:+10000000000",
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
  ]
  for (const step of spec.funnel.steps) {
    parts.push(step.question, step.help ?? '')
    if (step.kind === 'choice') for (const o of step.options) parts.push(o.label, o.sublabel ?? '')
    else parts.push(step.submitLabel)
  }
  return parts.join(' ')
}
