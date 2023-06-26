import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  // ---------------- Token ----------------

  const secret = process.env.NEXT_AUTH_SECRET
  const token = await getToken({ req: req, secret: secret, raw: true })
  if (!token) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ----------------

  const permission = req.body.data
  permission.user = token.user
  if (!permission.title || !permission.alias) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }
  const client = await connectToDatabase()
  const newPermission = await client.db().collection('permissions').insertOne(permission)
  const insertedPermissio = await client.db().collection('permissions').findOne({ _id: newPermission.insertedId })

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    Module: 'Permission',
    Action: 'Add',
    Description: 'Add permission (' + insertedPermissio.title + ') to group (' + insertedPermissio.group + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedPermissio })
}
