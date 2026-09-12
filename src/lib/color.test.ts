import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { design } from '@/config/design'
import { buildRamp, isHex, mixHex } from './color'
import { themeStyle } from './theme'

describe('mixHex', () => {
  it('is a no-op at 0% either way', () => {
    expect(mixHex('#948CC1', 'white', 0)).toBe('#948CC1')
    expect(mixHex('#948CC1', 'black', 0)).toBe('#948CC1')
  })

  it('reaches pure white or black at 100%', () => {
    expect(mixHex('#948CC1', 'white', 1)).toBe('#FFFFFF')
    expect(mixHex('#948CC1', 'black', 1)).toBe('#000000')
  })
})

describe('buildRamp', () => {
  it('keeps 500 equal to the brand hex exactly', () => {
    expect(buildRamp('#0f766e')[500]).toBe('#0f766e')
  })

  it('lightens toward 50 and darkens toward 900', () => {
    const ramp = buildRamp('#0F766E')
    expect(ramp[50]).not.toBe(ramp[500])
    expect(ramp[900]).not.toBe(ramp[500])
  })

  it('reproduces the template’s original hand-picked red to within two RGB units', () => {
    const original: Record<number, string> = {
      50: '#FBECEE', 100: '#F5D4D9', 200: '#ECAEB8', 300: '#E17C8C', 400: '#D34058',
      600: '#AC0E28', 700: '#900C21', 800: '#74091B', 900: '#580714',
    }
    const ramp = buildRamp('#C8102E')
    const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
    for (const [step, hex] of Object.entries(original)) {
      const got = channels(ramp[Number(step)])
      channels(hex).forEach((c, i) => expect(Math.abs(c - got[i]), `step ${step}`).toBeLessThanOrEqual(2))
    }
  })
})

describe('the design', () => {
  it('has only six-digit hex colours, so a typo fails here rather than on the page', () => {
    for (const [name, value] of Object.entries(design.colors)) expect(isHex(value), name).toBe(true)
  })

  it('reaches the page as the variables globals.css maps to Tailwind', () => {
    const style = themeStyle(design) as Record<string, string>
    expect(style['--brand-500']).toBe(design.colors.brand)
    expect(style['--bg']).toBe(design.colors.paper)
    expect(style['--text']).toBe(design.colors.ink)
    expect(style['--corner']).toBe(`${design.radius}px`)
    const css = fs.readFileSync(path.join(__dirname, '../app/globals.css'), 'utf8')
    for (const name of Object.keys(style)) expect(css, `${name} is never read`).toContain(`var(${name})`)
  })
})
