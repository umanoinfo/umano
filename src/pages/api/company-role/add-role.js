import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {

  // ---------------- Token ----------------

  const secret = process.env.NEXT_AUTH_SECRET
  const token = await getToken({ req: req, secret: secret, raw: true })
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ----------------

  const role = req.body.data
  if (!role.title) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  role.permissions = role?.permissions?.filter((permission)=>{
    return !permission.includes('Admin');
  });
  const client = await connectToDatabase()
  const newRole = await client.db().collection('roles').insertOne(role)
  const insertedRole = await client.db().collection('roles').findOne({ _id: newRole.insertedId })

  // ---------------- logBook ----------------

  let log = {
    user_id: req.body.user._id,
    company_id: req.body.user.company_id,
    Module: 'Role',
    Action: 'Add',
    Description: 'Add role (' + insertedRole.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedRole })
}
