/**
 * ════════════════════════════════════════════════════════════════════════════
 *  THE VOICE — every sentence a visitor reads, and nothing else.
 * ────────────────────────────────────────────────────────────────────────────
 *  The site is split three ways, and each fact lives in exactly one of them:
 *
 *    src/config/business.ts  the facts: name, phone, address, hours, services,
 *                            rating, warranty. Generated from Google by
 *                            `pnpm pull-gbp`. Never repeat one of those here,
 *                            or the site and the listing will drift apart.
 *    src/config/funnel.ts    the voice (this file): headlines, the repair
 *                            promise, FAQ, the booking questions.
 *    src/lib/images.ts       the photographs, one named slot per position.
 *
 *  Each key below maps to one section component in src/components/site, in
 *  the order they appear on the page (see src/app/page.tsx). Rewrite values;
 *  do not rename keys.
 *
 *  Keep copy short and specific. The true specific thing ("36 months, 36,000
 *  miles") beats the adjective ("great warranty") and survives ad review.
 *  Read the COMPLIANCE note at the bottom before writing a word.
 * ════════════════════════════════════════════════════════════════════════════
 */

/* ── Booking flow (the full-screen takeover) ───────────────────────────────── */

export interface FunnelOption {
  /** Must match a choice id on the `booking` type in sapt.manifest.json. */
  id: string
  label: string
  sublabel?: string
  /**
   * Picking this option opens a short, optional text box instead of moving
   * straight on ("Other"). What they type is saved as `<step id>_details`.
   */
  input?: { label: string; placeholder: string }
}

export interface ChoiceStep {
  kind: 'choice'
  id: string
  question: string
  help?: string
  /** Allow multiple selections (shows a Continue button). Default: single-select + auto-advance. */
  multi?: boolean
  /**
   * Skipped when the booking starts on a service's own page: someone who
   * booked from "Pre-purchase inspection" has already said what they need,
   * and asking again with choices that do not fit it reads as not listening.
   */
  answeredByService?: boolean
  options: FunnelOption[]
}

export interface ContactField {
  id: 'name' | 'email' | 'phone' | 'vehicle'
  label: string
  placeholder: string
}

export interface ContactStep {
  kind: 'contact'
  id: string
  question: string
  help?: string
  fields: ContactField[]
  submitLabel: string
}

export type FunnelStep = ChoiceStep | ContactStep

/** The service a booking started from, when it started on that service's page. */
export interface BookingService {
  slug: string
  name: string
  /** The `issue` answer it stands for, when one fits (see src/config/services.ts). */
  issue?: string
}

/** The steps to ask: all of them, or without the ones a service page has answered. */
export function stepsFor(flow: FunnelFlow, service?: BookingService | null): FunnelStep[] {
  return service ? flow.steps.filter((s) => !(s.kind === 'choice' && s.answeredByService)) : flow.steps
}

export interface FunnelFlow {
  /** Reassurance under the progress bar, e.g. "No work without your approval". */
  trust?: string[]
  steps: FunnelStep[]
  /** Consent line on the contact step. */
  legal?: string
  /** The shop's phone is added from business.ts, so it is never stale here. */
  success: { title: string; body: string }
  ui: {
    backLabel: string
    closeLabel: string
    continueLabel: string
    submittingLabel: string
    genericError: string
    backToSiteLabel: string
  }
}

/* ── The page ──────────────────────────────────────────────────────────────── */

export interface PromiseStep {
  title: string
  body: string
}

/**
 * A custom section, rendered by sections/Feature.tsx after the services. For
 * what a shop wants to add most often: "Fleet accounts", "Hybrid and EV
 * service", "Diesel". `id` becomes the section's anchor, so keep it short and
 * unique (`fleet`, `ev`).
 */
export interface FeatureBlock {
  id: string
  title: string
  body: string
  /** Three or four short, specific points. */
  points?: string[]
  /** A photo slot from src/lib/images.ts, or a file in public/ with its alt text. */
  photo?: import('@/lib/images').SlotId | { src: string; alt: string }
  /** Photo on the right instead of the left, to alternate with a neighbour. */
  reverse?: boolean
  /** Show the book button under the points. */
  cta?: boolean
  tone?: 'paper' | 'white'
}

