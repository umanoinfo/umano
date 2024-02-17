import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // ------------------------------- Token -------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('EditAttendance')) {
    res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ------------------------------- Edit -------------------------------------

  const attendance = req.body.data
  if (!attendance.date || !attendance.timeIn ||  !attendance.timeOut || !attendance.employee_no) {
    res.status(422).json({
      message: 'Invalid input'
    })

    return
  }

  attendance.company_id = myUser.company_id
  attendance.updated_at = new Date()
  const id = attendance._id
  delete attendance._id
  delete attendance.user_id
  attendance.user_id = myUser._id
  attendance.timeIn = new Date('2000-01-01 ' + attendance.timeIn + ' UTC').toISOString().substr(11, 8)
  attendance.timeOut = new Date('2000-01-01 ' + attendance.timeOut + ' UTC').toISOString().substr(11, 8)
  attendance.date = new Date(attendance.date)

  const newAttendance = await client
    .db()
    .collection('attendances')
    .updateOne({ _id: ObjectId(id) }, { $set: attendance }, { upsert: false })

  // -------------------------- logBook ---------------------------

  let log = {
    user_id: myUser._id,
    company_id: myUser.company_id,
    Module: 'Attendance',
    Action: 'Edit',
    Description: 'Edit attendance (' + attendance.no + ')',
    created_at: new Date()
  }
  const newlogBook = await client.db().collection('logBook').insertOne(log)

  res.status(201).json({ success: true, data: newAttendance })
}
