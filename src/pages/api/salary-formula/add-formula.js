import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

// ** Axios Imports
import axios from 'axios'

export default async function handler(req, res) {
  if (req.method != 'POST') {
    return res.status(405).json({ success: false, message: 'Method is not allowed' });
  }
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddPayrollFormula')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const formula = req.body.data

  if (!formula.title || !formula.type) {
    return res.status(422).json({
      message: 'Invalid input'
    })

  }

  formula.company_id = myUser.company_id
  formula.user_id = myUser._id
  formula.created_at = new Date().toISOString()()
  formula.status = 'active'

  const newFormula = await client.db().collection('salaryFormula').insertOne(formula)
  const insertedFormula = await client.db().collection('salaryFormula').findOne({ _id: newFormula.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Salary Formula',
    Action: 'Add',
    Description: 'Add Salary Formula (' + insertedFormula.title + ')',
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedFormula })
}

//