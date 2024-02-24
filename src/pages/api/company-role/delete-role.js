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

  // ---------------- Delete --------------------

  const role = req.body.selectedRole
  const id = role._id
  delete role._id

  const client = await connectToDatabase()

  const selectedRole = await client
    .db()
    .collection('roles')
    .findOne({ _id: ObjectId(id) })

  if (selectedRole && selectedRole.deleted_at) {
    const deletRole = await client
      .db()
      .collection('roles')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: req.body.user._id,
      company_id: req.body.user.company_id,
      Module: 'Role',
      Action: 'Delete',
      Description: 'Restore role (' + selectedRole.title + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletRole = await client
      .db()
      .collection('roles')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: req.body.user._id,
      company_id: req.body.user.company_id,
      Module: 'Role',
      Action: 'Delete',
      Description: 'Delete role (' + selectedRole.title + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  const users = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          roles: { $elemMatch: { $eq: id } }
        }
      }
    ])
    .toArray()

  for (const user of users) {
    var index = user.roles.indexOf(id)
    user.roles.splice(index, 1)

    user.permissions = []
    const user_id = user._id

    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .findOne({ _id: ObjectId(role_id) })
      if (selectedRole && selectedRole.permissions) {
        for (const permission of selectedRole.permissions) {
          if (!user.permissions.includes(permission)) {
            user.permissions.push(permission)
          }
        }
      }
    }
    
    delete user._id
    
    const updatedUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(user_id) }, { $set: user }, { upsert: false })
  }

  res.status(201).json({ success: true, data: users })
}
