import { describe, expect, it } from 'vitest'
import manifest from '../../sapt.manifest.json'
import { landingCopy, landingSpec, scanForBannedWords } from './funnel'

describe('landing + funnel spec', () => {
  it('all visitor-facing copy contains no banned words', () => {
    // A shop's ad is pulled for the unsupportable claim, not the boring one.
    expect(scanForBannedWords(landingCopy(landingSpec))).toEqual([])
  })

  it('scanForBannedWords flags banned words case-insensitively', () => {
    expect(scanForBannedWords('The CHEAPEST guaranteed instant fix')).toEqual(
      expect.arrayContaining(['guaranteed', 'cheapest', 'instant'])
    )
  })

  it('flags a multi-word claim, which is where the superlatives hide', () => {
    expect(scanForBannedWords('Voted best in town')).toEqual(['best in town'])
  })

  it('ends in a contact step asking for a name and a phone number, which the booking API requires', () => {
    const steps = landingSpec.funnel.steps
    const last = steps[steps.length - 1]
    expect(last.kind).toBe('contact')
    if (last.kind === 'contact') {
      expect(last.fields.map((field) => field.id)).toEqual(expect.arrayContaining(['name', 'phone']))
    }
  })

  it('stays short: no more than two fields to type', () => {
    const typed = landingSpec.funnel.steps.flatMap((s) => (s.kind === 'contact' ? s.fields : []))
    expect(typed.length).toBeLessThanOrEqual(2)
  })

  it('asks consent to text as well as call, since the shop texts', () => {
    expect(landingSpec.funnel.legal).toMatch(/text/i)
    expect(landingSpec.funnel.legal).toMatch(/STOP/)
  })

  it('has a legal/consent line for compliance', () => {
    expect(landingSpec.funnel.legal && landingSpec.funnel.legal.length).toBeTruthy()
  })

  it('offers only answers the CRM has a choice for, so a booking never lands with an unknown value', () => {
    const schema = manifest.objectTypes[0].schema as Record<string, { schema: { options: { choices?: { id: string }[] } } }>
    for (const step of landingSpec.funnel.steps) {
      if (step.kind !== 'choice' || !schema[step.id]) continue
      const known = (schema[step.id].schema.options.choices ?? []).map((c) => c.id)
      for (const option of step.options) expect(known, `${step.id}: ${option.id}`).toContain(option.id)
    }
  })

  it('lets a customer say it in their own words under Other', () => {
    const issue = landingSpec.funnel.steps.find((s) => s.id === 'issue')
    const other = issue?.kind === 'choice' ? issue.options.find((o) => o.id === 'other') : undefined
    expect(other?.input).toBeDefined()
  })
})
