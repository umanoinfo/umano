import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditPayrollFormula')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const formula = req.body.data
  const id = formula._id
  if (!formula.title || !formula.type) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  const selectedFormula = await client
    .db()
    .collection('salaryFormula')
    .findOne({ _id: ObjectId(id), company_id: myUser.company_id.toString() })

  if (!selectedFormula) {
    return res.status(404).json({ success: false, message: 'Payroll not found' });
  }

  formula.company_id = myUser.company_id
  formula.updated_at = new Date()
  delete formula._id
  delete formula.user_id
  formula.user_id = myUser._id

  const newFormula = await client
    .db()
    .collection('salaryFormula')
    .updateOne({ _id: ObjectId(id) }, { $set: formula }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Salary Formula',
    Action: 'Edit',
    Description: 'Edit salary formula (' + formula.title + ')',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: newFormula })
}
