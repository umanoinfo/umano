import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteForm')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const form = req.body.selectedForm
  const id = form._id
  delete form._id

  const selectedForm = await client
    .db()
    .collection('forms')
    .findOne({ _id: ObjectId(id) })

  if (selectedForm && selectedForm.deleted_at) {
    const deleteForm = await client
      .db()
      .collection('forms')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Form',
      Action: 'Restore',
      Description: 'Restore Form (' + selectedForm.title + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  } else {
    const deleteForm = await client
      .db()
      .collection('forms')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Form',
      Action: 'Delete',
      Description: 'Delete form (' + selectedForm.title + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedForm })
}
