import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  

  const {
    query: { id },
    method
  } = req

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewAttendance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }


  const attendance = await client
    .db()
    .collection('attendances')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id),
          company_id: myUser.company_id.toString()
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: { $toObjectId: '$employee_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$employee_id'] } } } , 
            { $match: { $or: [ {deleted_at: {$exists: false } } , {deleted_at: null }]  }},
        ],
          as: 'employee_info'
        }
      }
    ])
    .toArray()

  return res.status(200).json({ success: true, data: attendance })
}
