import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditPayrollDeduction')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const deduction = req.body.data
  if (!deduction.type || !deduction.title || (!deduction.fixedValue && !deduction.percentageValue)) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }

  deduction.company_id = myUser.company_id
  deduction.updated_at = new Date()
  const id = deduction._id
  delete deduction._id
  delete deduction.user_id
  deduction.user_id = myUser._id

  const newDeduction = await client
    .db()
    .collection('deductions')
    .updateOne({ _id: ObjectId(id) }, { $set: deduction }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Deduction',
    Action: 'Edit',
    Description: 'Edit deduction (' + deduction.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: newDeduction })
}
