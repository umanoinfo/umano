import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  if (!req.query.companyStatus) {
    req.query.companyStatus = ''
  }
  if (!req.query.type) {
    req.query.type = ''
  }
  if (!req.query.q) {
    req.query.q = ''
  }

  const client = await connectToDatabase()
  
  const companies = await client
    .db()
    .collection('companies')
    .aggregate([
      {
        $match: {
          $and: [{ $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }]
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { user_id: { $toObjectId: '$user_id' } },
          pipeline: [{ $addFields: { user_id: '$_id' } }, { $match: { $expr: { $eq: ['$user_id', '$$user_id'] } } }],
          as: 'user_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: companies })
}
