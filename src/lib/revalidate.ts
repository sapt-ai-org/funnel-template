/**
 * The call Sapt makes when CMS content changes, and how the site checks it.
 *
 * Sapt POSTs `{ event, projectId, contentType, contentSlug, timestamp }` to
 * `<each project URL>/api/revalidate` whenever an item is published, updated
 * or deleted, with `x-sapt-signature`: the hex HMAC-SHA256 of the raw body,
 * keyed with Sapt's APP_KEY. The same contract as client-total-health-systems;
 * the sender is `dispatchCmsRevalidation` in sapt-platform.
 *
 * A replayed call only rebuilds pages that are already correct, so there is
 * no timestamp window to get wrong.
 */

export interface RevalidationPayload {
  event: 'content.published' | 'content.updated' | 'content.deleted'
  projectId: string
  contentType: string
  /** One item's slug, or '*' when a whole type changed. */
  contentSlug: string
  timestamp: string
}

const EVENTS = new Set(['content.published', 'content.updated', 'content.deleted'])

/** A content type slug as Sapt writes it. Anything else never becomes a cache tag. */
const TYPE_SLUG = /^[a-z0-9][a-z0-9_-]{0,63}$/

async function hmacHex(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ])
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, '0')).join('')
}

/** True when `signature` is Sapt's signature of exactly this body. Compared in constant time. */
export async function verifySignature(body: string, signature: string | null, secret: string): Promise<boolean> {
  if (!signature || !secret) return false
  const expected = await hmacHex(body, secret)
  const given = signature.trim().toLowerCase()
  if (given.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ given.charCodeAt(i)
  return diff === 0
}

/** The payload, or null when it is not one Sapt would send. */
export function parsePayload(body: string): RevalidationPayload | null {
  let raw: unknown
  try {
    raw = JSON.parse(body)
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Record<string, unknown>
  if (typeof p.event !== 'string' || !EVENTS.has(p.event)) return null
  if (typeof p.projectId !== 'string' || !p.projectId) return null
  if (typeof p.contentType !== 'string' || !TYPE_SLUG.test(p.contentType)) return null
  return {
    event: p.event as RevalidationPayload['event'],
    projectId: p.projectId,
    contentType: p.contentType,
    contentSlug: typeof p.contentSlug === 'string' ? p.contentSlug : '*',
    timestamp: typeof p.timestamp === 'string' ? p.timestamp : '',
  }
}
