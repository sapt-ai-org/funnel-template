import { landingSpec } from '@/config/funnel'
import { Landing as AuroraLanding } from '@/templates/aurora/Landing'
import { Landing as MonoLanding } from '@/templates/mono/Landing'

/**
 * The whole client site is one page: a perspective.co-style funnel landing.
 * All content lives in `src/config/funnel.ts` — this file never changes per client.
 */

export default function Home() {
  const Landing = landingSpec.template === 'mono' ? MonoLanding : AuroraLanding
  return <Landing spec={landingSpec} />
}
