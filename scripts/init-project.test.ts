import { describe, expect, it } from 'vitest'
import { buildRamp, mixHex, setCssVar, setSpecLogo, setSpecString } from './init-project'

describe('mixHex', () => {
  it('is a no-op at 0% toward white', () => {
    expect(mixHex('#948CC1', 'white', 0)).toBe('#948CC1')
  })

  it('is a no-op at 0% toward black', () => {
    expect(mixHex('#948CC1', 'black', 0)).toBe('#948CC1')
  })

  it('reaches pure white at 100%', () => {
    expect(mixHex('#948CC1', 'white', 1)).toBe('#FFFFFF')
  })

  it('reaches pure black at 100%', () => {
    expect(mixHex('#948CC1', 'black', 1)).toBe('#000000')
  })
})

describe('buildRamp', () => {
  it('keeps 500 equal to the input hex exactly', () => {
    const ramp = buildRamp('#0f766e', [50, 500, 900])
    expect(ramp[500]).toBe('#0f766e')
  })

  it('lightens toward the 50 end and darkens toward the 900 end', () => {
    const ramp = buildRamp('#0F766E', [50, 500, 900])
    expect(ramp[50]).not.toBe(ramp[500])
    expect(ramp[900]).not.toBe(ramp[500])
  })
})

describe('setCssVar', () => {
  it('replaces the value while preserving a trailing comment', () => {
    const source = '  --color-primary-500: #948CC1;     /* ← Main brand color */\n'
    expect(setCssVar(source, 'color-primary-500', '#0F766E')).toBe(
      '  --color-primary-500: #0F766E;     /* ← Main brand color */\n'
    )
  })

  it('throws when the variable is not found', () => {
    expect(() => setCssVar('--foo: bar;', 'color-primary-500', '#fff')).toThrow(
      /"--color-primary-500" not found/
    )
  })
})

describe('setSpecString', () => {
  it('handles a double-quoted property and escapes a quote in the new value', () => {
    const source = 'brandName: "Placeholder Co",'
    expect(setSpecString(source, 'brandName', 'New "Brand"')).toBe(
      'brandName: "New \\"Brand\\"",'
    )
  })

  it('handles a single-quoted property and escapes a quote in the new value', () => {
    const source = "brandName: 'Placeholder Co',"
    expect(setSpecString(source, 'brandName', "O'Brien's")).toBe("brandName: 'O\\'Brien\\'s',")
  })

  it('throws when the property is not found', () => {
    expect(() => setSpecString('ctaLabel: "Go",', 'brandName', 'New Name')).toThrow(
      /"brandName" not found/
    )
  })
})

describe('setSpecLogo', () => {
  it('rewrites logo: null, to a populated logo object', () => {
    const source = '  logo: null,\n'
    expect(setSpecLogo(source, { src: '/logo.svg', alt: 'Acme' })).toBe(
      "  logo: { src: '/logo.svg', alt: 'Acme' },\n"
    )
  })

  it('rewrites a populated logo object back to logo: null,', () => {
    const source = "  logo: { src: '/logo.svg', alt: 'Acme' },\n"
    expect(setSpecLogo(source, null)).toBe('  logo: null,\n')
  })
})
