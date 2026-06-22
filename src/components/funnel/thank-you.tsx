import type { FunnelConfig } from '../../config/funnel'
import { Button } from '../ui/button'

export function ThankYou({ config }: { config: FunnelConfig }) {
  return (
    <main className="thanks-shell">
      <img src={config.brand.logoUrl} alt={config.brand.name} className="logo" />
      <h1>{config.thankYou.headline}</h1>
      <p>{config.thankYou.body}</p>
      <Button type="button" onClick={() => (window.location.href = config.thankYou.nextStepUrl)}>
        {config.thankYou.nextStepLabel}
      </Button>
    </main>
  )
}
