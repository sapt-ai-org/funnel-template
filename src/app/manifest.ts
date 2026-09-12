import type { MetadataRoute } from 'next'
import { business } from '@/config/business'
import { design } from '@/config/design'
import { landingSpec } from '@/config/funnel'

/**
 * What a phone uses when someone saves the site to their home screen: the
 * shop's name (short enough to sit under an icon), its colours and icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  const words = business.name.split(/\s+/)
  // Under an icon there is room for about twelve characters.
  const shortName = business.name.length <= 12 ? business.name : words.slice(0, words[0].length > 8 ? 1 : 2).join(' ')
  return {
    name: business.name,
    short_name: shortName,
    description: landingSpec.seo.description,
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: design.colors.paper,
    theme_color: design.colors.paper,
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
