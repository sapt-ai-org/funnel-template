import { business, isTemplate } from '@/config/business'
import { logoBox } from '@/config/logo-size'
import { resolveBadge } from '@/config/trust'
import { TrustLoop, type LoopBadge } from '../TrustLoop'

/**
 * Who else vouches for the shop, straight under the first screen: the
 * programs' own marks moving past in one endless row, no words beside them.
 * A customer recognises the ASE seal or the AAA oval before reading anything,
 * and a row of marks says "checked by others" at a glance.
 *
 * The marks are resolved here, on the server (catalog defaults, the shop's
 * overrides, BBB's rule that its seal must link to the shop's profile) and
 * sized optically; the loop itself only moves them.
 */
export function TrustBar() {
  if (business.badges.length === 0) return null

  const badges: LoopBadge[] = business.badges.map((badge) => {
    const b = resolveBadge(badge, { template: isTemplate() })
    return {
      label: b.label,
      kind: b.kind,
      href: b.url,
      logo: b.logo ? { src: b.logo.src, ...logoBox(b.logo.aspect) } : undefined,
    }
  })

  return (
    <div className="border-y border-border bg-surface py-6 sm:py-8">
      <TrustLoop badges={badges} ariaLabel="Certifications and memberships" />
    </div>
  )
}
