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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayrollAllowance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const request = req.body.selectedCompensation
  const id = request._id
  delete request._id

  const selectedCompensation = await client
    .db()
    .collection('compensations')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })
  if (!selectedCompensation) {
    return res.status(404).json({ success: false, message: 'Compensation not found' });
  }

  if (selectedCompensation && selectedCompensation.deleted_at) {
    const deleteCompensation = await client
      .db()
      .collection('compensations')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Compensation',
      Action: 'Restore',
      Description: 'Restore compensation (' + selectedCompensation.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteCompensation = await client
      .db()
      .collection('compensations')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    await client.db().collection('employees').updateMany({ compensations: id } , { $pull: {compensations: id} });


    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Compensation',
      Action: 'Delete',
      Description: 'Delete compensation (' + selectedCompensation.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedCompensation })
}
