import { ObjectId } from 'mongodb'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'
import { getToken } from 'next-auth/jwt'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddUser')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  const user = req.body.data
  if (!user.email || !user.password || !user.name || !user.type || !user.email.includes('@')) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }


  const creatingUser = await client.db().collection('users').findOne({ email: user.email })
  if (creatingUser) {
    res.status(402).json({ success: false, message: 'There is user has same email' })
    
    return
  }

  const hashedPassword = await hashPassword(user.password)
  user.password = hashedPassword

  user.email = user.email.toLowerCase();
  
  const newUser = await client.db().collection('users').insertOne(user)
  const insertedUser = await client.db().collection('users').findOne({ _id: newUser.insertedId })
  res.status(201).json({ success: true, data: insertedUser })
}
