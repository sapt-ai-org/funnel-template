import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { parsePayload, verifySignature } from './revalidate'

const SECRET = 'app-key'
const body = JSON.stringify({
  event: 'content.published',
  projectId: 'p1',
  contentType: 'service',
  contentSlug: 'brakes-and-rotors',
  timestamp: '2026-09-10T12:00:00.000Z',
})
// How sapt-platform signs it: hex HMAC-SHA256 of the raw body, keyed with APP_KEY.
const signed = (text: string, secret = SECRET) => createHmac('sha256', secret).update(text).digest('hex')

describe('verifySignature', () => {
  it('accepts the signature Sapt sends', async () => {
    expect(await verifySignature(body, signed(body), SECRET)).toBe(true)
  })

  it('refuses a body changed after signing, another key, or no signature', async () => {
    expect(await verifySignature(body.replace('service', 'faq'), signed(body), SECRET)).toBe(false)
    expect(await verifySignature(body, signed(body, 'other-key'), SECRET)).toBe(false)
    expect(await verifySignature(body, null, SECRET)).toBe(false)
    expect(await verifySignature(body, '', SECRET)).toBe(false)
  })

  it('never verifies against an empty secret', async () => {
    expect(await verifySignature(body, signed(body, ''), '')).toBe(false)
  })
})

describe('parsePayload', () => {
  it('reads the fields Sapt sends', () => {
    expect(parsePayload(body)).toEqual({
      event: 'content.published',
      projectId: 'p1',
      contentType: 'service',
      contentSlug: 'brakes-and-rotors',
      timestamp: '2026-09-10T12:00:00.000Z',
    })
  })

  it('treats a missing slug as the whole type', () => {
    expect(parsePayload(JSON.stringify({ event: 'content.updated', projectId: 'p1', contentType: 'faq' }))?.contentSlug).toBe('*')
  })

  it('refuses anything that is not a Sapt content event', () => {
    expect(parsePayload('not json')).toBeNull()
    expect(parsePayload('null')).toBeNull()
    expect(parsePayload(JSON.stringify({ event: 'record.created', projectId: 'p1', contentType: 'faq' }))).toBeNull()
    expect(parsePayload(JSON.stringify({ event: 'content.updated', contentType: 'faq' }))).toBeNull()
    // The type becomes a cache tag, so only a plain slug gets through.
    expect(parsePayload(JSON.stringify({ event: 'content.updated', projectId: 'p1', contentType: '../x' }))).toBeNull()
    expect(parsePayload(JSON.stringify({ event: 'content.updated', projectId: 'p1', contentType: '' }))).toBeNull()
  })
})
