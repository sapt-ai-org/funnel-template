/**
 * ════════════════════════════════════════════════════════════════════════════
 *  THE VOICE FOR EACH SERVICE — what a service's own page says by default.
 * ────────────────────────────────────────────────────────────────────────────
 *  A service's page is where a search for "brakes near me" lands, so it has to
 *  answer that one visitor: what the shop does, when it is time to book, and
 *  the questions they have about this job. The shop's own words win: a
 *  summary, description or question published in Sapt replaces what is here.
 *  Until then, these keep every service page complete from day one.
 *
 *  Keyed by slug (`slugify` of the name on the Google profile). A service not
 *  listed here still gets a page, from `genericCopy`. Keep every line true of
 *  any honest independent shop: no prices, no times, no promises a shop
 *  cannot keep. The compliance rules at the bottom of funnel.ts apply here.
 *
 *  Questions: five or more per service, the ones people ask before booking
 *  this job, each answered in its first sentence (answer engines quote it).
 *  No question appears on two services: the same FAQ on two pages competes
 *  with itself in search.
 * ════════════════════════════════════════════════════════════════════════════
 */

import { business } from '@/config/business'
import type { Faq } from '@/config/funnel'

export interface ServiceCopy {
  /** One line under the name: what the visitor gets. */
  summary: string
  /** What the shop does on this job, in the order it does it. */
  includes: string[]
  /** What a driver notices when it is time. The words they search with. */
  signs: string[]
  faqs: Faq[]
  /**
   * The booking's `issue` choice this service answers (an option id on the
   * funnel's first step and the CRM's `issue` field), so a booking started
   * from this page lands already triaged. Leave it out when none fits.
   */
  issue?: string
}

