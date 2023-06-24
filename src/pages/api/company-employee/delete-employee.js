import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }
  // ---------------- Delete --------------------

  const employee = req.body.selectedEmployee
  const id = employee._id
  delete employee._id

  const selectedEmployee = await client
    .db()
    .collection('employees')
    .findOne({ _id: ObjectId(id) })

  if (selectedEmployee && selectedEmployee.deleted_at) {
    const deleteEmployee = await client
      .db()
      .collection('employees')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee',
      Action: 'Restore',
      Description: 'Restore employee (' + selectedEmployee.firstName + ' ' + selectedEmployee.lastName + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  } else {
    const deleteEmployee = await client
      .db()
      .collection('employees')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- LogBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Employee',
      Action: 'Delete',
      Description: 'Delete employee (' + selectedEmployee.firstName + ' ' + selectedEmployee.lastName + ')',
      created_at: new Date()
    }
    const newLogBook = await client.db().collection('LogBook').insertOne(log)
  }

  res.status(201).json({ success: true, data: selectedEmployee })
}
