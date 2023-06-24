import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  // ---------------- Token ----------------

  const secret = process.env.NEXT_AUTH_SECRET
  const token = await getToken({ req: req, secret: secret, raw: true })
  if (!token) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete ----------------

  const selectedPermission = req.body.deleteValue
  const id = selectedPermission._id
  const client = await connectToDatabase()
  const user = await client
    .db()
    .collection('permissions')
    .findOne({ _id: ObjectId(id) })

  if (user.deleted_at) {
    const deletPermissions = await client
      .db()
      .collection('permissions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })
  } else {
    const deletPermissions = await client
      .db()
      .collection('permissions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
  }

  // ---------------- LogBook ----------------

  let log = {
    user_id: req.body.user._id,
    Module: 'Permission',
    Action: 'Delete',
    Description: 'Delete Permission (' + selectedPermission.title + ') from group (' + selectedPermission.group + ')',
    created_at: new Date()
  }
  const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(200).json({ success: true, data: selectedPermission })
}
