import { Landing } from '@/components/Landing'
import { landingSpec } from '@/config/funnel'

/**
 * The client site is one page. Its facts come from `src/config/business.ts` and
 * its voice from `src/config/funnel.ts`, so this file never changes per client.
 */

export default function Home() {
  return <Landing spec={landingSpec} />
}
