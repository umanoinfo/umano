import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const selectedUser = req.body.selectedUser
  const id = selectedUser._id

  // try {
  const client = await connectToDatabase()

  const user = await client
    .db()
    .collection('users')
    .findOne({ _id: ObjectId(id) })

  if (user.deleted_at) {
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

  return res.status(200).json({ success: true, data: user })
}
