import { Hono } from 'hono'
import { createSaptClient } from '../../lib/sapt/client'
import { readRequiredEnv, type WorkerEnv } from '../env'
import { errorMessage, jsonError } from '../responses'

export const healthRoutes = new Hono<{ Bindings: WorkerEnv }>()

healthRoutes.get('/api/health', async (c) => {
  try {
    const env = readRequiredEnv(c.env)
    const sapt = createSaptClient({ apiKey: env.apiKey, endpoint: env.endpoint })
    const me = await sapt.getAuthMe()
    return c.json({ ok: true, projectId: env.projectId, actor: me })
  } catch (error) {
    return jsonError(c, 500, 'health_failed', errorMessage(error))
  }
})
