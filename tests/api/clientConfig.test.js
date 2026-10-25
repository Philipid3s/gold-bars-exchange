import { afterEach, describe, expect, it } from 'vitest'

const PUBLIC_CANARY = 'public-canary-must-not-leak'
const SERVER_CANARY = 'server-canary-must-not-leak'

describe('client config', () => {
  const previousPublic = process.env.NEXT_PUBLIC_API_KEY
  const previousServer = process.env.API_KEY

  afterEach(() => {
    if (previousPublic === undefined) delete process.env.NEXT_PUBLIC_API_KEY
    else process.env.NEXT_PUBLIC_API_KEY = previousPublic
    if (previousServer === undefined) delete process.env.API_KEY
    else process.env.API_KEY = previousServer
  })

  it('does not copy an API key into browser request headers', async () => {
    process.env.NEXT_PUBLIC_API_KEY = PUBLIC_CANARY
    process.env.API_KEY = SERVER_CANARY

    const configPath = require.resolve('../../config/config')
    delete require.cache[configPath]
    const { config } = require('../../config/config')

    const headers = config.jsonOptions.headers
    const serialized = JSON.stringify(config)
    expect(headers['x-api-key']).toBeUndefined()
    expect(serialized).not.toContain(PUBLIC_CANARY)
    expect(serialized).not.toContain(SERVER_CANARY)
  })
})
