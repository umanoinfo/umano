import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ---------------- Token ----------------

  const token = await getToken({ req })

  const myUser = await client.db().collection('users').findOne({ email: token.email })

  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditDepartment')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // --------------------------------------------------------------

  const departmen = req.body.data
  const id = departmen._id

  if(departmen.parent == ""){
    departmen.parent =null
  }

  delete departmen._id

  if (!departmen.name) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  const newDepartmen = await client
    .db()
    .collection('departments')
    .updateOne({ _id: ObjectId(id) }, { $set: departmen }, { upsert: false })

  // ---------------- logBook ----------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Department',
    Action: 'ُEdit',
    Description: 'Edit department (' + departmen.name + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: departmen })
}
