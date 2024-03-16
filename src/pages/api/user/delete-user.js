import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminDeleteUser')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------------- Delete -----------------------------

  const selectedUser = req.body.selectedUser
  const id = selectedUser._id

  const user = await client
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(id) })

  if (user?.deleted_at) {
    const deletUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })
  } else {
    const deletUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
  }

  // ---------------- logBook ----------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'User',
    Action: 'Delete',
    Description: 'Delete user (' + selectedUser.name + ')',
    created_at: new Date()
  }

  return res.status(200).json({ success: true, data: user })
}
