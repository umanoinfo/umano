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
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('AddAttendanceShift')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // -------------------- Insert ---------------------------------------------

  const shift = req.body.data

  if (!shift.title || !shift.times) {
    res.status(422).json({
      message: 'Invalid input'
    })
    return
  }

  shift.company_id = myUser.company_id
  shift.user_id = myUser._id
  shift.created_at = new Date()
  shift.status = 'active'

  const newShift = await client.db().collection('shifts').insertOne(shift)
  const insertedShift = await client.db().collection('shifts').findOne({ _id: newShift.insertedId })

  // -------------------- logBook ------------------------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Shift',
    Action: 'Add',
    Description: 'Add shift (' + insertedShift.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: insertedShift })
}
