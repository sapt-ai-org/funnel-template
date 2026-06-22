export interface SaptAuthMe {
  actorId: string
  actorType: string
  actorName: string
  apiKey?: {
    id: string
    prefix: string
  }
}

export interface SaptObjectType {
  slug: string
  name: string
  description: string | null
  kind: 'system' | 'user'
  icon: string | null
  color: string | null
  schema: Record<string, ContentField>
  statuses: StatusDefinition[] | null
  isPublicIngestable: boolean
  isHiddenFromUi: boolean
  linksToPerson: boolean
  linksToCompany: boolean
  identityFields: string[] | null
  rejectUnknownFields: boolean
  relations: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ContentField {
  label: string
  description?: string
  schema: {
    type?: string | string[]
    format?: string
    required?: boolean
    enum?: unknown[]
    options?: Record<string, unknown>
  }
}

export interface StatusDefinition {
  key: string
  label: string
  color?: string
  isInitial?: boolean
  isTerminal?: boolean
}

export interface CreateObjectTypeInput {
  slug: string
  name: string
  description?: string
  schema: Record<string, ContentField>
  statuses?: StatusDefinition[]
  icon?: string
  color?: string
  isPublicIngestable?: boolean
  linksToPerson?: boolean
  rejectUnknownFields?: boolean
}

export interface UpdateObjectTypeInput {
  name?: string
  description?: string | null
  schema?: Record<string, ContentField>
  statuses?: StatusDefinition[] | null
  icon?: string | null
  color?: string | null
  isPublicIngestable?: boolean
  linksToPerson?: boolean
  rejectUnknownFields?: boolean
}

export interface CreateObjectRecordInput {
  typeSlug: string
  data?: Record<string, unknown>
  externalId?: string
}

export interface SaptObjectRecord {
  id: string
  typeSlug: string
  displayName: string | null
  externalId: string | null
  data: Record<string, unknown>
  personRefId: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateMemoryEntryInput {
  slug: string
  title: string
  description: string
  content: string
}

export interface SaptMemoryEntry {
  id: string
  projectId: string
  slug: string
  title: string
  description: string
  content: string
}

export interface ConnectSession {
  connectUrl: string
  token: string
  expiresAt: string
}
