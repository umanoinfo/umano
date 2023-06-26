import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const { method } = req

  // ---------------- Token ----------------

  const secret = process.env.NEXT_AUTH_SECRET
  const token = await getToken({ req: req, secret: secret, raw: true })
  if (!token) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Edit ----------------

  const permission = req.body.data
  const id = permission._id
  const oldTitle = req.body.oldTitle.replace(/\s/g, '')
  delete permission._id

  if (!permission.title || !permission.alias) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }
  const client = await connectToDatabase()

  const newPermission = await client
    .db()
    .collection('permissions')
    .updateOne({ _id: ObjectId(id) }, { $set: permission }, { upsert: false })
  const updatedPermission = await client
    .db()
    .collection('permissions')
    .findOne({ _id: ObjectId(id) })

  // -------------------- update Role ---------------------------------------

  const roles = await client
    .db()
    .collection('roles')
    .aggregate([
      {
        $match: {
          permissions: { $elemMatch: { $eq: oldTitle } }
        }
      }
    ])
    .toArray()

  for (const role of roles) {
    role.permissions.push(permission.title.replace(/\s/g, ''))
    const index = role.permissions.indexOf(oldTitle)
    if (index > -1) {
      role.permissions.splice(index, 1)
    }
    const role_id = role._id
    delete role._id

    const updatedRole = await client
      .db()
      .collection('roles')
      .updateOne({ _id: ObjectId(role_id) }, { $set: role }, { upsert: false })
  }

  // -------------------- update User ---------------------------------------

  const users = await client
    .db()
    .collection('users')
    .aggregate([
      {
        $match: {
          permissions: { $elemMatch: { $eq: oldTitle } }
        }
      }
    ])
    .toArray()

  for (const user of users) {
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

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    Module: 'Permission',
    Action: 'Edit',
    Description: 'Update Permission (' + permission.title + ') group (' + permission.group + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: updatedPermission })
}
