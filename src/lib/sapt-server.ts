/**
 * Sapt server-side REST client (no SDK)
 *
 * Imported ONLY from server code (route handlers and server components):
 *
 *   1. POST → CRM   — save a record to a CRM object type you created (booking).
 *                     Public: needs only the Project ID.
 *   2. The shape of a published CMS item. The reads themselves, and how they
 *      are cached, live in `cms.ts`.
 *
 * Analytics is the third Sapt touchpoint and is a script tag, not a fetch —
 * see `src/components/Analytics.tsx`.
 */

import { getSaptServerConfig } from './sapt-config'

// ============================================================================
// SHARED
// ============================================================================

interface SaptResult<T> {
  ok: boolean
  status: number
  data: T | null
  error?: string
}

async function saptFetch<T>(
  url: string,
  init: RequestInit & { apiKey?: string } = {}
): Promise<SaptResult<T>> {
  const { apiKey, headers, ...rest } = init
  try {
    const res = await fetch(url, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `ApiKey ${apiKey}` } : {}),
        ...headers,
      },
    })

    const text = await res.text()
    const data = text ? (JSON.parse(text) as T) : null

    if (!res.ok) {
      const err =
        (data as { error?: string } | null)?.error || `Request failed (${res.status})`
      return { ok: false, status: res.status, data, error: err }
    }
    return { ok: true, status: res.status, data }
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================================================
// 1. POST → CRM (public, Project ID only)
// ============================================================================
//
// Saves a record to a CRM object type. The type must already exist in your
// project with `isPublicIngestable: true` — create it once (see
// SAPT_SETUP_GUIDE.md; an agent on the Sapt MCP can do it in one call). Posts
// before the type exists return an error, so the booking funnel surfaces a
// clear "create the type" message instead of silently dropping the lead.

export interface IngestObjectInput {
  /** The record fields, validated against the type's schema. */
  data?: Record<string, unknown>
  /** Optional idempotency key (unique per type). */
  externalId?: string
  /**
   * First-party tracking context Sapt keeps OUT of the record. `lead` decides
   * whether Sapt reports this record to the ad platforms as a Lead: `kind:
   * 'lead'` with the event id the browser's Pixel will also use (see
   * src/lib/meta-pixel.ts), or `kind: 'none'` for anything that is not a lead.
   */
  tracking?: {
    visitorId?: string
    sourceUrl?: string
    clientUserAgent?: string
    lead: { kind: 'lead'; eventId: string } | { kind: 'none' }
  }
}

export interface IngestObjectResult {
  success: boolean
  recordId: string
  /** Withheld by Sapt (spam, or a contact marked not qualified). No Pixel Lead may fire for it. */
  held?: boolean
  /** The id Sapt's server-side Lead carries; the Pixel's Lead must use exactly this. Null when no Lead fires. */
  conversionEventId?: string | null
}

/** POST /public/projects/{projectId}/objects/{typeSlug} */
export async function ingestObject(typeSlug: string, input: IngestObjectInput) {
  const { baseUrl, projectId } = getSaptServerConfig()
  return saptFetch<IngestObjectResult>(
    `${baseUrl}/public/projects/${projectId}/objects/${typeSlug}`,
    { method: 'POST', body: JSON.stringify(input) }
  )
}

// ============================================================================
// 2. Published CMS items (read in cms.ts)
// ============================================================================
//
// Published content is safe to render on a public website and is exposed by a
// dedicated, credential-free endpoint; drafts stay behind Sapt auth.

export interface CMSContentItem {
  id: string
  slug: string
  name: string
  status: 'draft' | 'published' | 'archived'
  content: Record<string, unknown>
  publishedAt?: string | null
  displayOrder?: number
  createdAt: string
  updatedAt: string
}
