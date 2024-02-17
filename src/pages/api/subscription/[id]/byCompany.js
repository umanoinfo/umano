import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const {
    query: { id }
  } = req
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewRole')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  //   ---------------------------------------------------------------

  const subscriptions = await client
    .db()
    .collection('subscriptions')
    .aggregate([
      {
        $match: {
          $and: [{ company_id: id }, { $and: [{ $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }] }]
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: subscriptions })
}
