import dbConnect from '../../../../lib/mongoose'
import GoldBar from '../../../../models/GoldBar'

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

  const origin = req.headers.origin
  const referer = req.headers.referer

  const candidate = origin || referer
  if (!candidate) return false

  try {
    const url = new URL(candidate)
    const normalized = `${url.protocol}//${url.host}`
    return allowList.includes(normalized)
  } catch {
    return false
  }
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

function guardWriteRequests (req, res) {
  if (!isWriteMethod(req)) return true
  if (!isAllowedOrigin(req)) {
    res.status(403).json({ message: 'Forbidden' })
    return false
  }
  return rateLimitWrite(req, res)
}

export default async function handler (req, res) {
  if (!guardWriteRequests(req, res)) return
  await dbConnect()

  const { id } = req.query

  if (req.method === 'GET') {
    const item = await GoldBar.findById(id).lean()
    if (!item) return res.status(404).json({ message: 'Not found' })
    return res.status(200).json(item)
  }

  if (req.method === 'PUT') {
    try {
      const updated = await GoldBar.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      }).lean()
      if (!updated) return res.status(404).json({ message: 'Not found' })
      return res.status(200).json(updated)
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Bad request' })
    }
  }

  if (req.method === 'DELETE') {
    const deleted = await GoldBar.findByIdAndDelete(id).lean()
    if (!deleted) return res.status(404).json({ message: 'Not found' })
    return res.status(200).json({ id })
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  return res.status(405).json({ message: 'Method not allowed' })
}
