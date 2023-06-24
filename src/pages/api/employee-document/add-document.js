import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddDocument')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const employeeDocument = req.body.data
  if (!employeeDocument.documentTitle) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }
  employeeDocument.company_id = myUser.company_id
  const newEmployeeDocument = await client.db().collection('employeeDocuments').insertOne(employeeDocument)
  const insertedEmployee = await client
    .db()
    .collection('employeeDocuments')
    .findOne({ _id: newEmployeeDocument.insertedId })

  // -------------------- LogBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee document',
    Action: 'Add',
    Description: 'Add Employee document (' + insertedEmployee.positionTitle + ')',
    created_at: new Date()
  }
  const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedEmployee })
}
