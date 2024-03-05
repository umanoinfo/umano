import { ObjectId } from 'mongodb'
import { getToken } from 'next-auth/jwt'
import { connectToDatabase } from 'src/configs/dbConnect'

export default async function handler(req, res) {
  const client = await connectToDatabase()

  // -------------------- Token --------------------------------------------------

  const token = await getToken({ req })
  const myUser = await client.db().collection('users').findOne({ email: token.email })
  if (!myUser || !myUser.permissions || !myUser.permissions.includes('DeleteAttendance')) {
    return res.status(401).json({ success: false, message: 'Not Auth' })
  }

  // ---------------- Delete --------------------

  const attendance = req.body.selectedAttendance
  const id = attendance._id
  delete attendance._id

  const selectedAttendance = await client
    .db()
    .collection('attendances')
    .findOne({ _id: ObjectId(id) })

  if (selectedAttendance && selectedAttendance.deleted_at) {
    const deleteAttendance = await client
      .db()
      .collection('attendances')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: '' } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Attendance',
      Action: 'Restore',
      Description: 'Restore attendance (' + selectedAttendance.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  } else {
    const deleteAttendance = await client
      .db()
      .collection('attendances')
      .updateOne({ _id: ObjectId(id) }, { $set: { deleted_at: new Date() } }, { upsert: false })

    // ---------------- logBook ----------------

    let log = {
      user_id: myUser._id,
      company_id: myUser.company_id,
      Module: 'Attendance',
      Action: 'Delete',
      Description: 'Delete attendance (' + selectedAttendance.no + ')',
      created_at: new Date()
    }
    const newlogBook = await client.db().collection('logBook').insertOne(log)
  }

  return res.status(201).json({ success: true, data: selectedAttendance })
}
