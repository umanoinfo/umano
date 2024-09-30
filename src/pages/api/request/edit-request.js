import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditFormRequest')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
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
  const id = request._id;

  const selectedRequest = await client
    .db()
    .collection('requests')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })
  if (!selectedRequest) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

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
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: newRequest })
}
