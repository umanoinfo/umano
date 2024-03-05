import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteDocument')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }
  
  // ---------------- Delete --------------------

  const employeeDocument = req.body.selectedDocument
  const id = employeeDocument._id
  delete employeeDocument._id

  const selectedDocument = await client
    .db()
    .collection('employeeDocuments')
    .findOne({ _id: ObjectId(id) })

  if (selectedDocument && selectedDocument.deleted_at) {
    const deletePosition = await client
      .db()
      .collection('employeeDocuments')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee document',
      Action: 'Restore',
      Description: 'Restore employee document (' + selectedDocument.positionTitle + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletePosition = await client
      .db()
      .collection('employeeDocuments')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee document',
      Action: 'Delete',
      Description: 'Delete employee document (' + selectedDocument.positionTitle + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedDocument })
}
