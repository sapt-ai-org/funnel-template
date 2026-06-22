import { FUNNEL_LEAD_TYPE_SLUG, funnelLeadObjectType, objectTypeUpdatePayload } from '../../config/crm'
import { SaptApiError, type SaptClient } from './client'
import type { SaptObjectType } from './types'

export interface SetupResult {
  status: 'created' | 'updated'
  objectType: SaptObjectType
}

export async function ensureFunnelLeadObjectType(client: SaptClient, projectId: string): Promise<SetupResult> {
  try {
    await client.getObjectType(projectId, FUNNEL_LEAD_TYPE_SLUG)
    const objectType = await client.updateObjectType(projectId, FUNNEL_LEAD_TYPE_SLUG, objectTypeUpdatePayload())
    return { status: 'updated', objectType }
  } catch (error) {
    if (error instanceof SaptApiError && error.status === 404) {
      const objectType = await client.createObjectType(projectId, funnelLeadObjectType)
      return { status: 'created', objectType }
    }
    throw error
  }
}