const CATALOG: Record<string, ServiceCopy> = {
  'brakes-and-rotors': {
    summary: 'Pads, rotors, calipers and fluid, measured and priced before any work starts.',
    includes: [
      'Measure pad and rotor wear at every wheel',
      'Check calipers, hoses and brake fluid',
      'Road test before and after the work',
      'A written estimate, parts and labor itemized',
    ],
    signs: [
      'Squealing or grinding when you stop',
      'A pedal that feels soft or sinks',
      'The car pulls to one side under braking',
      'The brake warning light is on',
    ],
    faqs: [
      {
        q: 'How much does a brake job cost?',
        a: 'It depends on your car and on what it needs: pads alone, or pads with rotors, calipers or fluid. We measure first, and you get a written estimate with parts and labor itemized before any work starts.',
      },
      {
        q: 'Do I need new rotors every time?',
        a: 'No. We measure them against the manufacturer’s minimum, and if they are still in spec we say so and leave them.',
      },
      {
        q: 'Is it safe to drive with squealing brakes?',
        a: 'For a short while, usually. The squeal is the wear indicator saying the pads are low. Grinding means metal on metal, so book it in soon.',
      },
      {
        q: 'Why does my brake pedal feel soft?',
        a: 'Usually air or moisture in the brake fluid, a leak, or a worn master cylinder. A soft or sinking pedal is a safety problem, so have it checked before you drive far.',
      },
      {
        q: 'How long do brake pads last?',
        a: 'It varies with the car, the pads and how you drive. Stop-and-go traffic and heavy loads wear them faster. We measure what is left and tell you roughly how long you have.',
      },
      {
        q: 'How often should brake fluid be changed?',
        a: 'Follow your owner’s manual. Brake fluid absorbs moisture over time, which lowers its boiling point, so it is worth testing at every brake service.',
      },
    ],
    issue: 'brakes',
  },
  'check-engine-diagnostics': {
    summary: 'We find why the light is on and test the cause before anything is replaced.',
    includes: [
      'Read the stored and pending codes',
      'Test the circuit or part the code points to',
      'Check for known issues and updates for your model',
      'Explain what we found, and what can safely wait',
    ],
    signs: [
      'The check engine light is on or flashing',
      'Rough idle, stalling or hesitation',
      'Worse fuel economy than usual',
      'A failed emissions test',
    ],
    faqs: [
      {
        q: 'Is it safe to drive with the check engine light on?',
        a: 'A steady light usually means you can drive to a shop, gently. A flashing light, a temperature warning or a loss of power means pull over and call.',
      },
      {
        q: 'Can you not just read the code?',
        a: 'A code says which system reported a fault, not which part failed. Testing finds the cause, so you do not pay for parts you did not need.',
      },
      {
        q: 'What if the light is flashing?',
        a: 'A flashing light usually means a misfire, which can damage the catalytic converter. Drive gently and call us before you go far.',
      },
      {
        q: 'How much does a check engine diagnosis cost?',
        a: 'We tell you the cost of the diagnosis before we start. Any repair it turns up comes as a separate written estimate, and nothing is fixed until you approve it.',
      },
      {
        q: 'Can a loose gas cap turn the light on?',
        a: 'Yes. A loose or worn cap can set an evaporative leak code. Tighten it until it clicks, and if the light is still on after a few drives, book it in.',
      },
      {
        q: 'Will clearing the code fix it?',
        a: 'No. Clearing a code only turns the light off. If the fault is still there the light comes back, and many emissions tests will not pass a car whose codes were just cleared.',
      },
    ],
    issue: 'warning_light',
  },
  'oil-and-filter': {
    summary: 'The right oil for your engine, a new filter, and a look over the car while it is up.',
    includes: [
      'Oil to your manufacturer’s specification',
      'A new oil filter',
      'Fluids topped off and a check for leaks',
      'Tire pressures set, and a note of anything worth watching',
    ],
    signs: [
      'The oil change reminder is on',
      'The sticker on the windshield says it is due',
      'Oil looks dark or low on the dipstick',
      'A long trip is coming up',
    ],
    faqs: [
      {
        q: 'How often should I change my oil?',
        a: 'Follow your owner’s manual or the car’s own reminder. Modern oils often go well past the old 3,000-mile rule.',
      },
      {
        q: 'Do I need synthetic oil?',
        a: 'Use whatever your engine calls for. Many newer engines require synthetic, and we use the grade and specification in your owner’s manual.',
      },
      {
        q: 'Will an oil change at an independent shop void my warranty?',
        a: 'No. Federal law lets you have maintenance done anywhere without voiding your factory warranty, as long as it is done on schedule with parts and fluids that meet spec. Keep your receipts.',
      },
      {
        q: 'How long does an oil change take?',
        a: 'Ask when you book and we will tell you. If we spot anything else, we tell you before doing anything about it.',
      },
      {
        q: 'What happens if I skip oil changes?',
        a: 'Old oil stops protecting the engine, and sludge and wear build up inside it. An engine repair from neglected oil costs far more than the changes would have.',
      },
      {
        q: 'Why is my oil light on?',
        a: 'A red oil pressure light means stop the engine as soon as it is safe, because it can mean low oil or low pressure. A maintenance reminder is different and only means a change is due.',
      },
    ],
    issue: 'maintenance',
  },
  'suspension-and-steering': {
    summary: 'Clunks, wander and uneven tire wear, traced to the part that is worn instead of guessed at.',
    includes: [
      'Inspect shocks, struts, springs and bushings',
      'Check ball joints, tie rods and wheel bearings',
      'Test drive to reproduce the noise or the pull',
      'Check the alignment after any steering repair',
    ],
    signs: [
      'A clunk over bumps',
      'The car wanders or pulls',
      'Bouncing after dips in the road',
      'Tires wearing on one edge',
    ],
    faqs: [
      {
        q: 'How do I know if my shocks or struts are worn?',
        a: 'Bouncing after bumps, the nose diving when you brake, and fluid leaking down the shock body are the usual signs. We check them on the lift and on a road test.',
      },
      {
        q: 'Is a clunking noise over bumps dangerous?',
        a: 'It can be. A clunk often points to a worn ball joint, link or bushing, and a failed ball joint can affect the steering, so have it checked soon rather than waiting for it to get worse.',
      },
      {
        q: 'Why does my car pull to one side?',
        a: 'Alignment, uneven tire pressure, a worn steering part or a sticking brake can all cause it. We find which one before adjusting anything.',
      },
      {
        q: 'Do struts have to be replaced in pairs?',
        a: 'Usually, yes, on the same axle, so both sides respond the same way. If only one needs it, we tell you and explain why.',
      },
      {
        q: 'Why is my steering wheel hard to turn?',
        a: 'Low power steering fluid, a failing pump or a fault in electric power steering are the usual causes. Heavy steering makes the car harder to control, so book it in soon.',
      },
      {
        q: 'Do I need an alignment after suspension work?',
        a: 'Often, yes. Replacing steering or suspension parts can change the angles, so we check before you leave.',
      },
    ],
    issue: 'noise',
  },
  'tires-and-alignment': {
    summary: 'Tires fitted and balanced, and the alignment set so they wear evenly and the car drives straight.',
    includes: [
      'Mount and balance new tires',
      'Measure the alignment and set it to spec',
      'Rotate the tires and set the pressures',
      'Check the tread for wear and damage',
    ],
    signs: [
      'Tread worn down near the wear bars',
      'The steering wheel sits off center',
      'Vibration at highway speed',
      'The car pulls to one side',
    ],
    faqs: [
      {
        q: 'When do I need new tires?',
        a: 'When the tread reaches the wear bars, or sooner if you see cracks, bulges or cords. A quick check is the penny test: if you can see the top of Lincoln’s head, the tread is low.',
      },
      {
        q: 'How do I know if I need an alignment?',
        a: 'An off-center steering wheel, a pull, or tires wearing on one edge are the usual signs. We measure it instead of guessing.',
      },
      {
        q: 'Why does my car shake at highway speed?',
        a: 'An out-of-balance wheel is the most common cause. A bent wheel, a worn tire or a worn suspension part can do it too, so we check before we balance.',
      },
      {
        q: 'Can I replace just two tires?',
        a: 'Often, yes, if they match the other two in size and type, and new tires usually go on the rear for stability. Some all-wheel-drive cars need all four replaced together, so we check what yours requires.',
      },
      {
        q: 'Can a tire with a nail in it be repaired?',
        a: 'Often, if the hole is small and in the tread. A puncture in the sidewall or near the shoulder cannot be repaired safely, and the tire has to be replaced.',
      },
      {
        q: 'How often should my tires be rotated?',
        a: 'Follow your owner’s manual. Rotating on schedule evens out the wear, so all four tires last longer.',
      },
    ],
  },
  'batteries-and-charging': {
    summary: 'Battery, alternator and starter tested, so you replace the part that failed.',
    includes: [
      'Test the battery under load',
      'Check the alternator’s charging output',
      'Test the starter and the cables',
      'Clean the terminals, and fit a new battery if it needs one',
    ],
    signs: [
      'Slow cranking on a cold morning',
      'The battery light is on',
      'Headlights dim at idle',
      'Needing a jump start',
    ],
    faqs: [
      {
        q: 'Is it the battery or the alternator?',
        a: 'Testing both tells us. A new battery on a failing alternator goes flat again, so we check the whole system.',
      },
      {
        q: 'How long does a car battery last?',
        a: 'Usually several years, and less in extreme heat or cold. A load test shows how much life is left before it leaves you stranded.',
      },
      {
        q: 'Why does my car click but not start?',
        a: 'A single click or rapid clicking usually means a weak battery or a poor connection. If the battery tests fine, the starter or its wiring is next.',
      },
      {
        q: 'What does the battery light mean?',
        a: 'It usually means the charging system is not keeping up, often because of the alternator or its belt. The car is running on the battery alone, so get it checked before it stops.',
      },
      {
        q: 'Can a battery go flat from the car sitting?',
        a: 'Yes. A car left for weeks slowly drains its battery, and a battery that goes fully flat can lose capacity for good. A battery maintainer helps if the car sits a lot.',
      },
      {
        q: 'Does anything need resetting after a new battery?',
        a: 'Some cars need the new battery registered with the car’s computer, or the windows and radio reset. We take care of it as part of the job.',
      },
    ],
  },
  'heating-and-ac': {
    summary: 'A/C that blows warm and heat that will not come on, diagnosed and fixed.',
    includes: [
      'Check system pressures and look for leaks',
      'Test the compressor, fans and controls',
      'Recharge with the correct refrigerant',
      'Check the heater core, blend doors and coolant flow',
    ],
    signs: [
      'The A/C blows warm, or cold only some of the time',
      'No heat, or heat on one side only',
      'A musty smell from the vents',
      'Fog on the windshield that will not clear',
    ],
    faqs: [
      {
        q: 'Why does my car A/C blow warm air?',
        a: 'Low refrigerant from a leak, a failing compressor or clutch, a bad fan or an electrical fault. We test the system to find which one before replacing anything.',
      },
      {
        q: 'Can you just recharge it?',
        a: 'A system that is low has a leak somewhere. We find it first, so the recharge lasts.',
      },
      {
        q: 'Why does my heater blow cold air?',
        a: 'Low coolant, a stuck thermostat, a clogged heater core or a blend door that will not move. Low coolant can also put the engine at risk of overheating, so have it checked soon.',
      },
      {
        q: 'What causes a musty smell from the vents?',
        a: 'Usually mold or bacteria on the evaporator, or a dirty cabin air filter. A new filter and a cleaning treatment often clear it.',
      },
      {
        q: 'How often should the A/C be serviced?',
        a: 'There is no set interval. Have it checked when it stops cooling as well as it used to, because a small leak caught early costs less to fix.',
      },
      {
        q: 'Should I run the A/C in winter?',
        a: 'Yes, now and then. It keeps the seals lubricated, and because the A/C dries the air, it clears a fogged windshield faster.',
      },
    ],
  },
  'pre-purchase-inspection': {
    summary: 'A used car checked top to bottom before you buy it, so you know what you are paying for.',
    includes: [
      'Road test, and a look underneath on the lift',
      'Engine, transmission, brakes, suspension and tires',
      'A scan for stored codes, and for codes cleared recently',
      'Leaks, rust and signs of past accident repair',
      'A written report you can take back to the seller',
    ],
    signs: [
      'You are about to buy a used car',
      'It is a private sale with no warranty',
      'The seller says it runs perfectly',
      'The price looks too good',
    ],
    faqs: [
      {
        q: 'What does a pre-purchase inspection include?',
        a: 'A road test, a look underneath on the lift, and a check of the engine, transmission, brakes, suspension, tires and fluids, with a scan for codes. You get a written report of what we found.',
      },
      {
        q: 'Can you inspect a car that is not mine yet?',
        a: 'Yes. Bring it in with the seller’s permission, or have the seller drop it off. The report is yours either way.',
      },
      {
        q: 'Is an inspection worth it on a car from a dealer?',
        a: 'Yes. The dealer’s own inspection is done by the people selling the car. A check by someone with no stake in the sale tells you what the listing does not.',
      },
      {
        q: 'Can you tell if the car has been in an accident?',
        a: 'We look for the signs: uneven panel gaps, overspray, mismatched or replaced parts and frame repair. Pull a vehicle history report too, since not every repair leaves a mark.',
      },
      {
        q: 'What if it needs work?',
        a: 'You get it in writing with what each repair would cost, so you can negotiate or walk away.',
      },
      {
        q: 'Will you tell me whether to buy it?',
        a: 'We tell you what we found and what it would take to fix. Whether the car is worth the price is your call, and the report gives you what you need to make it.',
      },
    ],
  },
}

