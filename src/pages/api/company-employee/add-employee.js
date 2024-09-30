//
import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ---------------------------------------------

  const employee = req.body.data
  if (!employee.firstName || !employee.lastName) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }
  employee.company_id = myUser.company_id
  employee.dateOfBirth = new Date(employee.dateOfBirth)
  employee.joiningDate = new Date(employee.joiningDate)

  const existsEmployee = await client.db().collection('employees').findOne({ idNo: employee.idNo, company_id: myUser.company_id });
  if (existsEmployee) {
    return res.status(400).json({ success: false, message: 'ID NO must be unique' });
  }

  // const myCompany = await client.db().collection('companies').findOne({ _id: ObjectId(myUser.company_id) })
  // console.log(myCompany.employeeID)
  // newIdNo = myCompany.employeeID.concat(employee.idNo); 

  const newEmployee = await client.db().collection('employees').insertOne(employee)
  const insertedEmployee = await client.db().collection('employees').findOne({ _id: newEmployee.insertedId })

  // ---------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee',
    Action: 'Add',
    Description: 'Add Employee (' + insertedEmployee.firstName + ' ' + insertedEmployee.lastName + ')',
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedEmployee })
}
