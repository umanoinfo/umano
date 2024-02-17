import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  if (req.query.emailType == '') {
    req.query.emailType = ''
  }

  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.mailStatus) {
    req.query.mailStatus = ''
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewMail')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Get ------------------------------------------

  const events = await client
    .db()
    .collection('emails')

    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { user_id: myUser._id },
            {$or:[
              {subject: { $regex: req.query.q , '$options' : 'i' } },
              {user: { $regex: req.query.q , '$options' : 'i' } },
              {toUser: { $regex: req.query.q , '$options' : 'i' } }
            ]} ,
            { status: { $regex: req.query.mailStatus } },
            { type: { $regex: req.query.mailType } },
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
          let: { employee_id: { $toObjectId: '$employee_id' } },
          pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$employee_id'] } } }],
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

  res.status(200).json({ success: true, data: events })
}
