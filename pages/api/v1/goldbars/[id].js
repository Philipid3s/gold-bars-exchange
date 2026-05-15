import dbConnect from '../../../../lib/mongoose'
import GoldBar from '../../../../models/GoldBar'
import { guardWriteRequests } from '../../../../lib/apiGuard'

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
        returnDocument: 'after',
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
    return res.status(200).json({ _id: id })
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
  return res.status(405).json({ message: 'Method not allowed' })
}
