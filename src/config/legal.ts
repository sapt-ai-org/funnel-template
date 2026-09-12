/**
 * The privacy policy and terms, written from the shop's own facts.
 *
 * Carriers review a shop's website before they approve its texting (A2P
 * 10DLC): the form has to say what texts to expect, how to stop them, and link
 * to a privacy policy that promises the number is never shared for marketing.
 * Google and Meta ask for the same policy before they run ads to the site. So
 * these pages are part of the launch, not an afterthought.
 *
 * Plain language on purpose. It is standard template wording, not legal
 * advice: a shop with unusual practices should have its own lawyer read it.
 * Change `LEGAL_UPDATED` whenever the wording changes.
 */

import { business } from '@/config/business'

export const LEGAL_UPDATED = 'September 11, 2026'

/**
 * ════════════════════════════════════════════════════════════════════════════
 *  A2P VERIFICATION MODE — the one switch that matters for getting approved.
 * ────────────────────────────────────────────────────────────────────────────
 *  US carriers do not accept implied consent. A number has to be given with an
 *  explicit, unticked box that says who is texting, what about, how often,
 *  what it costs, that it is not a condition of buying anything, and how to
 *  stop. That box is what a reviewer screenshots, so it is ON by default and
 *  every shop ships ready to submit.
 *
 *  `true`   the booking form shows the tick, and will not submit without it.
 *           Use this to register the shop's campaign.
 *  `false`  the tick goes away and the same disclosure stays as one line under
 *           the button. Shorter, and the form is built to be short — but only
 *           switch to it once the campaign is approved.
 *
 *  Either way the privacy and terms pages carry the full wording, and the form
 *  links to both. Nothing else on the site changes.
 * ════════════════════════════════════════════════════════════════════════════
 */
export const SMS_CONSENT_CHECKBOX = true

/**
 * The words beside the tick: everything a carrier looks for, in one sentence.
 * The shop's name comes from business.ts, so it is never a stale string typed
 * into the voice file.
 */
export function smsConsentLabel(): string {
  return `I agree to receive calls and texts from ${business.name} about my appointment and my vehicle. Message frequency varies. Message and data rates may apply. Consent is not a condition of any purchase. Reply STOP to opt out, HELP for help.`
}

/**
 * The sentence carriers scan for, in the words they scan for. Kept in one
 * place so the privacy page and the terms cannot drift from each other.
 */
export const NO_MOBILE_SHARING =
  'No mobile information will be shared with third parties or affiliates for marketing or promotional purposes.'

/** Every keyword the shop's messaging honours, written out wherever opting out is explained. */
export const STOP_KEYWORDS = 'STOP, UNSUBSCRIBE, CANCEL, END or QUIT'

export interface LegalSection {
  heading: string
  body: string[]
  list?: string[]
}

export interface LegalDocument {
  title: string
  intro: string
  sections: LegalSection[]
}

const STATES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado',
  CT: 'Connecticut', DE: 'Delaware', DC: 'the District of Columbia', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky',
  LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota',
  MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota',
  OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island',
  SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
}

const stateName = () => STATES[business.address.state.toUpperCase()] ?? business.address.state

function contactLines(): string[] {
  const a = business.address
  return [
    business.name,
    `${a.street}, ${a.city}, ${a.state} ${a.postalCode}`,
    `Phone: ${business.phone}`,
    ...(business.email ? [`Email: ${business.email}`] : []),
  ]
}

/** How consent is given, in the words the page uses, whichever mode the form is in. */
const consentMethod = SMS_CONSENT_CHECKBOX
  ? 'tick the consent box on our booking form'
  : 'give us your number and agree to be contacted'

