import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if(req.method != 'POST'){
    return res.status(405).json({success: false , message: 'Method is not allowed'});
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ---------------------------------------------

  const employeeSalary = req.body.data
  employeeSalary.created_at = new Date()
  employeeSalary.startChangeDate = new Date(employeeSalary.startChangeDate)

  employeeSalary.company_id = myUser.company_id
  const newEmployeeSalary = await client.db().collection('employeeSalaries').insertOne(employeeSalary)
  
  const insertedEmployeeSalary = await client
    .db()
    .collection('employeeSalaries')
    .findOne({ _id: newEmployeeSalary.insertedId })

  // ---------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Salary',
    Action: 'Add',
    Description: 'Add Employee salary (' + employeeSalary.employee_id + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedEmployeeSalary })
}

//