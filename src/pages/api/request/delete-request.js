import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteFormRequest')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const request = req.body.selectedFormRequest
  const id = request._id
  delete request._id

  const selectedRequest = await client
    .db()
    .collection('requests')
    .findOne({ _id: ObjectId(id) , company_id: myUser.company_id.toString()})
  if(!selectedRequest){
    return res.status(404).json({success: false, message: 'Request not found'});
  }

  if (selectedRequest && selectedRequest.deleted_at) {
    const deleteRequest = await client
      .db()
      .collection('requests')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Request',
      Action: 'Restore',
      Description: 'Restore request (' + selectedRequest.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteRequest = await client
      .db()
      .collection('requests')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Request',
      Action: 'Delete',
      Description: 'Delete request (' + selectedRequest.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedRequest })
}
