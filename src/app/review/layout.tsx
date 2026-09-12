import type { Metadata } from 'next'

/**
 * The review page is opened from a text message after a visit. It is for the
 * customer who was just in, not for search, so it stays out of the index.
 */
export const metadata: Metadata = {
  title: 'How did we do?',
  robots: { index: false, follow: false },
}

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children
}
