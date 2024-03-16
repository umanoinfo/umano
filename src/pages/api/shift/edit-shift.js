import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditAttendanceShift')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const shift = req.body.data
  if (!shift.title || !shift.times) {
    return res.status(422).json({
      message: 'Invalid input'
    })
  }

  shift.company_id = myUser.company_id
  shift.updated_at = new Date()
  const id = shift._id
  delete shift._id
  delete shift.user_id
  shift.user_id = myUser._id

  const newShift = await client
    .db()
    .collection('shifts')
    .updateOne({ _id: ObjectId(id) }, { $set: shift }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Shift',
    Action: 'Edit',
    Description: 'Edit salary formula (' + shift.title + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  return res.status(201).json({ success: true, data: newShift })
}
