import type { CSSProperties } from 'react'
import type { LandingSpec } from '@/config/funnel'

type ThemeStyle = CSSProperties & Record<`--${string}`, string>

function parseHex(hex: string): [number, number, number] | null {
  const value = hex.trim().replace(/^#/, '')
  if (!/^[0-9a-f]{6}$/i.test(value)) return null
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ]
}

function mix(hex: string, target: string, amount: number): string {
  const source = parseHex(hex)
  const destination = parseHex(target)
  if (!source || !destination) return hex
  const channel = (index: number) =>
    Math.round(source[index] + (destination[index] - source[index]) * amount)
      .toString(16)
      .padStart(2, '0')
  return `#${channel(0)}${channel(1)}${channel(2)}`
}

/** Convert the compact theme in funnel.ts into every CSS token the templates use. */
export function themeStyle(theme: LandingSpec['theme']): ThemeStyle {
  return {
    '--color-primary-50': mix(theme.primary, '#ffffff', 0.92),
    '--color-primary-100': mix(theme.primary, '#ffffff', 0.82),
    '--color-primary-200': mix(theme.primary, '#ffffff', 0.66),
    '--color-primary-300': mix(theme.primary, '#ffffff', 0.45),
    '--color-primary-400': mix(theme.primary, '#ffffff', 0.2),
    '--color-primary-500': theme.primary,
    '--color-primary-600': mix(theme.primary, '#000000', 0.14),
    '--color-primary-700': mix(theme.primary, '#000000', 0.28),
    '--color-primary-800': mix(theme.primary, '#000000', 0.42),
    '--color-primary-900': mix(theme.primary, '#000000', 0.56),
    '--color-accent-50': mix(theme.accent, '#ffffff', 0.92),
    '--color-accent-100': mix(theme.accent, '#ffffff', 0.82),
    '--color-accent-200': mix(theme.accent, '#ffffff', 0.66),
    '--color-accent-300': mix(theme.accent, '#ffffff', 0.45),
    '--color-accent-400': mix(theme.accent, '#ffffff', 0.2),
    '--color-accent-500': theme.accent,
    '--color-accent-600': mix(theme.accent, '#000000', 0.14),
    '--bg': theme.background,
    '--surface': theme.surface,
    '--text': theme.text,
    '--text-muted': theme.textMuted,
    '--text-light': mix(theme.textMuted, theme.background, 0.28),
    '--border': theme.border,
    '--border-light': mix(theme.border, theme.background, 0.5),
    '--funnel-font-sans': theme.bodyFontFamily,
    '--funnel-font-display': theme.displayFontFamily,
  }
}

/** Only allow a stylesheet provider URL—not arbitrary markup or executable schemes. */
export function safeFontStylesheetUrl(value?: string): string | undefined {
  if (!value) return undefined
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'fonts.googleapis.com' ? url.href : undefined
  } catch {
    return undefined
  }
}
