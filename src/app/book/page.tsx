import { redirect } from 'next/navigation'

/**
 * The funnel now lives on `/` as a full-screen takeover (see the Landing page).
 * Keep `/book` as a permanent alias so old ad links / bookmarks still land.
 */
export default function BookPage() {
  redirect('/')
}
