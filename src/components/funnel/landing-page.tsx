import { CheckCircle2 } from 'lucide-react'
import type { FunnelConfig } from '../../config/funnel'
import { analyticsEvents } from '../../config/analytics'
import { track } from '../../lib/analytics/tracker'
import { Button } from '../ui/button'
import { SetupBanner } from './setup-banner'

export function LandingPage({ config, onStart }: { config: FunnelConfig; onStart: () => void }) {
  return (
    <main className="page-shell">
      <SetupBanner />
      <section className="hero-grid">
        <div className="hero-copy">
          <img src={config.brand.logoUrl} alt={config.brand.name} className="logo" />
          <p className="eyebrow">{config.brand.eyebrow}</p>
          <h1>{config.brand.headline}</h1>
          <p className="subheadline">{config.brand.subheadline}</p>
          <div className="hero-actions">
            <Button
              type="button"
              onClick={() => {
                track(analyticsEvents.ctaClicked, { location: 'hero_primary' })
                onStart()
              }}
            >
              {config.brand.primaryCta}
            </Button>
            <a
              href="#how-it-works"
              onClick={() => track(analyticsEvents.ctaClicked, { location: 'hero_secondary' })}
            >
              {config.brand.secondaryCta}
            </a>
          </div>
        </div>
        <div className="offer-card" id="how-it-works">
          <p className="card-kicker">Default offer</p>
          <h2>{config.offer.name}</h2>
          <p>{config.offer.promise}</p>
          <ul>
            {config.offer.bullets.map((bullet) => (
              <li key={bullet}>
                <CheckCircle2 aria-hidden="true" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  )
}
