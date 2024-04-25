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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddEmployeeLeave')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  console.log(req.body.data)

  const employeeLeave = req.body.data
  if (
    !employeeLeave.reason ||
    !employeeLeave.employee_id ||
    !employeeLeave.date_from ||
    !employeeLeave.date_to ||
    !employeeLeave.type
  ) {
    return res.status(422).json({
      message: 'Invalid input'
    })

  }

  employeeLeave.company_id = myUser.company_id
  employeeLeave.user_id = myUser._id
  employeeLeave.created_at = new Date()
  employeeLeave.status = 'active'
  employeeLeave.date_from = new Date(employeeLeave.date_from )
  employeeLeave.date_to = new Date(employeeLeave.date_to )

  const newEmployeeLeave = await client.db().collection('employeeLeaves').insertOne(employeeLeave)

  const insertedLeave = await client.db().collection('employeeLeaves').findOne({ _id: newEmployeeLeave.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Leave',
    Action: 'Add',
    Description: 'Add Employee leave (' + insertedLeave.reason + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedLeave })
}
