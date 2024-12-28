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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddPayrollAllowance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const compensation = req.body.data

  if (!compensation.type || !compensation.title || (!compensation.fixedValue && !compensation.percentageValue)) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  compensation.company_id = myUser.company_id
  compensation.user_id = myUser._id
  compensation.created_at = new Date().toISOString()
  compensation.status = 'active'

  const newCompensation = await client.db().collection('compensations').insertOne(compensation)

  const insertedCompensation = await client
    .db()
    .collection('compensations')
    .findOne({ _id: newCompensation.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Compensation',
    Action: 'Add',
    Description: 'Add compensation (' + insertedCompensation.title + ')',
    created_at: new Date().toISOString()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedCompensation })
}

//