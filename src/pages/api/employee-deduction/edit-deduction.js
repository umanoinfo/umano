import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployeeDeduction')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const employeeDeduction = req.body.data
  const id = employeeDeduction._id
  employeeDeduction.date = new Date(employeeDeduction.date)
  delete employeeDeduction._id

  if (
    !employeeDeduction.reason ||
    !employeeDeduction.employee_id ||
    !employeeDeduction.value ||
    !employeeDeduction.type
  ) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  const updateDeduction = await client
    .db()
    .collection('employeeDeductions')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeDeduction }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Deduction',
    Action: 'Edit',
    Description: 'Edit employee deduction (' + employeeDeduction.reason + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: employeeDeduction })
}
