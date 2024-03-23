import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req
  const client = await connectToDatabase()

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminViewUser')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  try {
    
    const user = await client
      .db()
      .collection('users')
      .aggregate([
        {
          $match: {
            _id: ObjectId(id),
            $and: [
              { $or: [{ type: 'admin' }, { type: 'manager' }] },
              {
                $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }, { type: 'admin' }, { type: 'manager' }]
              }
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
          $lookup: {
            from: 'roles',
            let: { userRoles: '$roles' },
            pipeline: [
              { $addFields: { string_id: { $toString: '$_id' } } },
              { $match: { $expr: { $in: ['$string_id', '$$userRoles'] } } }
            ],
            as: 'roles_info'
          }
        }
      ])
      .toArray()

    return res.status(200).json({ success: true, data: user })
  } catch (error) {
    return res.status(400).json({ success: false })
  }
}
