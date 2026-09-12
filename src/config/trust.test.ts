import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { business } from './business'
import { scanForBannedWords } from './funnel'
import { resolveBadge, TRUST_PROGRAMS, type TrustProgram } from './trust'

describe('trust badges', () => {
  it('fills a catalog badge with the program’s own wording', () => {
    expect(resolveBadge({ program: 'aaa', url: 'https://aaa.com/x' })).toEqual({
      label: 'AAA Approved Auto Repair',
      detail: 'Inspected and approved by AAA',
      kind: 'membership',
      url: 'https://aaa.com/x',
      logo: (TRUST_PROGRAMS.aaa as TrustProgram).logo,
    })
  })

  it('takes a shop’s own detail over the default', () => {
    expect(resolveBadge({ program: 'napa', detail: '36 months, 36,000 miles, nationwide' }).detail).toBe(
      '36 months, 36,000 miles, nationwide'
    )
  })

  it('carries a custom badge, such as a local award, on its own words', () => {
    const b = resolveBadge({ program: 'custom', label: 'Lakewood Readers’ Choice 2025', detail: 'Voted by readers of the Lakewood Observer' })
    expect(b.label).toBe('Lakewood Readers’ Choice 2025')
  })

  it('makes no claim the ad reviewers pull', () => {
    const copy = Object.values(TRUST_PROGRAMS).flatMap((p) => [p.label, p.detail]).join(' ')
    expect(scanForBannedWords(copy)).toEqual([])
  })

  it('ships the template with no listing links, which would point at someone else’s shop', () => {
    expect(business.badges.every((b) => !b.url)).toBe(true)
  })

  it('has every catalog logo on disk, with the aspect its file actually has', () => {
    for (const [id, program] of Object.entries(TRUST_PROGRAMS) as [string, TrustProgram][]) {
      if (!program.logo) continue
      const file = path.join(process.cwd(), 'public', program.logo.src)
      expect(fs.existsSync(file), `${id}: ${program.logo.src} is missing`).toBe(true)
      let w: number, h: number
      if (file.endsWith('.png')) {
        // A PNG's size sits in its IHDR chunk, straight after the signature.
        const head = fs.readFileSync(file).subarray(16, 24)
        w = head.readUInt32BE(0)
        h = head.readUInt32BE(4)
      } else {
        const viewBox = fs.readFileSync(file, 'utf8').match(/<svg\b[^>]*viewBox="([^"]+)"/)?.[1]
        expect(viewBox, `${id}: an SVG mark needs a viewBox to size it`).toBeTruthy()
        ;[, , w, h] = viewBox!.split(/[\s,]+/).map(Number)
      }
      expect(Math.abs(w / h - program.logo.aspect), `${id}: aspect drifted from its file`).toBeLessThan(0.01)
    }
  })

  it('shows the BBB seal only linked to the shop’s BBB profile, as BBB requires', () => {
    expect(resolveBadge({ program: 'bbb' }).logo).toBeUndefined()
    expect(resolveBadge({ program: 'bbb', url: 'https://www.bbb.org/us/oh/x/profile/y' }).logo?.src).toBe('/badges/bbb.svg')
    // The untouched template shows it, so the design can be judged whole.
    expect(resolveBadge({ program: 'bbb' }, { template: true }).logo?.src).toBe('/badges/bbb.svg')
  })
})
