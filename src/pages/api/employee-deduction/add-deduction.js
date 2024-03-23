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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployeeDeduction')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const employeeDeduction = req.body.data
  if (
    !employeeDeduction.reason ||
    !employeeDeduction.employees ||
    !employeeDeduction.value ||
    !employeeDeduction.type
  ) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  const emp_array = employeeDeduction.employees

  delete employeeDeduction.employees
  emp_array.map(async (empId, index) => {
    let newEmp = {}
    newEmp = { ...employeeDeduction }
    newEmp.employee_id = empId
    newEmp.company_id = myUser.company_id
    newEmp.user_id = myUser._id
    newEmp.created_at = new Date()
    newEmp.status = 'active'
    newEmp.date = new Date(newEmp.date)

    const newEmployeeDeduction = await client.db().collection('employeeDeductions').insertOne(newEmp)

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
  })

  return res.status(201).json({ success: true, data: employeeDeduction })
}
