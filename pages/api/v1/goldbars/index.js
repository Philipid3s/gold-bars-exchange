import dbConnect from '../../../../lib/mongoose'
import GoldBar from '../../../../models/GoldBar'

function requireApiKey (req, res) {
  if (req.method === 'GET') return true
  const required = process.env.API_KEY
  if (!required) return true
  const provided = req.headers['x-api-key']
  if (provided !== required) {
    res.status(401).json({ message: 'Unauthorized' })
    return false
  }
  return true
}

export default async function handler (req, res) {
  if (!requireApiKey(req, res)) return
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
