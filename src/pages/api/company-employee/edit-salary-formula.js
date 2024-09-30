import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }

  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })

  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditEmployee')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }


  // ------------------ Edit -------------------

  const id = req.body.data._id

  if (!req.body.data._id || !req.body.data.salary_formula_id) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  const employee = await client
    .db()
    .collection('employees')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })

  if (!employee) {
    return res.status(404).json({ success: false, message: 'Employee not found' });
  }

  delete employee._id
  employee.salary_formula_id = req.body.data.salary_formula_id
  employee.deductions = req.body.data.deductions
  employee.compensations = req.body.data.compensations

  const updatEmployee = await client
    .db()
    .collection('employees')
    .updateOne({ _id: ObjectId(id) }, { $set: employee }, { upsert: false })

  // ------------------ logBook -------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Employee',
    Action: 'Edit',
    Description:
      'Edit employee salary formula (' +
      employee.firstName +
      ' ' +
      employee.lastName +
      ') to shift (' +
      req.body.data.salary_formula_id +
      ')',
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: employee })
}
