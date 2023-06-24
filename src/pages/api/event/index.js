import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  if (req.query.eventType == '') {
    req.query.eventType = []
  }

  if (!req.query.q) {
    req.query.q = ''
  }
  if (!req.query.eventStatus) {
    req.query.eventStatus = ''
  }

  if (req.query.eventType != '') {
    let arr = req.query.eventType.split(',')
    req.query.eventType = arr
  }

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewEvent')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------- Post ------------------------------------------

  const events = await client
    .db()
    .collection('events')
    .aggregate([
      {
        $match: {
          $or: [
            {
              $and: [
                { company_id: myUser.company_id },
                { user_id: myUser._id },
                { title: { $regex: req.query.q } },
                { status: { $regex: req.query.eventStatus } },
                { type: { $in: req.query.eventType } },
                { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
              ]
            },
            {
              $and: [
                { company_id: myUser.company_id },
                { users: { $elemMatch: { $eq: myUser._id.toString() } } },
                { title: { $regex: req.query.q } },
                { status: { $regex: req.query.eventStatus } },
                { type: { $in: req.query.eventType } },
                { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }
              ]
            }
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
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: events })
}
