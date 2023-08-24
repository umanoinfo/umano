import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'

export default async function handler(req, res) {
  const user = req.body.data
  const id = user._id
  user.email = user.email.toLowerCase();
  delete user._id
  user.permissions = []

  const client = await connectToDatabase()

  if (user.roles) {
    for (const role_id of user.roles) {
      const selectedRole = await client
        .db()
        .collection('roles')
        .aggregate([{ $match: { $and: [{ _id: ObjectId(role_id) }, { type: 'company' }] } }])
        .toArray()

      if (selectedRole && selectedRole[0] && selectedRole[0].permissions) {
        for (const permission of selectedRole[0].permissions) {
          if (!user.permissions.includes(permission)) {
            user.permissions.push(permission)
          }
        }
      }
    }
  }

  try {
    const newUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: user }, { upsert: false })

    const updatedUser = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(id) })

    res.status(200).json({ success: true, data: updatedUser })
  } catch (error) {
    res.status(400).json({ success: false })
  }
}
