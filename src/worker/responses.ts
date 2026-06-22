import type { Context } from 'hono'

export function jsonError(c: Context, status: 400 | 401 | 403 | 404 | 409 | 500 | 502, code: string, message: string, details?: unknown) {
  return c.json({ error: { code, message, details } }, status)
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
