import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayrollDeduction')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const deduction = req.body.selectedDeduction
  const id = deduction._id
  delete deduction._id

  const selectedDeduction = await client
    .db()
    .collection('deductions')
    .findOne({ _id: ObjectId(id) })

  if (selectedDeduction && selectedDeduction.deleted_at) {
    const deleteDeduction = await client
      .db()
      .collection('deductions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Deduction',
      Action: 'Restore',
      Description: 'Restore deduction (' + selectedDeduction.no + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  } else {
    const deleteDeduction = await client
      .db()
      .collection('deductions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Deduction',
      Action: 'Delete',
      Description: 'Delete deduction (' + selectedDeduction.no + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedDeduction })
}
