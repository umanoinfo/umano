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

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    Module: 'Permission',
    created_at: new Date()
  }

  if (user?.deleted_at) {
    const deletPermissions = await client
      .db()
      .collection('permissions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: null } }, { upsert: false })

    log.Action= 'Restore';
    log.Description =  'Restore Permission (' + selectedPermission.title + ') from group (' + selectedPermission.group + ')';
  } else {
    const deletPermissions = await client
      .db()
      .collection('permissions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })
      
    // const users = await client.db().collection('users').find({permissions: {}})
    
    log.Action = 'Delete';
    log.Description =  'Delete Permission (' + selectedPermission.title + ') from group (' + selectedPermission.group + ')';
  }


  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(200).json({ success: true, data: selectedPermission })
}
