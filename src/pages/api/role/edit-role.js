import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminEditRole')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -------------------

  const role = req.body.data
  const id = role._id
  delete role._id

  if (!role.title) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const newRole = await client
    .db()
    .collection('roles')
    .updateOne({ _id: ObjectId(id) }, { $set: role }, { upsert: false })

  const updatedRole = await client
    .db()
    .collection('roles')
    .findOne({ _id: ObjectId(id) })

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
    Module: 'Role',
    Action: 'Edit',
    Description: 'Edit role (' + role.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: users })
}
