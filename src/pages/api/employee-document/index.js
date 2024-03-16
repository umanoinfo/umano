import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  if (!req.query.q) {
    req.query.q = ''
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewDocument')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ------------------------------------------

  const employees = await client
    .db()
    .collection('employeeDocuments')
    .aggregate([
      {
        $match: {
          $and: [
            { employee_id: req.query.employeeId },
            { company_id: myUser.company_id },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'departments',
          let: { department_id: { $toObjectId: '$department_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$department_id'] } } }],
          as: 'department_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  return res.status(200).json({ success: true, data: employees })
}
