import type { CSSProperties } from 'react'
import { design as defaults, type Design } from '@/config/design'
import { buildRamp, RAMP_STEPS } from './color'

/**
 * The design (src/config/design.ts) as CSS custom properties, written once on
 * <html> by layout.tsx. globals.css maps each one to a Tailwind token, so a
 * component asks for `bg-primary` or `rounded-md` and gets the shop's value.
 * Rendered on the server into the first byte of HTML: no flash, no script.
 */
export function themeStyle(design: Design = defaults): CSSProperties {
  const c = design.colors
  const ramp = buildRamp(c.brand)
  const vars: Record<string, string> = {
    ...Object.fromEntries(RAMP_STEPS.map((step) => [`--brand-${step}`, ramp[step]])),
    '--bg': c.paper,
    '--surface': c.surface,
    '--text': c.ink,
    '--text-muted': c.muted,
    '--text-light': c.faint,
    '--border': c.line,
    '--border-light': c.lineFaint,
    '--open': c.open,
    '--corner': `${Math.max(0, design.radius)}px`,
  }
  return vars as CSSProperties
}
