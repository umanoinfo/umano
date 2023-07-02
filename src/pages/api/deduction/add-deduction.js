import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

// ** Axios Imports
import axios from 'axios'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddPayrollDeduction')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const deduction = req.body.data

  if (!deduction.type || !deduction.title || (!deduction.fixedValue && !deduction.percentageValue)) {
    res.status(422).json({
      message: 'Invalid input'
    })
    
    return
  }

  deduction.company_id = myUser.company_id
  deduction.user_id = myUser._id
  deduction.created_at = new Date()
  deduction.status = 'active'

  const newDeduction = await client.db().collection('deductions').insertOne(deduction)
  const insertedDeduction = await client.db().collection('deductions').findOne({ _id: newDeduction.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Deduction',
    Action: 'Add',
    Description: 'Add deduction (' + insertedDeduction.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)
  res.status(201).json({ success: true, data: insertedDeduction })
}
