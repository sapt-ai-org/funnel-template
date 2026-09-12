import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import {
  applyColors,
  applyFonts,
  DEFAULT_FONTS,
  loadFontCatalog,
  resolveFont,
  setSpecLogo,
  setSpecString,
  wranglerConfig,
} from './init-project'

/** wrangler.jsonc as JSON: comments dropped, strings (which may hold `//`) left alone. */
function readJsonc(file: string): Record<string, unknown> {
  const src = fs.readFileSync(file, 'utf8')
  let out = ''
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === '"') {
      const start = i
      for (i++; i < src.length && src[i] !== '"'; i++) if (src[i] === '\\') i++
      out += src.slice(start, i + 1)
    } else if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++
      out += '\n'
    } else if (c === '/' && src[i + 1] === '*') {
      i = src.indexOf('*/', i + 2) + 1
    } else {
      out += c
    }
  }
  return JSON.parse(out.replace(/,(\s*[}\]])/g, '$1'))
}

describe('wranglerConfig', () => {
  const selfReference = (config: Record<string, unknown>) =>
    (config.services as { binding: string; service: string }[]).find((s) => s.binding === 'WORKER_SELF_REFERENCE')?.service

  it('points the cache queue back at the Worker it writes', () => {
    const config = wranglerConfig('joes-auto-landing')
    expect(config.name).toBe('joes-auto-landing')
    expect(selfReference(config)).toBe('joes-auto-landing')
    expect(config.r2_buckets).toEqual([{ binding: 'NEXT_INC_CACHE_R2_BUCKET', bucket_name: 'joes-auto-landing-cache' }])
    expect(config).not.toHaveProperty('routes')
  })

  it('keeps the cache bucket inside R2’s 63-character limit', () => {
    const name = `${'a'.repeat(48)}-${'b'.repeat(6)}-landing`
    const [{ bucket_name }] = wranglerConfig(name).r2_buckets as { bucket_name: string }[]
    expect(bucket_name.length).toBeLessThanOrEqual(63)
    expect(bucket_name).toMatch(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/)
  })

  it('adds the route when one is given', () => {
    expect(wranglerConfig('x-landing', { pattern: 'shop.example.com/*', zoneId: 'z1' }).routes).toEqual([
      { pattern: 'shop.example.com/*', zone_id: 'z1' },
    ])
  })

  it('matches the template’s own wrangler.jsonc, so a client Worker caches like the template', () => {
    const committed = readJsonc(path.join(__dirname, '..', 'wrangler.jsonc'))
    const generated = wranglerConfig(committed.name as string)
    expect(selfReference(committed)).toBe(committed.name)
    for (const key of [
      'main',
      'compatibility_date',
      'compatibility_flags',
      'build',
      'assets',
      'observability',
      'services',
      'durable_objects',
      'migrations',
    ]) {
      expect(committed[key], key).toEqual(generated[key])
    }
    expect((committed.r2_buckets as { binding: string }[]).map((b) => b.binding)).toEqual(['NEXT_INC_CACHE_R2_BUCKET'])
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

describe('applyColors against the real design.ts', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/config/design.ts'), 'utf8')

  it('writes the brand, background and text colours into brand, paper and ink', () => {
    const out = applyColors(source, [
      { hex: '#0f766e', purpose: 'primary' },
      { hex: 'FAFAF7', purpose: 'background' },
      { hex: '#111827', purpose: 'text' },
      { hex: '#F59E0B', purpose: 'secondary' },
    ])
    expect(out).toMatch(/brand: '#0F766E'/)
    expect(out).toMatch(/paper: '#FAFAF7'/)
    expect(out).toMatch(/ink: '#111827'/)
    // Nothing else in the file moves.
    expect(out.replace(/'#[0-9A-F]{6}'/g, '')).toBe(source.replace(/'#[0-9A-F]{6}'/g, ''))
  })

  it('keeps the template colour when the brand sends something that is not a hex', () => {
    expect(applyColors(source, [{ hex: 'red', purpose: 'primary' }])).toBe(source)
  })
})

describe('applyFonts against the real fonts.ts', () => {
  const source = fs.readFileSync(path.join(__dirname, '../src/config/fonts.ts'), 'utf8')
  const catalog = loadFontCatalog(path.join(__dirname, '..'))
  const brandFont = (type: 'primary' | 'secondary', name: string) => ({ type, name, source: 'google', googleFontFamily: name })

  it('reads next/font’s own list of Google families', () => {
    expect(catalog?.['Barlow Condensed']).toBeTruthy()
  })

  it('writes exactly the file the template ships when given the template’s own faces', () => {
    const out = applyFonts(source, [brandFont('primary', 'Barlow'), brandFont('secondary', 'Barlow Condensed')], catalog)
    expect(out).toBe(source)
    expect(resolveFont('Barlow', 'body', catalog!)).toEqual(DEFAULT_FONTS.body)
    expect(resolveFont('Barlow Condensed', 'display', catalog!)).toEqual(DEFAULT_FONTS.display)
  })

  it('loads a static brand font in the nearest weights it has, self-hosted', () => {
    const out = applyFonts(source, [brandFont('primary', 'Poppins'), brandFont('secondary', 'Oswald')], catalog)
    expect(out).toContain("import { Poppins, Oswald } from 'next/font/google'")
    expect(out).toMatch(/bodyFont = Poppins\(\{\n {2}subsets: \['latin'\],\n {2}weight: \['400', '500', '600'\],/)
    // Oswald is a variable font: every weight comes in one file, so no weight list.
    expect(out).toMatch(/displayFont = Oswald\(\{\n {2}subsets: \['latin'\],\n {2}variable: '--font-heading',/)
    expect(out).not.toContain('fonts.googleapis.com')
    expect(out.slice(0, out.indexOf('import {'))).toBe(source.slice(0, source.indexOf('import {')))
  })

  it('uses one brand font for both faces when the brand has only one', () => {
    const out = applyFonts(source, [brandFont('primary', 'Poppins')], catalog)
    expect(out).toContain("import { Poppins } from 'next/font/google'")
    expect(out).toMatch(/displayFont = Poppins\(\{\n {2}subsets: \['latin'\],\n {2}weight: \['600', '700'\],/)
  })

  it('keeps the template face for a family next/font cannot load, so the build never fails', () => {
    expect(applyFonts(source, [brandFont('primary', 'Brand Sans Pro')], catalog)).toBe(source)
    const out = applyFonts(source, [brandFont('primary', 'Brand Sans Pro'), brandFont('secondary', 'Oswald')], catalog)
    expect(out).toContain("import { Barlow, Oswald } from 'next/font/google'")
  })
})
