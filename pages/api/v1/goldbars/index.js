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

  if (req.method === 'GET') {
    const limit = Math.min(Number(req.query.limit) || 50, 200)
    const offset = Math.max(Number(req.query.offset) || 0, 0)
    const items = await GoldBar.find().skip(offset).limit(limit).lean()
    const total = await GoldBar.countDocuments()
    return res.status(200).json({ items, total, limit, offset })
  }

  if (req.method === 'POST') {
    try {
      const created = await GoldBar.create(req.body)
      return res.status(201).json(created)
    } catch (err) {
      return res.status(400).json({ message: err.message || 'Bad request' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  return res.status(405).json({ message: 'Method not allowed' })
}