export interface Faq {
  q: string
  a: string
}

/** A link in the header and the phone menu, beside the services dropdown. */
export interface NavLink {
  label: string
  href: string
  /**
   * Shown only when what it points at exists: the reviews section renders
   * only with a Google rating or reviews, and the blog only with a post.
   */
  requires?: 'reviews' | 'posts'
}

export interface NavSpec {
  /** The dropdown of every service. */
  servicesLabel: string
  /** The dropdown's link to the /services page. */
  allServicesLabel: string
  links: NavLink[]
  /** The panel beside the services list, for someone who does not know what the car needs. */
  help: { title: string; body: string }
  /** The phone menu's toggle, for screen readers. */
  openMenuLabel: string
  closeMenuLabel: string
}

export interface LandingSpec {
  /**
   * The project name, stamped by init-project at provisioning. The page
   * renders `business.name` (kept in sync with Google); this is the logo's
   * alt text and the name before the first `pull-gbp`.
   */
  brandName: string
  /** Stamped from the project's branding at provisioning. `null` renders the name as a wordmark. */
  logo: { src: string; alt: string } | null
  /** Every book button on the page. Say exactly what happens. */
  ctaLabel: string
  /** The header's links and the services dropdown. */
  nav: NavSpec
  /** The page title is built from business.ts. This is the search snippet. */
  seo: { description: string }
  hero: { headline: string; subhead: string }
  /** The repair-order slip: how a job goes, in order. */
  promise: { title: string; intro: string; steps: PromiseStep[]; approval: string }
  services: { title: string; footnote: string }
  /** Custom sections, in order, after the services. Empty by default. */
  features: FeatureBlock[]
  /** The reviews themselves come from Google, via business.ts. */
  proof: { title: string }
  /** The people and the place. The owner's name and the amenities come from business.ts. */
  shop: { title: string; body: string; amenitiesTitle: string }
  /** The photo bento. The photos themselves come from src/lib/images.ts. */
  gallery: { title: string; intro: string }
  visit: { title: string }
  /** `ask` is the box beside the questions, for the one that is not there. */
  faq: { title: string; items: Faq[]; ask: { title: string; body: string } }
  /** The blog's index page. The posts themselves come from Sapt (Content > Articles). */
  blog: { title: string; intro: string }
  /**
   * Headings on each service's own page. What goes under them comes from Sapt,
   * or from src/config/services.ts until the shop has written its own.
   */
  servicePage: {
    includesTitle: string
    signsTitle: string
    questionsTitle: string
    storiesTitle: string
    othersTitle: string
  }
  finalCta: { title: string; subhead: string }
  funnel: FunnelFlow
}

/* ════════════════════════════════════════════════════════════════════════════
   ⬇️  THE ACTIVE PROJECT — an independent auto repair shop.
   ════════════════════════════════════════════════════════════════════════════ */

