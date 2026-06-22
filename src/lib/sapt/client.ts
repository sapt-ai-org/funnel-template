import type {
  ConnectSession,
  CreateMemoryEntryInput,
  CreateObjectRecordInput,
  CreateObjectTypeInput,
  SaptAuthMe,
  SaptMemoryEntry,
  SaptObjectRecord,
  SaptObjectType,
  UpdateObjectTypeInput,
} from './types'

export class SaptApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'SaptApiError'
  }
}

export interface SaptClientOptions {
  apiKey: string
  endpoint?: string
  fetchImpl?: typeof fetch
  userAgent?: string
}

export interface SaptClient {
  getAuthMe(): Promise<SaptAuthMe>
  listObjectTypes(projectId: string): Promise<SaptObjectType[]>
  getObjectType(projectId: string, typeSlug: string): Promise<SaptObjectType>
  createObjectType(projectId: string, input: CreateObjectTypeInput): Promise<SaptObjectType>
  updateObjectType(projectId: string, typeSlug: string, input: UpdateObjectTypeInput): Promise<SaptObjectType>
  createObjectRecord(projectId: string, input: CreateObjectRecordInput): Promise<SaptObjectRecord>
  createMemoryEntry(projectId: string, input: CreateMemoryEntryInput): Promise<SaptMemoryEntry>
  createConnectSession(projectId: string, input: { providerId: string; clientInvite?: boolean }): Promise<ConnectSession>
}

const TEMPLATE_VERSION = '0.1.0'

export function createSaptClient(opts: SaptClientOptions): SaptClient {
  const endpoint = (opts.endpoint ?? 'https://api.sapt.ai').replace(/\/$/, '')
  const fetchImpl = opts.fetchImpl ?? fetch
  const userAgent = opts.userAgent ?? `sapt-funnel-template/${TEMPLATE_VERSION}`

  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetchImpl(`${endpoint}${path}`, {
      method,
      headers: {
        Authorization: `ApiKey ${opts.apiKey}`,
        'User-Agent': userAgent,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })

    const text = await res.text()
    const parsed = text ? safeJsonParse(text) : null

    if (!res.ok) {
      const envelope = normalizeErrorEnvelope(parsed, res.status, res.statusText)
      throw new SaptApiError(res.status, envelope.code, envelope.message, envelope.details)
    }

    return parsed as T
  }

  return {
    async getAuthMe() {
      return request<SaptAuthMe>('GET', '/auth/me')
    },
    async listObjectTypes(projectId) {
      const res = await request<{ objectTypes: SaptObjectType[] }>(
        'GET',
        `/projects/${encodeURIComponent(projectId)}/object-types?includeHidden=true`
      )
      return res.objectTypes
    },
    async getObjectType(projectId, typeSlug) {
      const res = await request<{ objectType: SaptObjectType }>(
        'GET',
        `/projects/${encodeURIComponent(projectId)}/object-types/${encodeURIComponent(typeSlug)}`
      )
      return res.objectType
    },
    async createObjectType(projectId, input) {
      const res = await request<{ objectType: SaptObjectType }>(
        'POST',
        `/projects/${encodeURIComponent(projectId)}/object-types`,
        input
      )
      return res.objectType
    },
    async updateObjectType(projectId, typeSlug, input) {
      const res = await request<{ objectType: SaptObjectType }>(
        'PATCH',
        `/projects/${encodeURIComponent(projectId)}/object-types/${encodeURIComponent(typeSlug)}`,
        input
      )
      return res.objectType
    },
    async createObjectRecord(projectId, input) {
      const res = await request<{ record: SaptObjectRecord }>(
        'POST',
        `/projects/${encodeURIComponent(projectId)}/object-records`,
        input
      )
      return res.record
    },
    async createMemoryEntry(projectId, input) {
      const res = await request<{ entry: SaptMemoryEntry }>(
        'POST',
        `/projects/${encodeURIComponent(projectId)}/memory-entries`,
        input
      )
      return res.entry
    },
    async createConnectSession(projectId, input) {
      return request<ConnectSession>(
        'POST',
        `/projects/${encodeURIComponent(projectId)}/connect-sessions`,
        input
      )
    },
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function normalizeErrorEnvelope(parsed: unknown, status: number, fallback: string) {
  if (parsed && typeof parsed === 'object') {
    const record = parsed as Record<string, unknown>
    const nested = record.error
    if (nested && typeof nested === 'object') {
      const err = nested as Record<string, unknown>
      return {
        code: typeof err.code === 'string' ? err.code : `http_${status}`,
        message: typeof err.message === 'string' ? err.message : fallback || 'Request failed',
        details: err.details,
      }
    }
    return {
      code: typeof record.code === 'string' ? record.code : `http_${status}`,
      message: typeof record.message === 'string' ? record.message : fallback || 'Request failed',
      details: record.details,
    }
  }

  return { code: `http_${status}`, message: fallback || 'Request failed', details: parsed }
}
