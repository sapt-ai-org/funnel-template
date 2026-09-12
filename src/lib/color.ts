/**
 * Brand colour maths, shared by the site (the theme set on <html>, see
 * theme.ts) and by provisioning (scripts/init-project.ts). One brand hex in,
 * a 50–900 ramp out: the light steps for tints and selection, the dark ones
 * for hover and pressed.
 */

export const RAMP_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export type RampStep = (typeof RAMP_STEPS)[number]

/**
 * How far each step mixes toward white or black. Fitted to the template's
 * original hand-picked red ramp, which it reproduces to within two RGB units.
 */
const RAMP_MIX: Record<RampStep, { toward: 'white' | 'black'; amount: number } | null> = {
  50: { toward: 'white', amount: 0.922 },
  100: { toward: 'white', amount: 0.819 },
  200: { toward: 'white', amount: 0.659 },
  300: { toward: 'white', amount: 0.452 },
  400: { toward: 'white', amount: 0.2 },
  500: null, // the brand hex itself
  600: { toward: 'black', amount: 0.13 },
  700: { toward: 'black', amount: 0.27 },
  800: { toward: 'black', amount: 0.42 },
  900: { toward: 'black', amount: 0.562 },
}

/** True for a six-digit hex colour, with or without the `#`. */
export function isHex(value: string): boolean {
  return /^#?[0-9a-fA-F]{6}$/.test(value.trim())
}

function parseHex(hex: string): { r: number; g: number; b: number } {
  if (!isHex(hex)) throw new Error(`Invalid hex color "${hex}"`)
  const n = hex.trim().replace(/^#/, '')
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) }
}

function toHex(r: number, g: number, b: number): string {
  const part = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
  return `#${part(r)}${part(g)}${part(b)}`.toUpperCase()
}

/** Mixes `hex` toward white or black by `amount` (0 = unchanged, 1 = fully `toward`). */
export function mixHex(hex: string, toward: 'white' | 'black', amount: number): string {
  const target = toward === 'white' ? 255 : 0
  const { r, g, b } = parseHex(hex)
  const mix = (c: number) => c + (target - c) * amount
  return toHex(mix(r), mix(g), mix(b))
}

/** The shade ramp for `hex`. Step 500 is `hex` exactly, as given. */
export function buildRamp(hex: string, steps: readonly number[] = RAMP_STEPS): Record<number, string> {
  const ramp: Record<number, string> = {}
  for (const step of steps) {
    const rule = RAMP_MIX[step as RampStep]
    ramp[step] = rule ? mixHex(hex, rule.toward, rule.amount) : hex
  }
  return ramp
}
