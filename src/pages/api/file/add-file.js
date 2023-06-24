import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'
import axios from 'axios'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!token) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Add File ---------------------------------------------

  const file = req.body.data
  if (!file.linked_id || !file.name) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }

  file.company_id = myUser.company_id
  const newFile = await client.db().collection('files').insertOne(file)
  // const insertedEmployee = await client.db().collection('employees').findOne({ _id: newEmployee.insertedId })

  // ---------------- LogBook ------------------------------------------

  // let log = {
  //   user_id: myUser._id,
  //   company_id: myUser.company_id,
  //   Module: 'Employee',
  //   Action: 'Add',
  //   Description: 'Add Employee (' + insertedEmployee.firstName + ' ' + insertedEmployee.lastName + ')',
  //   created_at: new Date()
  // }
  // const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(201).json({ success: true, data: req.body.formData })
}
