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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteEmployeeDeduction')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const employeeDeduction = req.body.selectedDeduction
  const id = employeeDeduction._id
  delete employeeDeduction._id

  const selectedDeduction = await client
    .db()
    .collection('employeeDeductions')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })
  if (!selectedDeduction) {
    return res.status(404).json({ success: false, message: 'Deduction not found' });
  }

  if (selectedDeduction && selectedDeduction.deleted_at) {
    const deletePosition = await client
      .db()
      .collection('employeeDeductions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee Deduction',
      Action: 'Restore',
      Description: 'Restore employee deduction (' + selectedDeduction.reason + ')',
      created_at: new Date().toISOString()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deletePosition = await client
      .db()
      .collection('employeeDeductions')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee Deduction',
      Action: 'Delete',
      Description: 'Delete employee deduction (' + selectedDeduction.reason + ')',
      created_at: new Date().toISOString()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedDeduction })
}
