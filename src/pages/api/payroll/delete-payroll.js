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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeletePayroll')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const payroll = req.body.selectedPayroll
  const id = payroll._id
  delete payroll._id

  const selectedPayroll = await client
    .db()
    .collection('payrolls')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })

  if (!selectedPayroll) {
    return res.status(404).json({ success: false, message: 'Payroll not found' });
  }

  if (selectedPayroll && selectedPayroll.deleted_at) {
    const deletePayroll = await client
      .db()
      .collection('payrolls')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Payroll',
      Action: 'Restore',
      Description: 'Restore payroll (' + selectedPayroll.name + ')',
      created_at: new Date().toISOString()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletePayroll = await client
      .db()
      .collection('payrolls')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Payroll',
      Action: 'Delete',
      Description: 'Delete payroll (' + selectedPayroll.name + ')',
      created_at: new Date().toISOString()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedPayroll })
}
