import { business } from '@/config/business'
import { OG_ALT, OG_SIZE, OG_TYPE, ogCard } from '@/lib/og'

/**
 * The share card for every page that has none of its own: the shop's name,
 * what it is and where. A service's page has its own (services/[slug]).
 */
export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = OG_TYPE

export default function Image() {
  return ogCard({
    kicker: business.category,
    title: business.name,
    subtitle: `in ${business.address.city}, ${business.address.state}`,
  })
}
