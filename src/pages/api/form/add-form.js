import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddForm')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const form = req.body.data
  if (!form.title || !form.version || !form.type) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }
  form.company_id = myUser.company_id
  const newForm = await client.db().collection('forms').insertOne(form)
  const insertedForm = await client.db().collection('forms').findOne({ _id: newForm.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Form',
    Action: 'Add',
    Description: 'Add Form (' + insertedForm.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedForm })
}
