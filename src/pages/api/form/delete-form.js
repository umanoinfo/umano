import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteForm')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const form = req.body.selectedForm
  const id = form._id
  delete form._id

  const selectedForm = await client
    .db()
    .collection('forms')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })

  if (!selectedForm) {
    return res.status(404).json({ success: false, message: 'Form not found' });
  }

  if (selectedForm && selectedForm.deleted_at) {
    const deleteForm = await client
      .db()
      .collection('forms')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Form',
      Action: 'Restore',
      Description: 'Restore Form (' + selectedForm.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteForm = await client
      .db()
      .collection('forms')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Form',
      Action: 'Delete',
      Description: 'Delete form (' + selectedForm.title + ')',
      created_at: new Date().toISOString()()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedForm })
}
