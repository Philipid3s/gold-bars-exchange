import dbConnect from '../../../../lib/mongoose'
import GoldBar from '../../../../models/GoldBar'

function requireApiKey (req, res) {
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
