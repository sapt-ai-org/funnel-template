import { describe, expect, it } from 'vitest'
import { buildLeadMemoryContent } from '../src/lib/funnel/memory'

describe('buildLeadMemoryContent', () => {
  it('includes record id and answers', () => {
    const content = buildLeadMemoryContent(
      {
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        answers: { goal: 'Launch a funnel' },
      },
      'rec_123'
    )

    expect(content).toContain('rec_123')
    expect(content).toContain('Launch a funnel')
  })
})
