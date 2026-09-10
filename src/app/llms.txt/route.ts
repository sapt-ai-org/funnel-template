import { llmsTxt } from '@/lib/schema'

/**
 * Served as text/plain so a crawler gets the facts without parsing a layout.
 * Cached for an hour: the underlying profile only changes when someone edits
 * the Google listing.
 */
export function GET(): Response {
  return new Response(llmsTxt(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
