import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'

export default async function handler(req, res) {
  const user = req.body.user
  const hashedPassword = await hashPassword(req.body.user.password)
  user.password = hashedPassword
  const id = req.body.user._id
  delete user._id

  try {
    const client = await connectToDatabase()
    
    const newUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) }, { $set: user }, { upsert: false })

    const updatedUser = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(id) })

    res.status(200).json({ success: true, data: user })
  } catch (error) {
    res.status(400).json({ success: false })
  }
}
