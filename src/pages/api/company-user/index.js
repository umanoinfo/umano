import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {


  // -------------------- Token ---------------------

  // const token = await getToken({req})

  // if (!token || !token.user || !token.user.permissions.includes('AdminViewUser')) {
  //   res.status(401).json({ success: false, message: 'Not Auth' })
  // }

  try {
    if (!req.query.userStatus) {
      req.query.userStatus = ''
    }
    if (!req.query.type) {
      req.query.type = ''
    }
    if (!req.query.q) {
      req.query.q = ''
    }
    const client = await connectToDatabase()
    
    const users = await client
      .db()
      .collection('users')
      .aggregate([
        {
          $match: {
            $and: [
              { $or: [{ type: 'employee' }, { type: 'manager' }] },
              { status: { $regex: req.query.userStatus } },
              { type: { $regex: req.query.type } },
              { name: { $regex: req.query.q } },
              { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
            ]
          }
        },
        {
          $lookup: {
            from: 'companies',
            let: { company_id: { $toObjectId: '$company_id' } },
            pipeline: [
              { $addFields: { company_id: '$_id' } },
              { $match: { $expr: { $eq: ['$company_id', '$$company_id'] } } }
            ],
            as: 'company_info'
          }
        },
        {
          $sort: {
            created_at: -1
          }
        }
      ])
      .toArray()
    res.status(200).json({ success: true, data: users })
  } catch (error) {
    res.status(400).json({ success: false })
  }
}
