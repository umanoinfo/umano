import { ObjectId } from 'mongodb'
// import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'

export default async function handler(req, res) {
  const { method } = req

  //   const token = await getToken({ req })
  //   if (!token) {
  //     res.status(401).json({ success: false, message: 'Not Auth' })
  //   }

  const user = req.body.data
  if (!user.email || !user.password || !user.name || !user.type || !user.email.includes('@')) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }
  const hashedPassword = await hashPassword(user.password)
  user.password = hashedPassword
  const client = await connectToDatabase()
  const newUser = await client.db().collection('users').insertOne(user)
  const insertedUser = await client.db().collection('users').findOne({ _id: newUser.insertedId })
  res.status(201).json({ success: true, data: insertedUser })
}
