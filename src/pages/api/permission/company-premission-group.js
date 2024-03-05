import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req
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
          $and: [{ type: 'company' }, { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }]
        }
      },

      { $group: { _id: '$group', permissions: { $push: '$$ROOT' } } },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()
    
return res.status(200).json({ success: true, data: permissions })
}
