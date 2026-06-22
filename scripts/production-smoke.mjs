const baseUrl = (process.env.FUNNEL_TEST_BASE_URL ?? 'http://localhost:8787').replace(/\/$/, '')
const now = new Date().toISOString().replace(/[:.]/g, '-')

async function main() {
  console.log(`Testing funnel at ${baseUrl}`)

  await checkHealth()
  await runSetup()
  await submitLead()

  console.log('Smoke test passed. Check Sapt CRM for the test lead and memory entry.')
}

async function checkHealth() {
  const body = await request('/api/health', { method: 'GET' })
  if (!body.ok) throw new Error('/api/health did not return ok')
  console.log(`Health ok. Actor: ${body.actor?.actorName ?? 'unknown'}`)
}

async function runSetup() {
  const body = await request('/api/setup', { method: 'POST' })
  if (!body.ok) throw new Error('/api/setup did not return ok')
  console.log(`Setup ok. Object type ${body.status}.`)
}

async function submitLead() {
  const email = `sapt-funnel-smoke+${now}@example.com`
  const body = await request('/api/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Sapt Funnel Smoke Test',
      email,
      phone: '+15555550123',
      company: 'Sapt Test Company',
      message: 'Automated production smoke test lead. Safe to delete.',
      answers: {
        goal: 'Verify the deployed funnel creates CRM records and memory entries.',
        timeline: 'asap',
      },
      visitorId: `smoke-${now}`,
      landingPage: `${baseUrl}/?utm_source=smoke&utm_medium=test&utm_campaign=production_test`,
      referrer: 'production-smoke-test',
      utm: {
        source: 'smoke',
        medium: 'test',
        campaign: 'production_test',
      },
      website: '',
    }),
  })

  if (!body.ok) throw new Error('/api/lead did not return ok')
  console.log(`Lead ok. recordId=${body.recordId}`)
}

async function request(path, init) {
  const res = await fetch(`${baseUrl}${path}`, init)
  const text = await res.text()
  const body = text ? JSON.parse(text) : null

  if (!res.ok) {
    const message = body?.error?.message ?? res.statusText
    throw new Error(`${path} failed (${res.status}): ${message}`)
  }

  return body
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
