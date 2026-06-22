import { Hono } from 'hono'
import { FUNNEL_LEAD_TYPE_SLUG } from '../../config/crm'
import { analyticsEvents } from '../../config/analytics'
import { buildLeadMemoryContent } from '../../lib/funnel/memory'
import { buildLeadRecordData } from '../../lib/funnel/normalize'
import { LeadInputSchema } from '../../lib/funnel/schema'
import { createSaptClient, SaptApiError } from '../../lib/sapt/client'
import { ensureFunnelLeadObjectType } from '../../lib/sapt/crm'
import { readRequiredEnv, type WorkerEnv } from '../env'
import { errorMessage, jsonError } from '../responses'

export const leadRoutes = new Hono<{ Bindings: WorkerEnv }>()

leadRoutes.post('/api/lead', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = LeadInputSchema.safeParse(body)
  if (!parsed.success) {
    return jsonError(c, 400, 'validation_error', 'Lead submission is invalid.', parsed.error.flatten())
  }

  try {
    const env = readRequiredEnv(c.env)
    const sapt = createSaptClient({ apiKey: env.apiKey, endpoint: env.endpoint })

    await ensureFunnelLeadObjectType(sapt, env.projectId)

    const data = buildLeadRecordData(parsed.data)
    const record = await sapt.createObjectRecord(env.projectId, {
      typeSlug: FUNNEL_LEAD_TYPE_SLUG,
      data,
      externalId: buildExternalId(parsed.data.email),
    })

    const content = buildLeadMemoryContent(parsed.data, record.id)
    await sapt.createMemoryEntry(env.projectId, {
      slug: `funnels/leads/${record.id}`,
      title: `Funnel lead: ${parsed.data.name}`,
      description: 'Captured by the Sapt funnel template.',
      content,
    })

    return c.json({
      ok: true,
      recordId: record.id,
      personRefId: record.personRefId,
      event: analyticsEvents.leadCreated,
    })
  } catch (error) {
    if (error instanceof SaptApiError) {
      return jsonError(c, statusOrDefault(error.status), error.code, error.message, error.details)
    }
    return jsonError(c, 500, 'lead_submit_failed', errorMessage(error))
  }
})

function buildExternalId(email: string): string {
  return `sapt-funnel:${email.toLowerCase()}:${Date.now()}`
}

function statusOrDefault(status: number): 400 | 401 | 403 | 404 | 409 | 500 | 502 {
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409) return status
  if (status >= 500) return 502
  return 500
}
