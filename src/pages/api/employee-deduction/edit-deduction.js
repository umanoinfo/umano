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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployeeDeduction')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -----------------------------------------------

  const ded = await client
  .db()
  .collection('employeeDeductions')
  .findOne({ _id: ObjectId(id)  , company_id: myUser.company_id.toString()})

  if(!ded){
    return res.status(404).json({success: false, message: 'Deduction not found'});
  }


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
    return res.status(422).json({
      message: 'Invalid input'
    })
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

  return res.status(201).json({ success: true, data: employeeDeduction })
}
