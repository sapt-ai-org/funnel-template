import { Hono } from 'hono'
import { ensureFunnelLeadObjectType } from '../../lib/sapt/crm'
import { createSaptClient, SaptApiError } from '../../lib/sapt/client'
import { readRequiredEnv, type WorkerEnv } from '../env'
import { errorMessage, jsonError } from '../responses'

export const setupRoutes = new Hono<{ Bindings: WorkerEnv }>()

setupRoutes.post('/api/setup', async (c) => {
  try {
    const env = readRequiredEnv(c.env)
    const sapt = createSaptClient({ apiKey: env.apiKey, endpoint: env.endpoint })
    const result = await ensureFunnelLeadObjectType(sapt, env.projectId)
    return c.json({ ok: true, ...result })
  } catch (error) {
    if (error instanceof SaptApiError) {
      return jsonError(c, statusOrDefault(error.status), error.code, error.message, error.details)
    }
    return jsonError(c, 500, 'setup_failed', errorMessage(error))
  }
})

setupRoutes.get('/api/setup', async (c) => {
  try {
    const env = readRequiredEnv(c.env)
    const sapt = createSaptClient({ apiKey: env.apiKey, endpoint: env.endpoint })
    const objectTypes = await sapt.listObjectTypes(env.projectId)
    return c.json({ ok: true, projectId: env.projectId, objectTypes })
  } catch (error) {
    if (error instanceof SaptApiError) {
      return jsonError(c, statusOrDefault(error.status), error.code, error.message, error.details)
    }
    return jsonError(c, 500, 'setup_check_failed', errorMessage(error))
  }
})

function statusOrDefault(status: number): 400 | 401 | 403 | 404 | 409 | 500 | 502 {
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409) return status
  if (status >= 500) return 502
  return 500
}
