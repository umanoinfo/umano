import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayrollCompensation')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const request = req.body.selectedCompensation
  const id = request._id
  delete request._id

  const selectedCompensation = await client
    .db()
    .collection('compensations')
    .findOne({ _id: ObjectId(id) })

  if (selectedCompensation && selectedCompensation.deleted_at) {
    const deleteCompensation = await client
      .db()
      .collection('compensations')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Compensation',
      Action: 'Restore',
      Description: 'Restore compensation (' + selectedCompensation.no + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  } else {
    const deleteCompensation = await client
      .db()
      .collection('compensations')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Compensation',
      Action: 'Delete',
      Description: 'Delete compensation (' + selectedCompensation.no + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedCompensation })
}
