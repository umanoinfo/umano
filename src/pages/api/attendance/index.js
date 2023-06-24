import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  let fromDate = new Date().setHours(0, 0, 0, 0)
  let toDate = new Date().setHours(23, 59, 59, 999)

  if (!req.query.employee_no) {
    req.query.employee_no = ''
  }
  if (req.query.fromDate) {
    fromDate = new Date(req.query.fromDate).setHours(0, 0, 0, 0)
  }
  if (req.query.toDate) {
    toDate = new Date(req.query.toDate).setHours(23, 59, 59, 999)
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewAttendance')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ---------------------------------------------------

  const attendances = await client
    .db()
    .collection('attendances')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            {
              date: {
                $gt: new Date(fromDate),
                $lte: new Date(toDate)
              }
            },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { employee_no: { $toString: '$employee_no' } },
          pipeline: [{ $match: { $expr: { $eq: ['$idNo', '$$employee_no'] } } }],
          as: 'employee_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: attendances })
}
