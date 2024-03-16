import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'
import { ObjectId } from 'mongodb'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })

  const myUser = await client.db().collection('users').findOne({ email: token.email })

  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewDepartment')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------------- Get Departments -----------------------------------------

  if (!req.query.q) {
    req.query.q = ''
  }

  const departments = await client
    .db()
    .collection('departments')
    .aggregate([
      {
        $match: {
          $and: [
            { name: { $regex: req.query.q , '$options' : 'i' } },
            { company_id: myUser.company_id },
          ]
        }
      },
      {
        $lookup: {
          from: 'employees',
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

    return res.status(200).json({ success: true, data: departments })
}
