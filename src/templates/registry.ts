/**
 * Template registry — gallery only.
 *
 * Lists every template so the preview routes can render them and the admin
 * picker can list them. `init-project.ts` DELETES this file when a client repo
 * is generated: a client ships one template and never needs a lookup.
 *
 * Adding a directory under src/templates/ without an entry here makes that
 * template invisible to the admin picker — provisioning reads the
 * filesystem, this registry drives the picker.
 */
import type { LandingSpec } from '@/config/funnel'
import type { ComponentType } from 'react'
import { Landing as Aurora } from './aurora/Landing'
import { Landing as Mono } from './mono/Landing'

export interface TemplateEntry {
  id: string
  /** Shown on the picker card. */
  name: string
  /** One line on the picker card — what this template is good for. */
  description: string
  /** Filter chips in the admin picker. Lowercase, single words where possible. */
  tags?: string[]
  component: ComponentType<{ spec: LandingSpec }>
}

export const TEMPLATES: Record<string, TemplateEntry> = {
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    description:
      'Soft and centered, with rounded cards and a gradient close. Good for wellness, med spa, and clinical services.',
    tags: ['wellness', 'medspa', 'clinical', 'soft', 'centered'],
    component: Aurora,
  },
  mono: {
    id: 'mono',
    name: 'Mono',
    description:
      'Editorial and typographic — left-aligned, hairline rules, numbered benefits, persistent CTA bar. Good for trades, coaching, legal, and high-ticket services.',
    tags: ['trades', 'coaching', 'legal', 'high-ticket', 'editorial', 'bold'],
    component: Mono,
  },
}
