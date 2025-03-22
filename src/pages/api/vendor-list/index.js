import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })



  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewVendor')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- View -------------------------------

  if (!req.query.q) {
    req.query.q = ''
  }

  const users = await client
    .db()
    .collection('vendors')
    .aggregate([
      {
        $match: {
          $and: [
            { company_id: myUser.company_id },
            { name: { $regex: req.query.q, '$options': 'i' } },
            { email: { $ne: 'admin@admin.com' } },
            { $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }] }
          ]
        }
      },
      {
        $sort: {
          created_at: -1
        }
      },
    ])
    .toArray()

  return res.status(200).json({ success: true, data: users })
}
