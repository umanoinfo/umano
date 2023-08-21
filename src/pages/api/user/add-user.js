import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'
import { hashPassword } from 'src/configs/auth'

export default async function handler(req, res) {
  const { method } = req

  const client = await connectToDatabase()

  // ---------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AdminAddUser')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------------- Change Password ---------------------------------

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

  const newUser = await client.db().collection('users').insertOne(user)
  const insertedUser = await client.db().collection('users').findOne({ _id: newUser.insertedId })

  // ---------------- logBook ----------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'User',
    Action: 'Add',
    Description: 'Add user (' + insertedUser.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedUser })
}
