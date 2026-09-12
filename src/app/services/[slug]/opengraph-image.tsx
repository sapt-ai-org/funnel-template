import { business } from '@/config/business'
import { getServices } from '@/lib/cms'
import { OG_ALT, OG_SIZE, OG_TYPE, ogCard } from '@/lib/og'

/** A service's share card: the service's name, on the shop's card. */
export const alt = OG_ALT
export const size = OG_SIZE
export const contentType = OG_TYPE

// Built with the site for every service, like the page; a later one on its first request.
export const revalidate = 300
export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }))
}

export default async function Image({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await params
  const service = (await getServices()).find((s) => s.slug === slug)
  const where = `${business.address.city}, ${business.address.state}`
  return ogCard(
    service ? { title: service.name, subtitle: `in ${where}` } : { title: business.name, subtitle: `${business.category} in ${where}` }
  )
}
