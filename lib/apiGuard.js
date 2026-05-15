const DEFAULT_ALLOWED_ORIGINS = [
  'http://72.62.254.69',
  'https://72.62.254.69',
  'http://72.62.254.69:3000',
  'https://72.62.254.69:3000',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
]

const writeRateWindowMs = 60_000
const writeRateLimit = Number(process.env.RATE_LIMIT_PER_MINUTE || 30)
const writeRateStore = new Map()

function getClientIp (req) {
  const header = req.headers['x-forwarded-for']
  if (typeof header === 'string' && header.length) return header.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

function isWriteMethod (req) {
  return req.method !== 'GET'
}

function isAllowedOrigin (req) {
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
  const allowList = allowed.length ? allowed : DEFAULT_ALLOWED_ORIGINS

  const candidate = req.headers.origin || req.headers.referer
  if (!candidate) return false

  try {
    const url = new URL(candidate)
    return allowList.includes(`${url.protocol}//${url.host}`)
  } catch {
    return false
  }
}

function hasValidApiKey (req) {
  const expected = process.env.API_KEY
  if (!expected) return false
  return req.headers['x-api-key'] === expected
}

function rateLimitWrite (req, res) {
  if (!isWriteMethod(req)) return true

  const now = Date.now()
  const ip = getClientIp(req)
  const entry = writeRateStore.get(ip) || { count: 0, resetAt: now + writeRateWindowMs }

  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + writeRateWindowMs
  }

  entry.count += 1
  writeRateStore.set(ip, entry)

  if (entry.count > writeRateLimit) {
    res.status(429).json({ message: 'Too many requests' })
    return false
  }

  return true
}

export function guardWriteRequests (req, res) {
  if (!isWriteMethod(req)) return true

  if (process.env.API_KEY) {
    if (!hasValidApiKey(req)) {
      res.status(401).json({ message: 'Unauthorized' })
      return false
    }
  } else if (!isAllowedOrigin(req)) {
    res.status(403).json({ message: 'Forbidden' })
    return false
  }

  return rateLimitWrite(req, res)
}