/**
 * A service name in the middle of a sentence: "Diesel repair" reads as
 * "diesel repair", while "BMW service" and "A/C repair" keep their capitals.
 */
function inSentence(name: string): string {
  return /^[A-Z][a-z]/.test(name) ? name[0].toLowerCase() + name.slice(1) : name
}

/**
 * A service with no entry above still gets a page that is true of any shop.
 * Its questions carry the service's name, so no two of these pages share one.
 */
function genericCopy(name: string): ServiceCopy {
  const service = inSentence(name)
  const warranty = business.warranty
    ? `${business.warranty.months}-month / ${business.warranty.miles.toLocaleString('en-US')}-mile`
    : null
  return {
    summary: `${name} at ${business.name}, with a written estimate before any work starts.`,
    includes: [
      'Inspect and test before we recommend anything',
      'A written estimate, parts and labor itemized',
      'No work without your approval',
      ...(warranty ? [`${warranty} warranty on qualifying repairs`] : []),
    ],
    signs: [],
    faqs: [
      {
        q: `How much does ${service} cost?`,
        a: 'It depends on your vehicle and on what it needs. We inspect it first, and you get a written estimate with parts and labor itemized before any work starts.',
      },
      {
        q: `How long does ${service} take?`,
        a: 'It depends on the job and on parts. We give you a time when we call with the estimate, and tell you straight away if anything changes.',
      },
      {
        q: `How do I know if my car needs ${service}?`,
        a: 'Tell us what the car is doing when you book. We check it and tell you whether it needs the work, and what can safely wait.',
      },
      {
        q: `Do you start on ${service} before I approve it?`,
        a: 'No. We call with the estimate first, and the work starts only when you say yes.',
      },
      {
        q: `Is there a warranty on ${service}?`,
        a: warranty
          ? `Qualifying repairs carry a ${warranty} warranty on parts and labor. Ask for the terms in writing with your invoice.`
          : 'Ask when you book, and get the warranty terms in writing before the work starts.',
      },
      {
        q: `Will ${service} at an independent shop affect my factory warranty?`,
        a: 'No. Federal law lets you have your car serviced or repaired anywhere without voiding the factory warranty, as long as the work and parts meet the manufacturer’s specifications.',
      },
    ],
  }
}

/** What a service's page says when the shop has not written its own. */
export function serviceCopy(slug: string, name: string): ServiceCopy {
  return CATALOG[slug] ?? genericCopy(name)
}

/** The services with copy written above, by slug. */
export const CATALOG_SLUGS = Object.keys(CATALOG)

/** Every default line, the generic page's included, for the compliance test. */
export function serviceCopyText(): string {
  return [...Object.values(CATALOG), genericCopy('Example service')]
    .flatMap((c) => [c.summary, ...c.includes, ...c.signs, ...c.faqs.flatMap((f) => [f.q, f.a])])
    .join(' ')
}
