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

  // -------------------- Token ----------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddPayroll')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const endOfService = req.body
  if (!endOfService.company_id || !endOfService.employee_id || !endOfService.idNo) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }
  endOfService.company_id = myUser.company_id
  endOfService.user_id = myUser._id
  endOfService.created_at = new Date().toISOString()()

  const newEndOfService = await client.db().collection('endOfServices').insertOne(endOfService)
  const insertedEndOfService = await client.db().collection('endOfServices').findOne({ _id: newEndOfService.insertedId })


  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'EndOfService',
    Action: 'Add',
    linked_id: insertedEndOfService._id,
    Description: 'Add End of service for employee (' + endOfService.name + ')',
    created_at: new Date().toISOString()()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: insertedEndOfService })
}


//