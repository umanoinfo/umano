import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminViewUser')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------------------------------------------

  const users = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          $or: [
            {$and: [{ type: 'manager' }, { $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }],},
            {$and: [{type: 'admin' }, {email:'fake@company.com'} ] },
          ]
        }
      },
      {
        $sort: {
          name: -1
        }
      }
    ])
    .toArray()
  
  res.status(200).json({ success: true, data: users })
}
