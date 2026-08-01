import { describe, expect, it } from 'vitest'
import {
  buildRamp,
  mixHex,
  prunePaths,
  rewriteLandingImport,
  setCssVar,
  setSpecLogo,
  setSpecString,
} from './init-project'

describe('rewriteLandingImport', () => {
  it('repoints the Landing import at the chosen template', () => {
    const source = [
      "import { Landing } from '@/templates/aurora/Landing'",
      "import { landingSpec } from '@/config/funnel'",
    ].join('\n')

    expect(rewriteLandingImport(source, 'mono')).toBe(
      [
        "import { Landing } from '@/templates/mono/Landing'",
        "import { landingSpec } from '@/config/funnel'",
      ].join('\n')
    )
  })

  it('is a no-op when the chosen template is already imported', () => {
    const source = "import { Landing } from '@/templates/aurora/Landing'"
    expect(rewriteLandingImport(source, 'aurora')).toBe(source)
  })

  it('throws when no Landing import is present, rather than silently shipping the wrong template', () => {
    expect(() => rewriteLandingImport('export default function Home() {}', 'mono')).toThrow(
      /Landing import/
    )
  })
})

describe('prunePaths', () => {
  it('deletes every template except the chosen one, plus the gallery-only files', () => {
    expect(prunePaths(['aurora', 'mono', 'vsl'], 'mono')).toEqual([
      'src/templates/aurora',
      'src/templates/vsl',
      'src/templates/registry.ts',
      'src/app/preview',
      'src/config/placeholder.test.ts',
    ])
  })

  it('keeps the chosen template when it is the only one', () => {
    expect(prunePaths(['aurora'], 'aurora')).toEqual([
      'src/templates/registry.ts',
      'src/app/preview',
      'src/config/placeholder.test.ts',
    ])
  })

  it('throws when the chosen template does not exist', () => {
    expect(() => prunePaths(['aurora', 'mono'], 'nope')).toThrow(/unknown template "nope"/)
  })
})

describe('prunePaths as a pre-write guard', () => {
  it('rejects an unknown template id before any filesystem write is attempted', () => {
    // The top-level script calls this before writeWrangler for exactly this
    // reason — see the validate-before-write ordering in init-project.ts.
    expect(() => prunePaths(['aurora'], 'does-not-exist')).toThrow(
      /unknown template "does-not-exist" \(have: aurora\)/
    )
  })
})

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
