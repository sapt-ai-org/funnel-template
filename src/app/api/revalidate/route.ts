import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { cmsTag } from '@/lib/cms'
import { parsePayload, verifySignature } from '@/lib/revalidate'
import { getSaptServerConfig } from '@/lib/sapt-config'

/**
 * POST /api/revalidate
 *
 * Sapt calls this the moment an editor publishes, updates or deletes CMS
 * content (see `src/lib/revalidate.ts` for the contract). It clears the
 * `cms:<type>` tag, which drops the cached read of that type and marks every
 * page built from it stale, so the next visitor gets a page rebuilt from the
 * new content. Nothing is rebuilt here; the call returns in milliseconds.
 *
 * Needs the `APP_KEY` secret, the same value Sapt signs with. Without it the
 * call is refused and pages still refresh on their `revalidate` timer.
 * Sapt only calls sites listed under the project's URLs.
 */
export async function POST(request: Request) {
  const secret = process.env.APP_KEY
  if (!secret) {
    console.error('[/api/revalidate] APP_KEY is not set, so Sapt’s call cannot be verified.')
    return NextResponse.json({ error: 'APP_KEY is not set' }, { status: 503 })
  }

  const body = await request.text()
  if (!(await verifySignature(body, request.headers.get('x-sapt-signature'), secret))) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = parsePayload(body)
  if (!payload) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Signed by Sapt but meant for another project: this site's pages are not affected.
  if (payload.projectId !== getSaptServerConfig().projectId) {
    return NextResponse.json({ error: 'Wrong project' }, { status: 400 })
  }

  const tag = cmsTag(payload.contentType)
  revalidateTag(tag)
  console.info(`[/api/revalidate] ${payload.event} ${payload.contentType}/${payload.contentSlug}: cleared ${tag}`)
  return NextResponse.json({ revalidated: [tag] })
}
