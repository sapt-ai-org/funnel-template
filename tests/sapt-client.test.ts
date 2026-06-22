import { describe, expect, it } from 'vitest'
import { createSaptClient, SaptApiError } from '../src/lib/sapt/client'

describe('createSaptClient', () => {
  it('sends ApiKey auth header', async () => {
    const calls: RequestInit[] = []
    const client = createSaptClient({
      apiKey: 'sapt_test',
      endpoint: 'https://api.example.test',
      fetchImpl: async (_url, init) => {
        calls.push(init ?? {})
        return new Response(JSON.stringify({ actorId: 'u_1', actorType: 'user', actorName: 'Ada' }))
      },
    })

    await client.getAuthMe()
    expect((calls[0]?.headers as Record<string, string>).Authorization).toBe('ApiKey sapt_test')
  })

  it('throws normalized API errors', async () => {
    const client = createSaptClient({
      apiKey: 'sapt_test',
      endpoint: 'https://api.example.test',
      fetchImpl: async () =>
        new Response(JSON.stringify({ error: { code: 'nope', message: 'Nope' } }), {
          status: 403,
        }),
    })

    await expect(client.getAuthMe()).rejects.toBeInstanceOf(SaptApiError)
  })
})
