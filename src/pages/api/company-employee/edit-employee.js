import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------ Edit -------------------

  const employee = req.body.data
  const id = employee._id
  delete employee._id
  employee.dateOfBirth = new Date(employee.dateOfBirth)

  if (!employee.firstName || !employee.lastName) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  const updatEmployee = await client
    .db()
    .collection('employees')
    .updateOne({ _id: ObjectId(id) }, { $set: employee }, { upsert: false })
    
  const getEmployee = await client
    .db()
    .collection('employees')
    .findOne({ _id: ObjectId(id) })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee',
    Action: 'Edit',
    Description: 'Edit employee (' + getEmployee.firstName + ' ' + getEmployee.lastName + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: getEmployee })
}
