import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewPosition')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- View Roles ----------------------------------


  const positions = await client
    .db()
    .collection('positions')
    .find({
      company_id: myUser.company_id,
      $or: [{ deleted_at: null }, { deleted_at: { $exists: false } }]
    })
    .toArray()

  return res.status(200).json({ success: true, data: positions })
}
