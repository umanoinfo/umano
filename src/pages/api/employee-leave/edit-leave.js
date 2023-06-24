import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployeeLeave')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeeLeave = req.body.data
  const id = employeeLeave._id
  delete employeeLeave._id

  if (
    !employeeLeave.reason ||
    !employeeLeave.employee_id ||
    !employeeLeave.date_from ||
    !employeeLeave.date_to ||
    !employeeLeave.type
  ) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const updateLeave = await client
    .db()
    .collection('employeeLeaves')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeLeave }, { upsert: false })

  // ------------------ LogBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Leave',
    Action: 'Edit',
    Description: 'Edit employee leave (' + employeeLeave.reason + ')',
    created_at: new Date()
  }
  const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(201).json({ success: true, data: employeeLeave })
}
