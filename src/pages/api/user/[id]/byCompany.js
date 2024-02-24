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

  //   -------------------------- Get Users -------------------------------------

  const users = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          $and: [{ comany_id: id }, { $and: [{ $or: [{ deleted_at: { $exists: false } }, { deleted_at: null }] }] }]
        }
      },
      {
        $lookup: {
          from: 'roles',
          let: { userRoles: '$roles' },
          pipeline: [
            { $addFields: { string_id: { $toString: '$_id' } } },
            { $match: { $expr: { $in: ['$string_id', '$$userRoles'] } } }
          ],
          as: 'roles_info'
        }
      },
      {
        $sort: {
          created_at: -1
        }
      }
    ])
    .toArray()

  res.status(200).json({ success: true, data: users })
}
