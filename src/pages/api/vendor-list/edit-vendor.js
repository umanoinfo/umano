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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditVendor')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const vendor = req.body.data
  const id = vendor._id
  delete vendor._id

  if (!vendor.name || !vendor.email || !vendor.mobile) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  const currentvendor = await client.db().collection('vendors').findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() });
  if (!currentvendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found' });
  }


  const updateVendor = await client
    .db()
    .collection('vendors')
    .updateOne({ _id: ObjectId(id) }, { $set: vendor }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Vendors',
    Action: 'Edit',
    Description: 'Edit vendor (' + vendor.name + ')',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: vendor })
}