export const landingSpec: LandingSpec = {
  brandName: 'Demo Auto Repair',
  logo: null,
  ctaLabel: 'Book an appointment',
  nav: {
    servicesLabel: 'Services',
    allServicesLabel: 'All services',
    links: [
      { label: 'How it works', href: '/#how-it-works' },
      { label: 'Reviews', href: '/#reviews', requires: 'reviews' },
      { label: 'Hours', href: '/#visit' },
      { label: 'Blog', href: '/blog', requires: 'posts' },
    ],
    help: {
      title: 'Not sure what it needs?',
      body: 'Tell us what the car is doing. We find the problem and call with a price before any work starts.',
    },
    openMenuLabel: 'Open menu',
    closeMenuLabel: 'Close menu',
  },
  seo: {
    description:
      'Independent auto repair. Brakes, check engine diagnostics, tires and more, with a written estimate before any work starts. Book online in under a minute.',
  },

  hero: {
    headline: 'Your car fixed right, explained before we touch it.',
    subhead:
      'Straight diagnostics, work you approve first, and a nationwide warranty. Most repairs are back the same day.',
  },

  promise: {
    title: 'How every repair goes',
    intro:
      'The same three steps on every job, whether it is a brake pad or an engine. You are never surprised by the bill.',
    steps: [
      {
        title: 'We find the problem',
        body: 'A technician inspects and tests the car. We do not guess, and we do not start fixing yet.',
      },
      {
        title: 'We call you with the price',
        body: 'Parts, labor and time, itemized. If something can safely wait, we tell you that too.',
      },
      {
        title: 'Nothing starts until you say yes',
        body: 'Approve it by phone or text. The work done is the work you approved.',
      },
    ],
    approval: 'Your approval, before any work',
  },

  services: {
    title: 'What we fix',
    footnote:
      'Not on the list? Call and ask. If it is not something we do well, we will tell you who does.',
  },

  // Custom sections. None by default; add one per thing this shop wants to
  // be known for, for example:
  //   {
  //     id: 'fleet',
  //     title: 'Fleet accounts',
  //     body: 'One invoice a month, priority bays, and a named contact for every vehicle.',
  //     points: ['Net 30 billing', 'Service records per vehicle', 'Pickup and return'],
  //     photo: 'bay',
  //     cta: true,
  //   },
  features: [],

  proof: {
    title: 'What customers say',
  },

  shop: {
    title: 'The shop',
    body: 'Domestic, import and hybrid, worked on by technicians who explain what they found in plain English. If a job needs a dealer tool we do not have, we say so instead of guessing.',
    amenitiesTitle: 'While we work on your car',
  },

  gallery: {
    title: 'Inside the shop',
    intro: 'The bays, the equipment and the people who will be working on your car.',
  },

  visit: {
    title: 'Hours and directions',
  },

  faq: {
    title: 'Questions people ask first',
    ask: {
      title: 'Still have a question?',
      body: 'Call and ask the people who will work on your car.',
    },
    items: [
      {
        q: 'How much will it cost?',
        a: 'You get the number before we start. Diagnostics are quoted up front, and no repair begins without your approval.',
      },
      {
        q: 'Do you work on my make?',
        a: 'Domestic, import and hybrid. If a job needs a dealer tool we do not have, we will tell you that instead of guessing.',
      },
      {
        q: 'How long will it take?',
        a: 'Most common repairs go back the same day. Anything longer, we tell you at drop-off, not when you call to ask.',
      },
      {
        q: 'Can I get a ride or a loaner?',
        a: 'Yes. A free local shuttle, courtesy loaners subject to availability, and a night drop if you cannot make our hours.',
      },
      {
        q: 'Is the warranty real?',
        a: 'Yes, on qualifying parts and labor, and it is honored nationwide. Ask for the paperwork before you pay.',
      },
    ],
  },

  blog: {
    title: 'From the shop',
    intro: 'Real jobs from our bays: what the car was doing, what we found and what it took to fix.',
  },

  servicePage: {
    includesTitle: 'What we do',
    signsTitle: 'When to book it',
    questionsTitle: 'Questions people ask',
    storiesTitle: 'Recent jobs',
    othersTitle: 'Other services',
  },

  finalCta: {
    title: 'Get your car booked in.',
    subhead: 'Takes under a minute. Tell us what it is doing and we will tell you what it needs.',
  },

  funnel: {
    trust: ['Written estimate first', 'No work without your approval'],
    steps: [
      {
        kind: 'choice',
        id: 'issue',
        question: 'What is the car doing?',
        answeredByService: true,
        options: [
          { id: 'warning_light', label: 'Warning light' },
          { id: 'brakes', label: 'Brakes' },
          { id: 'noise', label: 'Noise or shake' },
          { id: 'wont_start', label: 'Will not start' },
          { id: 'maintenance', label: 'Maintenance' },
          {
            id: 'other',
            label: 'Other',
            input: { label: 'What is going on? (optional)', placeholder: 'A smell, a leak, a light we did not list…' },
          },
        ],
      },
      {
        kind: 'choice',
        id: 'timing',
        question: 'When do you need it in?',
        options: [
          { id: 'today', label: 'Today' },
          { id: 'this_week', label: 'This week' },
          { id: 'flexible', label: 'No rush' },
        ],
      },
      {
        kind: 'contact',
        id: 'contact',
        question: 'Where do we reach you?',
        help: 'We will call to confirm a time. No work happens without your say-so.',
        // Name and a number are all the shop needs; the car and the details
        // are a thirty-second conversation on the call.
        fields: [
          { id: 'name', label: 'Name', placeholder: 'Your name' },
          { id: 'phone', label: 'Mobile', placeholder: 'Best number to reach you' },
        ],
        submitLabel: 'Request my appointment',
      },
    ],
    // The shop's workflows text as well as call, so consent says both, with
    // the opt-out wording US carriers expect on anything that texts.
    legal:
      'By sending this you agree the shop may call or text you about your vehicle. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.',
    success: {
      title: 'Request received.',
      body: 'We will call shortly to confirm a time. If it is urgent, call the shop and we will get you straight in.',
    },
    ui: {
      backLabel: 'Back',
      closeLabel: 'Close',
      continueLabel: 'Continue',
      submittingLabel: 'Sending…',
      genericError: 'That did not send. Check your connection and try again, or call the shop.',
      backToSiteLabel: 'Back to the site',
    },
  },
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPLIANCE, local service ads. Read before editing copy.
   ────────────────────────────────────────────────────────────────────────────
   A shop's ads get pulled for the same short list of things every time:
     • a superlative nobody can substantiate, "cheapest in town"
     • a bare guarantee. The warranty is a real, checkable claim, so state its
       months and miles instead of promising an outcome.
     • a price or discount with no terms and no end date
     • the word free attached to something that is not actually free
     • manufactured urgency: countdowns, "today only", invented scarcity
   The specific true thing converts better than the superlative and it survives
   review. NEVER use these words in any funnel or ad copy:
   ════════════════════════════════════════════════════════════════════════════ */

export const BANNED_WORDS = [
  'guaranteed',
  'cheapest',
  'lowest price',
  'best in town',
  'no risk',
  'miracle',
  'instant',
] as const

/** Returns any banned words found in `text` (case-insensitive). Empty = clean. */
export function scanForBannedWords(text: string): string[] {
  return BANNED_WORDS.filter((w) => new RegExp(`\\b${w}\\b`, 'i').test(text))
}

/** Every string a visitor will read — used by the compliance test. */
export function landingCopy(spec: LandingSpec): string {
  const parts: string[] = [
    spec.brandName,
    spec.ctaLabel,
    spec.nav.servicesLabel,
    spec.nav.allServicesLabel,
    ...spec.nav.links.map((l) => l.label),
    spec.nav.help.title,
    spec.nav.help.body,
    spec.seo.description,
    spec.hero.headline,
    spec.hero.subhead,
    spec.promise.title,
    spec.promise.intro,
    spec.promise.approval,
    ...spec.promise.steps.flatMap((s) => [s.title, s.body]),
    spec.services.title,
    spec.services.footnote,
    ...spec.features.flatMap((f) => [f.title, f.body, ...(f.points ?? [])]),
    spec.proof.title,
    spec.shop.title,
    spec.shop.body,
    spec.shop.amenitiesTitle,
    spec.gallery.title,
    spec.gallery.intro,
    spec.visit.title,
    spec.faq.title,
    spec.faq.ask.title,
    spec.faq.ask.body,
    ...spec.faq.items.flatMap((f) => [f.q, f.a]),
    ...Object.values(spec.servicePage),
    spec.finalCta.title,
    spec.finalCta.subhead,
    ...(spec.funnel.trust ?? []),
    spec.funnel.legal ?? '',
    spec.funnel.success.title,
    spec.funnel.success.body,
    ...Object.values(spec.funnel.ui),
  ]
  for (const step of spec.funnel.steps) {
    parts.push(step.question, step.help ?? '')
    if (step.kind === 'choice')
      for (const o of step.options) parts.push(o.label, o.sublabel ?? '', o.input?.label ?? '', o.input?.placeholder ?? '')
    else
      parts.push(step.submitLabel, ...step.fields.flatMap((field) => [field.label, field.placeholder]))
  }
  return parts.join(' ')
}
