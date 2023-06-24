import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditPayrollFormula')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const formula = req.body.data
  const id = formula._id
  if (!formula.title || !formula.type) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
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

  // -------------------------- LogBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Salary Formula',
    Action: 'Edit',
    Description: 'Edit salary formula (' + formula.title + ')',
    created_at: new Date()
  }
  const newLogBook = await client.db().collection('LogBook').insertOne(log)

  res.status(201).json({ success: true, data: newFormula })
}
