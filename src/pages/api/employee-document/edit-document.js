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
  delete employeeDocument._id

  if (!employeeDocument.documentTitle) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }

  const updatePosition = await client
    .db()
    .collection('employeeDocuments')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeDocument }, { upsert: false })

  // ------------------ LogBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee document',
    Action: 'Edit',
    Description: 'Edit employee document (' + employeeDocument.positionTitle + ')',
    created_at: new Date()
  }
  const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(201).json({ success: true, data: employeeDocument })
}
