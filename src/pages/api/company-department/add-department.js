import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  // ---------------- Token ----------------

  const token = await getToken({ req })

  const client = await connectToDatabase()
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddDepartment')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Insert ----------------

  const department = req.body.data
  if (!department.name) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }
  department.company_id = myUser.company_id
  if (department.parent == '') {
    delete department.parent
  }
  const newDepartment = await client.db().collection('departments').insertOne(department)
  const insertedDepartment = await client.db().collection('departments').findOne({ _id: newDepartment.insertedId })

  // ---------------- LogBook ----------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Department',
    Action: 'Add',
    Description: 'Add department (' + insertedDepartment.name + ')',
    created_at: new Date()
  }
  const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedDepartment })
}
