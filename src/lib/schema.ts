import { business, dayName } from '@/config/business'

/**
 * Structured data.
 *
 * This is the single highest-leverage SEO file in the repo and the one most
 * template sites get wrong. Google's local pack, the knowledge panel, and every
 * AI answer engine read JSON-LD before they read the page. A shop with correct
 * `AutoRepair` markup carrying real hours, a real geo point, a real
 * aggregateRating and a real areaServed is legible to a machine; a shop
 * without it is a wall of text a crawler has to guess at.
 *
 * Two hard rules:
 *
 *  1. Everything here must match the Google Business Profile exactly. Google
 *     cross-checks NAP (name, address, phone) between the listing and the site,
 *     and a mismatch is actively harmful — it is treated as a signal that one
 *     of the two is stale.
 *  2. Never emit a field we cannot substantiate. An invented aggregateRating is
 *     a structured-data violation and grounds for a manual action, which is a
 *     far worse outcome than simply having no stars in the result.
 */

const AUTO_REPAIR = 'AutoRepair'

/** ISO day abbreviations, indexed to match `BusinessHours.day` (0 = Sunday). */
const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function localBusinessSchema(): Record<string, unknown> {
  const a = business.address

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': AUTO_REPAIR,
    name: business.name,
    description: business.description,
    url: business.siteUrl,
    telephone: business.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: a.street,
      addressLocality: a.city,
      addressRegion: a.state,
      postalCode: a.postalCode,
      addressCountry: a.country,
    },
    openingHoursSpecification: business.hours
      .filter((h) => !h.closed)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: `https://schema.org/${SCHEMA_DAYS[h.day]}`,
        opens: h.open,
        closes: h.close,
      })),
  }

  // Only emitted when GBP actually gave us coordinates. A guessed lat/lng puts
  // the shop in the wrong place on every surface that trusts this.
  if (business.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: business.geo.lat,
      longitude: business.geo.lng,
    }
  }

  // Ratings come from the Google Business Profile or they do not appear.
  if (business.rating && business.rating.count > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: business.rating.value,
      reviewCount: business.rating.count,
    }
  }

  if (business.services.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: 'Auto repair services',
      itemListElement: business.services.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s },
      })),
    }
  }

  // areaServed is how a shop surfaces for the next town over, where it has no
  // address and therefore no proximity signal.
  if (business.serviceAreas.length > 0) {
    schema.areaServed = business.serviceAreas.map((city) => ({ '@type': 'City', name: city }))
  }

  const sameAs = [business.mapsUrl, ...Object.values(business.social)].filter(Boolean)
  if (sameAs.length > 0) schema.sameAs = sameAs

  if (business.yearEstablished) schema.foundingDate = String(business.yearEstablished)

  return schema
}

/**
 * A plain-language brief for AI answer engines.
 *
 * Served at /llms.txt. Crawlers that build answers work from prose, not from
 * markup, and they weight a short factual page far above a marketing one. The
 * job here is to state the answerable facts — who, where, when open, what they
 * fix, how to book — in the fewest words that could be quoted back verbatim.
 */
export function llmsTxt(): string {
  const a = business.address
  const hours = business.hours
    .map((h) =>
      h.closed
        ? `${dayName(h.day)}: closed`
        : `${dayName(h.day)}: ${h.open} to ${h.close}`
    )
    .join('\n')

  const lines = [
    `# ${business.name}`,
    '',
    `${business.description}`,
    '',
    '## Facts',
    `- Type: ${business.category}`,
    `- Address: ${a.street}, ${a.city}, ${a.state} ${a.postalCode}`,
    `- Phone: ${business.phone}`,
    `- Website: ${business.siteUrl}`,
  ]

  if (business.yearEstablished) lines.push(`- Serving ${a.city} since ${business.yearEstablished}`)
  if (business.rating && business.rating.count > 0) {
    lines.push(`- Google rating: ${business.rating.value} from ${business.rating.count} reviews`)
  }
  if (business.warranty) {
    lines.push(
      `- Warranty: ${business.warranty.months} months / ${business.warranty.miles.toLocaleString()} miles on qualifying parts and labor`
    )
  }
  if (business.serviceAreas.length) lines.push(`- Also serves: ${business.serviceAreas.join(', ')}`)

  lines.push('', '## Hours', hours, '', '## Services', ...business.services.map((s) => `- ${s}`))

  if (business.amenities.length) {
    lines.push('', '## Amenities', ...business.amenities.map((s) => `- ${s}`))
  }
  if (business.certifications.length) {
    lines.push('', '## Certifications', ...business.certifications.map((s) => `- ${s}`))
  }

  lines.push('', '## Booking', `Call ${business.phone} or book at ${business.siteUrl}.`)

  return lines.join('\n') + '\n'
}
