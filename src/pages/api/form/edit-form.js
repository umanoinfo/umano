import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditForm')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const form = req.body.data

  if (!form.title || !form.version || !form.type) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  const id = form._id
  delete form._id

  const updateForm = await client
    .db()
    .collection('forms')
    .updateOne({ _id: ObjectId(id) }, { $set: form }, { upsert: false })

  const insertedForm = await client
    .db()
    .collection('forms')
    .findOne({ _id: ObjectId(id) })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Form',
    Action: 'Edit',
    Description: 'Edit Form (' + updateForm.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedForm })
}
