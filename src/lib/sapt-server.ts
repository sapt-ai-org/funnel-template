/**
 * Sapt server-side REST client (no SDK)
 *
 * Two plain `fetch` calls, imported ONLY from server code (route handlers and
 * server components):
 *
 *   1. POST → CRM   — save a record to a CRM object type you created (booking).
 *                     Public: needs only the Project ID.
 *   2. GET  → CMS   — read explicitly published content by slug. Public and
 *                     credential-free; drafts remain behind Sapt auth.
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
}

/** POST /public/projects/{projectId}/objects/{typeSlug} */
export async function ingestObject(typeSlug: string, input: IngestObjectInput) {
  const { baseUrl, projectId } = getSaptServerConfig()
  return saptFetch<{ success: boolean; recordId: string }>(
    `${baseUrl}/public/projects/${projectId}/objects/${typeSlug}`,
    { method: 'POST', body: JSON.stringify(input) }
  )
}

// ============================================================================
// 2. GET → published CMS (public, Project ID only)
// ============================================================================
//
// Published content is safe to render on a public website and is exposed by a
// dedicated endpoint. The hardcoded spec remains only as a resilient fallback
// when the project is missing, unavailable, or has no published item.

export interface CMSContentItem {
  id: string
  slug: string
  name: string
  status: 'draft' | 'published' | 'archived'
  content: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

/**
 * Fetch a single published CMS item by slug. Returns null when the project is
 * not configured or the item doesn't exist.
 * GET /public/projects/{projectId}/cms/content/{contentTypeSlug}/{slug}
 */
export async function cmsGetBySlug(
  contentTypeSlug: string,
  itemSlug: string
): Promise<CMSContentItem | null> {
  const { baseUrl, projectId } = getSaptServerConfig()
  if (!projectId) return null

  const res = await saptFetch<{ item: CMSContentItem }>(
    `${baseUrl}/public/projects/${projectId}/cms/content/${contentTypeSlug}/${itemSlug}`,
    { next: { revalidate: 60 } } as RequestInit
  )
  return res.data?.item ?? null
}
