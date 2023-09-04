import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeeDocument = req.body.data

  const id = employeeDocument._id

  const document = await client.db().collection('employeeDocuments').findOne({_id: ObjectId(id) })

  const file = document.file
  delete document._id
  document.file = null

  const updateDocument = await client
    .db()
    .collection('employeeDocuments')
    .updateOne({ _id: ObjectId(id) }, { $set: document }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee document',
    Action: 'Delete File',
    Description: 'Delete file document (' + file + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: employeeDocument })
}
