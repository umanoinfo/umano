import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'
import axios from 'axios'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  // const token = await getToken({ req })
  // const myUser = await client.db().collection('users').findOne({ email: token.email })
  // if (!myUser || !myUser.permissions || !myUser.permissions.includes('ViewRole')) {
  //   res.status(401).json({ success: false, message: 'Not Auth' })
  // }

  // ---------------- Upload File ---------------------------------------------

  const uploadFile = await axios.post('https://umanu.blink-techno.com/api/upload', req.body).then(response => {
    // if (type == 'frontEmiratesID' || type == 'BackEmiratesID') setEmiratesIDLoading(false)
  })

  // const employee = req.body.data
  // if (!employee.firstName || !employee.lastName) {
  //   res.status(422).json({
  //     message: 'Invalid input'
  //   })
  //   return
  // }
  // employee.company_id = myUser.company_id
  // const newEmployee = await client.db().collection('employees').insertOne(employee)
  // const insertedEmployee = await client.db().collection('employees').findOne({ _id: newEmployee.insertedId })

  // ---------------- logBook ------------------------------------------

  // let log = {
  //   user_id: myUser._id,
  //   company_id: myUser.company_id,
  //   Module: 'Employee',
  //   Action: 'Add',
  //   Description: 'Add Employee (' + insertedEmployee.firstName + ' ' + insertedEmployee.lastName + ')',
  //   created_at : new Date().toISOString()
  // }
  // const newlogBook = await client.db().collection('logBook').insertOne(log)

  // res.status(201).json({ success: true, data: insertedEmployee })
}
