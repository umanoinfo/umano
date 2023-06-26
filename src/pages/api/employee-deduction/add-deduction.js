import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployeeDeduction')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const employeeDeduction = req.body.data
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

  employeeDeduction.company_id = myUser.company_id
  employeeDeduction.user_id = myUser._id
  employeeDeduction.created_at = new Date()
  employeeDeduction.status = 'active'
  employeeDeduction.date = new Date(employeeDeduction.date)

  const newEmployeeDeduction = await client.db().collection('employeeDeductions').insertOne(employeeDeduction)

  const insertedDeduction = await client
    .db()
    .collection('employeeDeductions')
    .findOne({ _id: newEmployeeDeduction.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Deductions',
    Action: 'Add',
    Description: 'Add Employee deductions (' + insertedDeduction.reason + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedDeduction })
}
