import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ---------------------------------------------

  const employee = req.body.data
  if (!employee.firstName || !employee.lastName) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }
  employee.company_id = myUser.company_id
  employee.dateOfBirth = new Date(employee.dateOfBirth)
  employee.joiningDate = new Date(employee.joiningDate)

  const newEmployee = await client.db().collection('employees').insertOne(employee)
  const insertedEmployee = await client.db().collection('employees').findOne({ _id: newEmployee.insertedId })

  // ---------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee',
    Action: 'Add',
    Description: 'Add Employee (' + insertedEmployee.firstName + ' ' + insertedEmployee.lastName + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedEmployee })
}
