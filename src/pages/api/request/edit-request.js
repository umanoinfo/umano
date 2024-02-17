import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditFormRequest')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const request = req.body.data
  if (!request.form_id || !request.content || !request.applicant_id) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  request.company_id = myUser.company_id
  request.updated_at = new Date()
  delete request._id
  delete request.user_id
  request.user_id = myUser._id

  const newRequest = await client
    .db()
    .collection('requests')
    .updateOne({ _id: ObjectId(id) }, { $set: request }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Request',
    Action: 'Edit',
    Description: 'Edit request (' + request.no + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: newRequest })
}
