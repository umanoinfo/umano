import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -------------------

  const employeeSalary = req.body.data
  const id = employeeSalary._id
  delete employeeSalary._id

  employeeSalary.updated_at = new Date()
  employeeSalary.startChangeDate = new Date(employeeSalary.startChangeDate)

  // if (!employeeposition.positionTitle) {
  //   res.status(422).json({
  //     message: 'Invalid input'
  //   })
  //   return
  // }

  const updateSalary = await client
    .db()
    .collection('employeeSalaries')
    .updateOne({ _id: ObjectId(id) }, { $set: employeeSalary }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee Salary',
    Action: 'Edit',
    Description: 'Edit employee Salary (' + id + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employeeSalary })
}
