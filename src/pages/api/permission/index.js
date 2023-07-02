import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  // ---------------- Token ----------------

  const secret = process.env.NEXT_AUTH_SECRET
  const token = await getToken({ req: req, secret: secret, raw: true })
  if (!token) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  if (!req.query.q) {
    req.query.q = ''
  }

  const client = await connectToDatabase()
  
  const permissions = await client
    .db()
    .collection('permissions')
    .aggregate([
      {
        $match: {
          $and: [{ $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }]
        }
      },
      {
        $sort: {
          group: -1
        }
      }
    ])
    .toArray()
  res.status(200).json({ success: true, data: permissions })
}
