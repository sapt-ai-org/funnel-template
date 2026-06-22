import { Hono } from 'hono'
import { z } from 'zod'
import { createSaptClient, SaptApiError } from '../../lib/sapt/client'
import { readRequiredEnv, type WorkerEnv } from '../env'
import { errorMessage, jsonError } from '../responses'

const ConnectSessionInputSchema = z.object({
  providerId: z.string().trim().min(1).max(80),
})

export const connectSessionRoutes = new Hono<{ Bindings: WorkerEnv }>()

connectSessionRoutes.post('/api/connect-session', async (c) => {
  const parsed = ConnectSessionInputSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) {
    return jsonError(c, 400, 'validation_error', 'providerId is required.', parsed.error.flatten())
  }

  try {
    const env = readRequiredEnv(c.env)
    const sapt = createSaptClient({ apiKey: env.apiKey, endpoint: env.endpoint })
    const session = await sapt.createConnectSession(env.projectId, {
      providerId: parsed.data.providerId,
      clientInvite: true,
    })
    return c.json({ ok: true, session })
  } catch (error) {
    if (error instanceof SaptApiError) {
      return jsonError(c, statusOrDefault(error.status), error.code, error.message, error.details)
    }
    return jsonError(c, 500, 'connect_session_failed', errorMessage(error))
  }
})

function statusOrDefault(status: number): 400 | 401 | 403 | 404 | 409 | 500 | 502 {
  if (status === 400 || status === 401 || status === 403 || status === 404 || status === 409) return status
  if (status >= 500) return 502
  return 500
}