export function privacyPolicy(): LegalDocument {
  const name = business.name
  return {
    title: 'Privacy Policy',
    intro: `How ${name} collects, uses and protects your information, including when we text you.`,
    sections: [
      {
        heading: 'What we collect',
        body: ['We only collect what we need to look after you and your vehicle:'],
        list: [
          'What you give us when you book, call, text or email: your name, phone number, email, your vehicle and what it is doing, and when you would like to come in.',
          'What you tell us after a visit, such as a star rating and any comments.',
          'How you use this website: the pages you visit, your device and browser, the site or ad that brought you here, and whether you booked. We collect this with our own website analytics and cookies.',
        ],
      },
      {
        heading: 'How we use it',
        list: [
          'To answer you, book your appointment and work on your vehicle.',
          'To call or text you about your appointment, your vehicle, estimates and pickup.',
          'To ask how we did after a visit.',
          'To understand which pages and ads bring customers in, so we can improve them.',
        ],
        body: [],
      },
      {
        heading: 'Text messages',
        body: [
          `When you ${consentMethod}, ${name} may text you about your appointment and your vehicle. Message frequency varies. Message and data rates may apply. Consent is not a condition of any purchase. Reply ${STOP_KEYWORDS} to opt out at any time, or HELP for help.`,
          // The clause a carrier's reviewer looks for, kept word for word.
          `${NO_MOBILE_SHARING} We do not sell, rent, lease or otherwise share your phone number. Text messaging opt-in data and consent are never shared with anyone except the companies that deliver our messages for us.`,
        ],
      },
      {
        heading: 'Who we share it with',
        body: [
          'We do not sell your personal information. We share it only with:',
        ],
        list: [
          'Companies that run our booking, messaging and website for us, which may use it only to provide those services to us.',
          'Advertising platforms such as Google and Meta, which receive limited information (for example that a visit led to a booking, and a scrambled, hashed form of your email or phone) so we can measure our ads. They do not receive your texts.',
          'Anyone the law requires us to share it with.',
          `${NO_MOBILE_SHARING}`,
        ],
      },
      {
        heading: 'Cookies',
        body: [
          'This site uses cookies and similar technology to count visits and measure which ads work. You can block or delete cookies in your browser settings; the site still works without them.',
        ],
      },
      {
        heading: 'Your choices',
        list: [
          `Reply ${STOP_KEYWORDS} to any text to stop receiving them.`,
          'Ask us what information we hold about you, or ask us to correct or delete it, using the contact details below.',
        ],
        body: [],
      },
      {
        heading: 'How long we keep it',
        body: [
          'We keep booking and service records for as long as we need them to look after your vehicle and to meet legal, tax and warranty obligations, then we delete them.',
        ],
      },
      {
        heading: 'Children',
        body: ['This site is not meant for children under 13, and we do not knowingly collect their information.'],
      },
      {
        heading: 'Changes and contact',
        body: [
          'If we change this policy we will update the date at the top of this page. Questions about your information go to:',
        ],
        list: contactLines(),
      },
    ],
  }
}

export function termsOfService(): LegalDocument {
  const name = business.name
  return {
    title: 'Terms',
    intro: `The terms for using the ${name} website and for receiving texts from us.`,
    sections: [
      {
        heading: 'Using this website',
        body: [
          'The information on this site is general. An appointment request is not confirmed until we confirm it with you. Prices, availability and hours can change.',
          'We give you an estimate before any work starts, and no work begins without your approval. Repairs are covered by the warranty terms we give you at the time of service.',
        ],
      },
      {
        heading: 'Text messaging terms',
        body: [
          `${name} sends texts about your appointment and your vehicle: confirmations, estimates, updates, pickup notices, replies to your questions, and a request for a review after a visit.`,
          `You agree to receive these texts when you ${consentMethod}, or when you text us first.`,
        ],
        list: [
          'Message frequency varies with your appointments and questions.',
          'Message and data rates may apply. We do not charge a fee for our messages, but your carrier may.',
          'Consent to receive texts is not a condition of any purchase.',
          `Reply ${STOP_KEYWORDS} to cancel. You will get one message confirming you have been unsubscribed, and no more after that.`,
          `Reply HELP for help, or call us at ${business.phone}.`,
          'Carriers are not liable for delayed or undelivered messages.',
          `${NO_MOBILE_SHARING} Your number and consent are handled as described in our Privacy Policy.`,
        ],
      },
      {
        heading: 'Reviews and feedback',
        body: [
          'Feedback you send through this site goes to the shop. Reviews you leave on Google are governed by Google’s own terms.',
        ],
      },
      {
        heading: 'Limits',
        body: [
          `This site is provided as is. To the extent the law allows, ${name} is not liable for losses caused by using the site or by its being unavailable. Nothing here limits any right you have under consumer protection law.`,
          `These terms are governed by the laws of ${stateName()}.`,
        ],
      },
      {
        heading: 'Contact',
        body: ['Questions about these terms go to:'],
        list: contactLines(),
      },
    ],
  }
}

/**
 * What the site does for people using assistive technology, and how to get
 * help. Every claim here is true of the template as built; if a shop adds
 * something that breaks one (an unlabelled field, a video without captions),
 * fix the page or change this list.
 */
export function accessibilityStatement(): LegalDocument {
  const name = business.name
  return {
    title: 'Accessibility',
    intro: `${name} wants everyone to be able to find us, book and get in touch, whatever device or assistive technology they use.`,
    sections: [
      {
        heading: 'Our goal',
        body: [
          'We aim for this website to meet the Web Content Accessibility Guidelines (WCAG) 2.1 at level AA, and we keep working on it as the site changes.',
        ],
      },
      {
        heading: 'What we have done',
        body: [],
        list: [
          'Every page is marked up with a header, a main area and a footer, so a screen reader can jump straight to the content.',
          'Every field in the booking form has its own label, so a screen reader announces each one.',
          'Every photo has a text description.',
          'Questions and answers use standard controls that work with a keyboard, and without JavaScript.',
          'Anything that moves on the page stays still for visitors whose device asks for reduced motion.',
          'The site is built for phones first and works at any screen size.',
        ],
      },
      {
        heading: 'Other sites we link to',
        body: [
          'Maps, directions and reviews on Google are provided by Google, and their accessibility is Google’s.',
        ],
      },
      {
        heading: 'If something does not work for you',
        body: [
          `Call us at ${business.phone} and we will book you in over the phone. Please also tell us which page gave you trouble and what happened, so we can fix it.`,
        ],
        list: contactLines(),
      },
    ],
  }
}
