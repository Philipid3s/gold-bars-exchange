import { afterEach, describe, expect, it } from 'vitest'
import { guardWriteRequests } from '../../lib/apiGuard'

function mockRes () {
  return {
    statusCode: 200,
    body: null,
    status (code) {
      this.statusCode = code
      return this
    },
    json (payload) {
      this.body = payload
      return this
    }
  }
}

function writeReq (headers) {
  return {
    method: 'POST',
    headers,
    socket: { remoteAddress: '127.0.0.1' }
  }
}

describe('guardWriteRequests', () => {
  const previousApiKey = process.env.API_KEY

  afterEach(() => {
    if (previousApiKey === undefined) delete process.env.API_KEY
    else process.env.API_KEY = previousApiKey
  })

  it('allows same-origin browser writes without a client API key', () => {
    process.env.API_KEY = 'server-only-key'
    const res = mockRes()
    const allowed = guardWriteRequests(writeReq({
      host: '72.62.254.69:3000',
      origin: 'http://72.62.254.69:3000'
    }), res)

    expect(allowed).toBe(true)
    expect(res.statusCode).toBe(200)
  })

  it('rejects cross-origin writes that do not present the server API key', () => {
    process.env.API_KEY = 'server-only-key'
    const res = mockRes()
    const allowed = guardWriteRequests(writeReq({
      host: '72.62.254.69:3000',
      origin: 'https://evil.example'
    }), res)

    expect(allowed).toBe(false)
    expect(res.statusCode).toBe(401)
  })

  it('rejects writes with no origin when the server API key is set and not sent', () => {
    process.env.API_KEY = 'server-only-key'
    const res = mockRes()
    const allowed = guardWriteRequests(writeReq({
      host: '72.62.254.69:3000'
    }), res)

    expect(allowed).toBe(false)
    expect(res.statusCode).toBe(401)
  })

  it('allows same-origin writes that only send a matching Referer', () => {
    process.env.API_KEY = 'server-only-key'
    const res = mockRes()
    const allowed = guardWriteRequests(writeReq({
      host: 'localhost:3000',
      referer: 'http://localhost:3000/'
    }), res)

    expect(allowed).toBe(true)
  })

  it('allows writes with no origin when no server API key is configured', () => {
    delete process.env.API_KEY
    const res = mockRes()
    const allowed = guardWriteRequests(writeReq({
      host: 'localhost:3000'
    }), res)

    expect(allowed).toBe(true)
  })

  it('allows cross-origin writes that present the server API key', () => {
    process.env.API_KEY = 'server-only-key'
    const res = mockRes()
    const allowed = guardWriteRequests(writeReq({
      host: '72.62.254.69:3000',
      origin: 'https://partner.example',
      'x-api-key': 'server-only-key'
    }), res)

    expect(allowed).toBe(true)
  })
})
