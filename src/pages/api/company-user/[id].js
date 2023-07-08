import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id },
    method
  } = req

  try {
    const client = await connectToDatabase()
    
    const user = await client
      .db()
      .collection('users')
      .aggregate([
        {
          $match: {
            _id: ObjectId(id),
            $and: [
              {
                $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }, { type: 'employee' }, { type: 'manager' }]
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

    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(400).json({ success: false })
  }
}
