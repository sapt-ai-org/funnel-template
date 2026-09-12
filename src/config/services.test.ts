import { describe, expect, it } from 'vitest'
import manifest from '../../sapt.manifest.json'
import { business } from './business'
import { landingSpec, scanForBannedWords, stepsFor } from './funnel'
import { CATALOG_SLUGS, serviceCopy, serviceCopyText } from './services'
import { slugify } from '@/lib/cms'

const issueChoices = (() => {
  const types = (manifest as { objectTypes?: { slug: string; schema: Record<string, unknown> }[] }).objectTypes ?? []
  const appointmentRequest = types.find((t) => t.slug === 'appointment_request')
  const issue = appointmentRequest?.schema.issue as { schema: { options: { choices: { id: string }[] } } } | undefined
  return issue?.schema.options.choices.map((c) => c.id) ?? []
})()

describe('service page defaults', () => {
  it('say nothing an ad reviewer would pull', () => {
    expect(scanForBannedWords(serviceCopyText())).toEqual([])
  })

  it('cover every service on the template’s Google list with its own copy', () => {
    for (const name of business.services) {
      const copy = serviceCopy(slugify(name), name)
      expect(copy.signs.length, name).toBeGreaterThan(0)
      expect(copy.faqs.length, name).toBeGreaterThan(0)
    }
  })

  it('still give a service nobody wrote copy for a complete, true page', () => {
    const copy = serviceCopy('diesel-repair', 'Diesel repair')
    expect(copy.summary).toContain('Diesel repair')
    expect(copy.includes.length).toBeGreaterThanOrEqual(3)
    expect(copy.issue).toBeUndefined()
  })

  it('give every service at least five answered questions, the generic page included', () => {
    const pages = [
      ...CATALOG_SLUGS.map((slug) => ({ slug, copy: serviceCopy(slug, slug) })),
      { slug: 'generic', copy: serviceCopy('diesel-repair', 'Diesel repair') },
    ]
    for (const { slug, copy } of pages) {
      expect(copy.faqs.length, slug).toBeGreaterThanOrEqual(5)
      for (const f of copy.faqs) {
        expect(f.q.trim(), slug).not.toBe('')
        expect(f.a.trim(), `${slug}: ${f.q}`).not.toBe('')
      }
    }
  })

  it('never put the same question on two service pages, which would compete with itself in search', () => {
    const pages = [
      ...CATALOG_SLUGS.map((slug) => serviceCopy(slug, slug)),
      serviceCopy('diesel-repair', 'Diesel repair'),
      serviceCopy('fleet-service', 'Fleet service'),
    ]
    const questions = pages.flatMap((c) => c.faqs.map((f) => f.q.toLowerCase()))
    const repeated = questions.filter((q, i) => questions.indexOf(q) !== i)
    expect(repeated).toEqual([])
  })

  it('write a generic service’s name into its questions the way a sentence would', () => {
    const qs = serviceCopy('diesel-repair', 'Diesel repair').faqs.map((f) => f.q)
    expect(qs[0]).toBe('How much does diesel repair cost?')
    expect(serviceCopy('bmw-service', 'BMW service').faqs[0].q).toBe('How much does BMW service cost?')
  })

  it('only ever answer the skipped question with a choice the CRM has', () => {
    expect(issueChoices.length).toBeGreaterThan(0)
    for (const name of business.services) {
      const { issue } = serviceCopy(slugify(name), name)
      if (issue) expect(issueChoices, name).toContain(issue)
    }
  })
})

describe('stepsFor', () => {
  const flow = landingSpec.funnel

  it('asks every step when the booking did not start on a service page', () => {
    expect(stepsFor(flow)).toEqual(flow.steps)
    expect(stepsFor(flow, null)).toEqual(flow.steps)
  })

  it('skips the question a service page has already answered, and nothing else', () => {
    const steps = stepsFor(flow, { slug: 'pre-purchase-inspection', name: 'Pre-purchase inspection' })
    expect(steps.map((s) => s.id)).toEqual(flow.steps.filter((s) => s.id !== 'issue').map((s) => s.id))
    // Still ends on the contact step the booking API needs.
    expect(steps[steps.length - 1].kind).toBe('contact')
  })
})
