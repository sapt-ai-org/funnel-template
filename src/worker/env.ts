export interface WorkerEnv {
  ASSETS: Fetcher
  SAPT_API_KEY: string
  SAPT_PROJECT_ID: string
  SAPT_ENDPOINT?: string
  SAPT_INGEST_SCRIPT_URL?: string
}

export interface PublicRuntimeConfig {
  projectId: string
  ingestScriptUrl: string
}

export function readRequiredEnv(env: WorkerEnv): {
  apiKey: string
  projectId: string
  endpoint: string
  ingestScriptUrl: string
} {
  const apiKey = env.SAPT_API_KEY?.trim()
  const projectId = env.SAPT_PROJECT_ID?.trim()
  const endpoint = (env.SAPT_ENDPOINT ?? 'https://api.sapt.ai').trim().replace(/\/$/, '')
  const ingestScriptUrl = (env.SAPT_INGEST_SCRIPT_URL ?? 'https://ingest.sapt.ai/v1/track.js').trim()

  if (!apiKey) throw new Error('Missing required env var: SAPT_API_KEY')
  if (!projectId) throw new Error('Missing required env var: SAPT_PROJECT_ID')
  return { apiKey, projectId, endpoint, ingestScriptUrl }
}

export function publicRuntimeConfig(env: WorkerEnv): PublicRuntimeConfig {
  const { projectId, ingestScriptUrl } = readRequiredEnv(env)
  return { projectId, ingestScriptUrl }
}
