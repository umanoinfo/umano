import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewAttendance')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const {
    query: { id },
    method
  } = req

  // try {
  const attendance = await client
    .db()
    .collection('attendances')
    .aggregate([
      {
        $match: {
          _id: ObjectId(id)
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_id: { $toObjectId: '$employee_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$employee_id'] } } }],
          as: 'employee_info'
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: attendance })
}
