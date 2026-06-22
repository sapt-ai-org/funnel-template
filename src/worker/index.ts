import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { funnelConfig } from '../config/funnel'
import { publicRuntimeConfig, type WorkerEnv } from './env'
import { connectSessionRoutes } from './routes/connect-session'
import { healthRoutes } from './routes/health'
import { leadRoutes } from './routes/lead'
import { setupRoutes } from './routes/setup'
import { errorMessage, jsonError } from './responses'

const app = new Hono<{ Bindings: WorkerEnv }>()

app.use('/api/*', cors({ origin: (origin) => origin, credentials: true }))

app.get('/api/public/config', (c) => {
  try {
    return c.json({ ok: true, runtime: publicRuntimeConfig(c.env), funnel: funnelConfig })
  } catch (error) {
    return jsonError(c, 500, 'config_failed', errorMessage(error))
  }
})

app.route('/', healthRoutes)
app.route('/', setupRoutes)
app.route('/', leadRoutes)
app.route('/', connectSessionRoutes)

app.onError((error, c) => jsonError(c, 500, 'internal_error', errorMessage(error)))

export default app
