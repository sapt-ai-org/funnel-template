import { useEffect, useState } from 'react'
import { analyticsEvents } from './config/analytics'
import { funnelConfig as fallbackFunnelConfig, type FunnelConfig } from './config/funnel'
import { LeadForm } from './components/funnel/lead-form'
import { LandingPage } from './components/funnel/landing-page'
import { ThankYou } from './components/funnel/thank-you'
import { installSaptTracker, track } from './lib/analytics/tracker'

type View = 'landing' | 'form' | 'thanks'

export function App() {
  const [view, setView] = useState<View>('landing')
  const [config, setConfig] = useState<FunnelConfig>(fallbackFunnelConfig)

  useEffect(() => {
    let cancelled = false

    fetch('/api/public/config')
      .then((res) => (res.ok ? res.json() : null))
      .then((body: unknown) => {
        if (cancelled || !body) return
        const data = body as {
          runtime?: { projectId: string; ingestScriptUrl: string }
          funnel?: FunnelConfig
        }
        if (data.funnel) setConfig(data.funnel)
        if (data.runtime) installSaptTracker(data.runtime.projectId, data.runtime.ingestScriptUrl)
        track(analyticsEvents.viewed, { view: 'landing' })
      })
      .catch(() => {
        // The page still renders if setup is incomplete; /api/setup will show details.
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (view === 'form') return <LeadForm config={config} onSuccess={() => setView('thanks')} />
  if (view === 'thanks') return <ThankYou config={config} />
  return <LandingPage config={config} onStart={() => setView('form')} />
}
