import { describe, expect, it } from 'vitest'
import { buildLeadRecordData } from '../src/lib/funnel/normalize'

describe('buildLeadRecordData', () => {
  it('normalizes email and removes empty optional fields', () => {
    const data = buildLeadRecordData({
      name: 'Ada Lovelace',
      email: 'ADA@EXAMPLE.COM',
      phone: '',
      company: '',
      message: '',
      answers: { goal: 'Launch' },
    })

    expect(data.email).toBe('ada@example.com')
    expect(data.phone).toBeUndefined()
    expect(data.answers).toEqual({ goal: 'Launch' })
  })
})
