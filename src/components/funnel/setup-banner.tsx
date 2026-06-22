import { useState } from 'react'
import { Alert } from '../ui/alert'
import { Button } from '../ui/button'

export function SetupBanner() {
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function runSetup() {
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch('/api/setup', { method: 'POST' })
      const body = (await res.json()) as { ok?: boolean; status?: string; error?: { message?: string } }
      if (!res.ok || !body.ok) throw new Error(body.error?.message ?? 'Setup failed')
      setMessage(`Sapt CRM is ready. Object type ${body.status}.`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Setup failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Alert className="setup-banner">
      <div>
        <strong>First deploy?</strong>
        <span> Run setup once to create the Sapt CRM object type.</span>
      </div>
      <Button type="button" onClick={runSetup} disabled={busy}>
        {busy ? 'Setting up...' : 'Run setup'}
      </Button>
      {message && <p>{message}</p>}
    </Alert>
  )
}
