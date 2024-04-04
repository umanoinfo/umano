import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('ChangePassword')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const user = req.body.user
  const hashedPassword = await hashPassword(req.body.user.password)
  user.password = hashedPassword
  const id = req.body.user._id
  delete user._id

  try {
    
    const newUser = await client
      .db()
      .collection('users')
      .updateOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString()}, { $set: user }, { upsert: false })

    const updatedUser = await client
      .db()
      .collection('users')
      .findOne({ _id: ObjectId(id) ,company_id: myUser.company_id.toString()})

    return res.status(200).json({ success: true, data: user })
  } catch (error) {
    return res.status(400).json({ success: false })
  }
}
