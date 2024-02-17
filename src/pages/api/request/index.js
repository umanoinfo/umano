import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  if (!req.query.no) {
    req.query.no = ''
  }
  if (!req.query.requestStatus) {
    req.query.requestStatus = ''
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewFormRequest')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ---------------------------------------------------



  const requests = await client
    .db()
    .collection('requests')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },

            // { no: { $regex: req.query.q , '$options' : 'i' } },
            { status: { $regex: req.query.requestStatus } },
            { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
          ]
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { user_id: { $toObjectId: '$user_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$user_id'] } } }],
          as: 'user_info'
        }
      },
      {
        $lookup: {
          from: 'employees',
          let: { applicant_id: { $toObjectId: '$applicant_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$applicant_id'] } } }],
          as: 'applicant_info'
        }
      },
      {
        $lookup: {
          from: 'forms',
          let: { form_id: { $toObjectId: '$form_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$form_id'] } } }, { $project: { title: 1, version: 1 } }],
          as: 'form_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: requests })
}
