import { redirect } from 'next/navigation'

/**
 * `/book` is the link that goes in ads, texts and the Google profile's
 * booking button. It lands on the home page with the booking flow already
 * open, and carries every query parameter across so the UTM tags and click
 * ids that attribute the booking survive the hop.
 */
export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, v)
  }
  params.set('book', '1')
  redirect(`/?${params.toString()}`)
}
